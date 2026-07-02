import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { type User, UserRole } from "@prisma/client";
import { bootstrapAdminUser } from "../src/services/admin-bootstrap.service.js";

function buildUser(overrides: Partial<User>): User {
	const now = new Date("2026-07-01T10:00:00.000Z");

	return {
		id: "admin-1",
		name: "Admin",
		email: "admin@example.com",
		passwordHash: "hash",
		role: UserRole.ADMIN,
		isDemo: false,
		demoExpiresAt: null,
		createdAt: now,
		updatedAt: now,
		...overrides,
	};
}

describe("Admin Bootstrap", () => {
	it("normalizes input and upserts an Admin without exposing the plain password", async () => {
		const upsertInputs: unknown[] = [];
		const admin = await bootstrapAdminUser(
			{
				name: "  Private Admin  ",
				email: "  ADMIN@Example.COM  ",
				password: "strong-password-1",
			},
			{
				hashPassword: async (password) => `hashed:${password.length}`,
				upsertAdminUser: async (input) => {
					upsertInputs.push(input);
					return buildUser(input);
				},
			},
		);

		assert.deepEqual(upsertInputs, [
			{
				name: "Private Admin",
				email: "admin@example.com",
				passwordHash: "hashed:17",
				role: UserRole.ADMIN,
			},
		]);
		assert.equal(admin.email, "admin@example.com");
		assert.equal(admin.passwordHash, "hashed:17");
	});

	it("fails clearly when required Admin secrets are missing or invalid", async () => {
		await assert.rejects(
			() =>
				bootstrapAdminUser(
					{ name: "", email: "admin@example.com", password: "strong-pass-1" },
					{
						hashPassword: async () => {
							throw new Error("should not hash invalid input");
						},
						upsertAdminUser: async () => {
							throw new Error("should not persist invalid input");
						},
					},
				),
			/ADMIN_NAME fehlt oder ist leer/,
		);

		await assert.rejects(
			() =>
				bootstrapAdminUser(
					{ name: "Admin", email: "invalid", password: "strong-pass-1" },
					{
						hashPassword: async () => {
							throw new Error("should not hash invalid input");
						},
						upsertAdminUser: async () => {
							throw new Error("should not persist invalid input");
						},
					},
				),
			/ADMIN_EMAIL fehlt oder ist ungültig/,
		);

		await assert.rejects(
			() =>
				bootstrapAdminUser(
					{ name: "Admin", email: "admin@example.com", password: "short" },
					{
						hashPassword: async () => {
							throw new Error("should not hash invalid input");
						},
						upsertAdminUser: async () => {
							throw new Error("should not persist invalid input");
						},
					},
				),
			/ADMIN_PASSWORD muss mindestens 12 Zeichen lang sein/,
		);
	});
});
