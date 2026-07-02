import { type User, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { upsertAdminUser } from "../db/user.repository.js";

type AdminBootstrapInput = {
	name: string;
	email: string;
	password: string;
};

type AdminBootstrapDeps = {
	hashPassword: (password: string) => Promise<string>;
	upsertAdminUser: typeof upsertAdminUser;
};

const PASSWORD_HASH_ROUNDS = 12;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const defaultDeps: AdminBootstrapDeps = {
	hashPassword: (password) => bcrypt.hash(password, PASSWORD_HASH_ROUNDS),
	upsertAdminUser,
};

function normalizeEmail(email: string): string {
	return email.trim().toLowerCase();
}

export async function bootstrapAdminUser(
	input: AdminBootstrapInput,
	deps: AdminBootstrapDeps = defaultDeps,
): Promise<User> {
	const name = input.name.trim();
	const email = normalizeEmail(input.email);

	if (!name) {
		throw new Error("ADMIN_NAME fehlt oder ist leer");
	}

	if (!EMAIL_REGEX.test(email)) {
		throw new Error("ADMIN_EMAIL fehlt oder ist ungültig");
	}

	if (input.password.length < 12) {
		throw new Error("ADMIN_PASSWORD muss mindestens 12 Zeichen lang sein");
	}

	const passwordHash = await deps.hashPassword(input.password);

	return deps.upsertAdminUser({
		name,
		email,
		passwordHash,
		role: UserRole.ADMIN,
	});
}
