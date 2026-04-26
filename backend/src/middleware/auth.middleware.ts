import type { UserRole } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import { AppError } from "../lib/app-error.js";
import { verifyAccessToken } from "../lib/jwt.js";

export function requireAuth(
	req: Request,
	_res: Response,
	next: NextFunction,
): void {
	const authorizationHeader = req.header("authorization");

	if (!authorizationHeader?.startsWith("Bearer ")) {
		next(new AppError(401, "Authorization Header fehlt oder ist ungültig"));
		return;
	}

	const token = authorizationHeader.replace("Bearer ", "").trim();

	try {
		req.auth = verifyAccessToken(token);
		next();
	} catch {
		next(new AppError(401, "Access Token ist ungültig oder abgelaufen"));
	}
}

export function requireRole(role: UserRole) {
	return (req: Request, _res: Response, next: NextFunction): void => {
		if (!req.auth) {
			next(new AppError(401, "Nicht authentifiziert"));
			return;
		}

		if (req.auth.role !== role) {
			next(new AppError(403, "Zugriff verweigert"));
			return;
		}

		next();
	};
}
