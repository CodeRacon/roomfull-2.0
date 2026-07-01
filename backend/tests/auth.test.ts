import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { type User, UserRole } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import { AUTH_COOKIE_NAME } from "../src/lib/auth-cookie.js";
import { signAccessToken } from "../src/lib/jwt.js";
import { requireAuth } from "../src/middleware/auth.middleware.js";
import { createDemoCustomerSession } from "../src/services/auth.service.js";

function buildUser(overrides: Partial<User>): User {
	const now = new Date("2026-07-01T10:00:00.000Z");

	return {
		id: "user-1",
		name: "Customer",
		email: "customer@example.com",
		passwordHash: "hash",
		role: UserRole.CUSTOMER,
		isDemo: false,
		demoExpiresAt: null,
		createdAt: now,
		updatedAt: now,
		...overrides,
	};
}

describe("Auth", () => {
	it("authenticates protected requests from the HttpOnly auth cookie", () => {
		const token = signAccessToken({
			userId: "customer-1",
			role: UserRole.CUSTOMER,
		});
		const request = {
			header: (name: string) =>
				name.toLowerCase() === "cookie"
					? `${AUTH_COOKIE_NAME}=${encodeURIComponent(token)}`
					: undefined,
		} as Request;
		const nextCalls: unknown[] = [];
		const next: NextFunction = (error?: unknown) => {
			nextCalls.push(error);
		};

		requireAuth(request, {} as Response, next);

		assert.deepEqual(nextCalls, [undefined]);
		assert.deepEqual(request.auth, {
			userId: "customer-1",
			role: UserRole.CUSTOMER,
		});
	});

	it("rejects protected requests without the auth cookie", () => {
		const token = signAccessToken({
			userId: "customer-1",
			role: UserRole.CUSTOMER,
		});
		const request = {
			header: (name: string) =>
				name.toLowerCase() === "authorization" ? `Bearer ${token}` : undefined,
		} as Request;
		const nextCalls: unknown[] = [];
		const next: NextFunction = (error?: unknown) => {
			nextCalls.push(error);
		};

		requireAuth(request, {} as Response, next);

		const error = nextCalls[0] as { statusCode: number; message: string };
		assert.equal(error.statusCode, 401);
		assert.equal(error.message, "Auth Cookie fehlt oder ist ungültig");
		assert.equal(request.auth, undefined);
	});

	it("creates a fresh Demo Customer Session as a normal Customer", async () => {
		const createdInputs: unknown[] = [];
		const populatedDemoCustomerIds: string[] = [];
		const now = new Date("2026-07-01T10:00:00.000Z");
		const expiresAt = new Date("2026-07-02T10:00:00.000Z");

		const authResponse = await createDemoCustomerSession({
			now: () => now,
			createUser: async (input) => {
				createdInputs.push(input);

				return buildUser({
					...input,
					id: "demo-customer-1",
					role: input.role ?? UserRole.CUSTOMER,
					isDemo: input.isDemo ?? false,
					demoExpiresAt: input.demoExpiresAt ?? null,
					createdAt: now,
					updatedAt: now,
				});
			},
			populateDemoCustomerData: async (input) => {
				populatedDemoCustomerIds.push(input.customerId);
			},
		});

		assert.equal(createdInputs.length, 1);
		assert.equal(authResponse.user.id, "demo-customer-1");
		assert.equal(authResponse.user.role, UserRole.CUSTOMER);
		assert.equal(authResponse.user.isDemo, true);
		assert.deepEqual(authResponse.user.demoExpiresAt, expiresAt);
		assert.equal(typeof authResponse.token, "string");

		const createdInput = createdInputs[0] as {
			email: string;
			isDemo: boolean;
			demoExpiresAt: Date;
		};

		assert.match(
			createdInput.email,
			/^demo-visitor-[0-9a-f]{8}@roomfull-demo\.test$/,
		);
		assert.equal(createdInput.isDemo, true);
		assert.deepEqual(createdInput.demoExpiresAt, expiresAt);
		assert.deepEqual(populatedDemoCustomerIds, ["demo-customer-1"]);
	});
});
