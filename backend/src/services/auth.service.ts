import { randomUUID } from "node:crypto";
import type { User } from "@prisma/client";
import { UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
	createUser,
	findUserByEmail,
	findUserById,
	isUniqueEmailViolation,
} from "../db/user.repository.js";
import { AppError } from "../lib/app-error.js";
import { signAccessToken } from "../lib/jwt.js";
import { demoCustomerDataService } from "./demo-customer-data.service.js";

type RegisterInput = {
	name: string;
	email: string;
	password: string;
};

type LoginInput = {
	email: string;
	password: string;
};

type PublicUser = {
	id: string;
	name: string;
	email: string;
	role: User["role"];
	isDemo: boolean;
	demoExpiresAt: Date | null;
	createdAt: Date;
};

type AuthResponse = {
	token: string;
	user: PublicUser;
};

type DemoCustomerDeps = {
	createUser: typeof createUser;
	now: () => Date;
	populateDemoCustomerData: typeof demoCustomerDataService.populateDemoCustomerData;
};

const PASSWORD_HASH_ROUNDS = 12;
const INVALID_LOGIN_MESSAGE = "Ungültige Login-Daten";
const EMAIL_ALREADY_REGISTERED_MESSAGE = "E-Mail ist bereits registriert";
const DEMO_CUSTOMER_NAME = "Demo Customer";
const DEMO_CUSTOMER_EMAIL_PREFIX = "demo-visitor";
const DEMO_CUSTOMER_EMAIL_DOMAIN = "roomfull-demo.test";
const DEMO_SESSION_DURATION_MS = 24 * 60 * 60 * 1000;
const DEMO_CUSTOMER_EMAIL_SUFFIX_LENGTH = 8;

const defaultDemoCustomerDeps: DemoCustomerDeps = {
	createUser,
	now: () => new Date(),
	populateDemoCustomerData:
		demoCustomerDataService.populateDemoCustomerData.bind(
			demoCustomerDataService,
		),
};

function normalizeEmail(email: string): string {
	return email.trim().toLowerCase();
}

function createDemoCustomerEmail(): string {
	const suffix = randomUUID()
		.replaceAll("-", "")
		.slice(0, DEMO_CUSTOMER_EMAIL_SUFFIX_LENGTH);

	return `${DEMO_CUSTOMER_EMAIL_PREFIX}-${suffix}@${DEMO_CUSTOMER_EMAIL_DOMAIN}`;
}

export async function registerUser(
	input: RegisterInput,
): Promise<AuthResponse> {
	const name = input.name.trim();
	const email = normalizeEmail(input.email);

	if (name.length === 0) {
		throw new AppError(400, "Name darf nicht leer sein");
	}

	if (input.password.length < 8) {
		throw new AppError(400, "Passwort muss mindestens 8 Zeichen lang sein");
	}

	const existingUser = await findUserByEmail(email);

	if (existingUser) {
		throw new AppError(409, EMAIL_ALREADY_REGISTERED_MESSAGE);
	}

	const passwordHash = await bcrypt.hash(input.password, PASSWORD_HASH_ROUNDS);

	let createdUser: User;

	try {
		createdUser = await createUser({
			name,
			email,
			passwordHash,
		});
	} catch (error) {
		if (isUniqueEmailViolation(error)) {
			throw new AppError(409, EMAIL_ALREADY_REGISTERED_MESSAGE);
		}

		throw error;
	}

	return buildAuthResponse(createdUser);
}

export async function loginUser(input: LoginInput): Promise<AuthResponse> {
	const email = normalizeEmail(input.email);
	const existingUser = await findUserByEmail(email);

	if (!existingUser) {
		throw new AppError(401, INVALID_LOGIN_MESSAGE);
	}

	const isPasswordValid = await bcrypt.compare(
		input.password,
		existingUser.passwordHash,
	);

	if (!isPasswordValid) {
		throw new AppError(401, INVALID_LOGIN_MESSAGE);
	}

	return buildAuthResponse(existingUser);
}

export async function getCurrentUser(userId: string): Promise<PublicUser> {
	const user = await findUserById(userId);

	if (!user) {
		throw new AppError(404, "User wurde nicht gefunden");
	}

	return toPublicUser(user);
}

export async function createDemoCustomerSession(
	deps: DemoCustomerDeps = defaultDemoCustomerDeps,
): Promise<AuthResponse> {
	const now = deps.now();
	const expiresAt = new Date(now.getTime() + DEMO_SESSION_DURATION_MS);
	const passwordHash = await bcrypt.hash(randomUUID(), PASSWORD_HASH_ROUNDS);

	const demoCustomer = await deps.createUser({
		name: DEMO_CUSTOMER_NAME,
		email: createDemoCustomerEmail(),
		passwordHash,
		role: UserRole.CUSTOMER,
		isDemo: true,
		demoExpiresAt: expiresAt,
	});

	await deps.populateDemoCustomerData({ customerId: demoCustomer.id });

	return buildAuthResponse(demoCustomer);
}

function buildAuthResponse(user: User): AuthResponse {
	return {
		token: signAccessToken({
			userId: user.id,
			role: user.role,
		}),
		user: toPublicUser(user),
	};
}

function toPublicUser(user: User): PublicUser {
	return {
		id: user.id,
		name: user.name,
		email: user.email,
		role: user.role,
		isDemo: user.isDemo,
		demoExpiresAt: user.demoExpiresAt,
		createdAt: user.createdAt,
	};
}
