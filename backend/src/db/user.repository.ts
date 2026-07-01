import type { User } from "@prisma/client";
import { Prisma, UserRole } from "@prisma/client";
import { prisma } from "./prisma.js";

export type CreateUserInput = {
	name: string;
	email: string;
	passwordHash: string;
	role?: UserRole;
	isDemo?: boolean;
	demoExpiresAt?: Date | null;
};

export async function findUserByEmail(email: string): Promise<User | null> {
	return prisma.user.findUnique({ where: { email } });
}

export async function findUserById(id: string): Promise<User | null> {
	return prisma.user.findUnique({ where: { id } });
}

export async function createUser(input: CreateUserInput): Promise<User> {
	return prisma.user.create({
		data: {
			name: input.name,
			email: input.email,
			passwordHash: input.passwordHash,
			role: input.role ?? UserRole.CUSTOMER,
			isDemo: input.isDemo ?? false,
			demoExpiresAt: input.demoExpiresAt ?? null,
		},
	});
}

export function isUniqueEmailViolation(error: unknown): boolean {
	if (
		!(error instanceof Prisma.PrismaClientKnownRequestError) ||
		error.code !== "P2002"
	) {
		return false;
	}

	const target = error.meta?.target;

	if (Array.isArray(target)) {
		return target.some((value) => String(value).includes("email"));
	}

	if (typeof target === "string") {
		return target.includes("email");
	}

	return true;
}
