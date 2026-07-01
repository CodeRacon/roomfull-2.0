import type { CookieOptions, Request, Response } from "express";
import { env } from "../config/env.js";

export const AUTH_COOKIE_NAME = "roomfull_access_token";

const ACCESS_SESSION_DURATION_MS = 60 * 60 * 1000;

function getAuthCookieOptions(): CookieOptions {
	return {
		httpOnly: true,
		secure: env.NODE_ENV === "production",
		sameSite: "lax",
		maxAge: ACCESS_SESSION_DURATION_MS,
		path: "/",
	};
}

export function setAuthCookie(res: Response, token: string): void {
	res.cookie(AUTH_COOKIE_NAME, token, getAuthCookieOptions());
}

export function clearAuthCookie(res: Response): void {
	res.clearCookie(AUTH_COOKIE_NAME, {
		httpOnly: true,
		secure: env.NODE_ENV === "production",
		sameSite: "lax",
		path: "/",
	});
}

export function readAuthCookie(req: Request): string | null {
	const cookieHeader = req.header("cookie");

	if (!cookieHeader) {
		return null;
	}

	for (const cookiePair of cookieHeader.split(";")) {
		const [rawName, ...rawValueParts] = cookiePair.trim().split("=");
		const name = rawName?.trim();

		if (name !== AUTH_COOKIE_NAME) {
			continue;
		}

		const rawValue = rawValueParts.join("=");

		if (!rawValue) {
			return null;
		}

		return decodeURIComponent(rawValue);
	}

	return null;
}
