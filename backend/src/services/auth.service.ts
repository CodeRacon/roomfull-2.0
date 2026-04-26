import type { User } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
	createUser,
	findUserByEmail,
	findUserById,
	isUniqueEmailViolation,
} from "../db/user.repository.js";
import { AppError } from "../lib/app-error.js";
import { signAccessToken } from "../lib/jwt.js";

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
	createdAt: Date;
};

type AuthResponse = {
	token: string;
	user: PublicUser;
};

const PASSWORD_HASH_ROUNDS = 12;
const INVALID_LOGIN_MESSAGE = "Ungültige Login-Daten";
const EMAIL_ALREADY_REGISTERED_MESSAGE = "E-Mail ist bereits registriert";

function normalizeEmail(email: string): string {
	return email.trim().toLowerCase();
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
		createdAt: user.createdAt,
	};
}
