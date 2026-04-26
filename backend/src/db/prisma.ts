import { PrismaClient } from "@prisma/client";

type GlobalWithPrisma = typeof globalThis & {
	__prisma?: PrismaClient;
};

const globalWithPrisma = globalThis as GlobalWithPrisma;

export const prisma = globalWithPrisma.__prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
	globalWithPrisma.__prisma = prisma;
}
