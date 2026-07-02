import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { UserRole } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import { AUTH_COOKIE_NAME } from "../src/lib/auth-cookie.js";
import { signAccessToken } from "../src/lib/jwt.js";
import { customerTeamsRouter } from "../src/routes/customer-teams.routes.js";

function createAuthCookie(userId: string, role: UserRole): string {
	const token = signAccessToken({ userId, role });
	return `${AUTH_COOKIE_NAME}=${encodeURIComponent(token)}`;
}

function runCustomerTeamsRouter(path: string, cookie: string): unknown[] {
	const nextCalls: unknown[] = [];
	const req = {
		baseUrl: "",
		header: (name: string) =>
			name.toLowerCase() === "cookie" ? cookie : undefined,
		method: "GET",
		originalUrl: path,
		url: path,
	} as Request;
	const res = {} as Response;
	const next: NextFunction = (error?: unknown) => {
		nextCalls.push(error);
	};

	customerTeamsRouter.handle(req, res, next);

	return nextCalls;
}

describe("Customer Teams Routing", () => {
	it("does not block later admin routes with the customer role guard", () => {
		const nextCalls = runCustomerTeamsRouter(
			"/admin/ping",
			createAuthCookie("admin-1", UserRole.ADMIN),
		);

		assert.deepEqual(nextCalls, [undefined]);
	});
});
