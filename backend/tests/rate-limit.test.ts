import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { NextFunction, Request, Response } from "express";
import { createRateLimitMiddleware } from "../src/middleware/rate-limit.middleware.js";

function buildRequest(ip: string): Request {
	return {
		ip,
		socket: { remoteAddress: ip },
	} as unknown as Request;
}

function runLimit(
	limit: ReturnType<typeof createRateLimitMiddleware>,
	req: Request,
): unknown {
	let nextError: unknown;
	const next: NextFunction = (error?: unknown) => {
		nextError = error;
	};

	limit(req, {} as Response, next);

	return nextError;
}

function getStatusCode(error: unknown): number | undefined {
	return typeof error === "object" &&
		error !== null &&
		"statusCode" in error &&
		typeof error.statusCode === "number"
		? error.statusCode
		: undefined;
}

describe("Rate Limit Middleware", () => {
	it("rejects requests after the configured limit is reached", () => {
		const limit = createRateLimitMiddleware({
			keyPrefix: "test",
			windowMs: 60_000,
			maxRequests: 2,
			message: "Too many requests",
			now: () => 1_000,
		});
		const req = buildRequest("203.0.113.10");

		assert.equal(runLimit(limit, req), undefined);
		assert.equal(runLimit(limit, req), undefined);

		const error = runLimit(limit, req) as { message: string };

		assert.equal(getStatusCode(error), 429);
		assert.equal(error.message, "Too many requests");
	});

	it("starts a fresh window after the previous window expires", () => {
		let now = 1_000;
		const limit = createRateLimitMiddleware({
			keyPrefix: "test",
			windowMs: 60_000,
			maxRequests: 1,
			message: "Too many requests",
			now: () => now,
		});
		const req = buildRequest("203.0.113.10");

		assert.equal(runLimit(limit, req), undefined);
		assert.equal(getStatusCode(runLimit(limit, req)), 429);

		now = 61_000;

		assert.equal(runLimit(limit, req), undefined);
	});

	it("tracks different client IPs independently", () => {
		const limit = createRateLimitMiddleware({
			keyPrefix: "test",
			windowMs: 60_000,
			maxRequests: 1,
			message: "Too many requests",
			now: () => 1_000,
		});

		assert.equal(runLimit(limit, buildRequest("203.0.113.10")), undefined);
		assert.equal(runLimit(limit, buildRequest("203.0.113.11")), undefined);
	});
});
