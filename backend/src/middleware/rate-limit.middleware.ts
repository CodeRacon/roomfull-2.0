import type { NextFunction, Request, Response } from "express";
import { AppError } from "../lib/app-error.js";

type RateLimitOptions = {
	windowMs: number;
	maxRequests: number;
	message: string;
	now?: () => number;
	keyPrefix?: string;
};

type RateLimitEntry = {
	count: number;
	resetAt: number;
};

function getClientKey(req: Request, keyPrefix: string): string {
	return `${keyPrefix}:${req.ip || req.socket.remoteAddress || "unknown"}`;
}

export function createRateLimitMiddleware(options: RateLimitOptions) {
	const hits = new Map<string, RateLimitEntry>();
	const now = options.now ?? Date.now;
	const keyPrefix = options.keyPrefix ?? "default";

	return (req: Request, _res: Response, next: NextFunction): void => {
		const currentTime = now();
		const key = getClientKey(req, keyPrefix);
		const entry = hits.get(key);

		if (!entry || entry.resetAt <= currentTime) {
			hits.set(key, {
				count: 1,
				resetAt: currentTime + options.windowMs,
			});
			next();
			return;
		}

		if (entry.count >= options.maxRequests) {
			next(new AppError(429, options.message));
			return;
		}

		entry.count += 1;
		next();
	};
}

export const authRateLimit = createRateLimitMiddleware({
	keyPrefix: "auth",
	windowMs: 15 * 60 * 1000,
	maxRequests: 20,
	message: "Zu viele Auth-Anfragen. Bitte versuche es später erneut.",
});

export const contactRequestRateLimit = createRateLimitMiddleware({
	keyPrefix: "contact-request",
	windowMs: 15 * 60 * 1000,
	maxRequests: 10,
	message: "Zu viele Kontaktanfragen. Bitte versuche es später erneut.",
});

export const bookingMutationRateLimit = createRateLimitMiddleware({
	keyPrefix: "booking-mutation",
	windowMs: 15 * 60 * 1000,
	maxRequests: 30,
	message: "Zu viele Buchungsaktionen. Bitte versuche es später erneut.",
});
