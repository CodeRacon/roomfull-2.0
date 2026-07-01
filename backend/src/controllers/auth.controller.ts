import type { NextFunction, Request, Response } from "express";
import { AppError } from "../lib/app-error.js";
import { clearAuthCookie, setAuthCookie } from "../lib/auth-cookie.js";
import {
	createDemoCustomerSession,
	getCurrentUser,
	loginUser,
	registerUser,
} from "../services/auth.service.js";

type RegisterBody = {
	name: string;
	email: string;
	password: string;
};

type LoginBody = {
	email: string;
	password: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INVALID_BODY_MESSAGE = "Ungültiger Request Body";
const UNAUTHORIZED_MESSAGE = "Nicht eingeloggt";

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

function fail(next: NextFunction, statusCode: number, message: string): void {
	next(new AppError(statusCode, message));
}

function parseAuthUserId(auth: Request["auth"]): string | null {
	const userId = auth?.userId?.trim() ?? "";
	return userId.length > 0 ? userId : null;
}

function parseRegisterBody(body: unknown): RegisterBody | null {
	if (!isRecord(body)) {
		return null;
	}

	const name = typeof body.name === "string" ? body.name.trim() : "";
	const email =
		typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
	const password = typeof body.password === "string" ? body.password : "";

	if (name.length === 0 || !EMAIL_REGEX.test(email) || password.length < 8) {
		return null;
	}

	return { name, email, password };
}

function parseLoginBody(body: unknown): LoginBody | null {
	if (!isRecord(body)) {
		return null;
	}

	const email =
		typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
	const password = typeof body.password === "string" ? body.password : "";

	if (!EMAIL_REGEX.test(email) || password.length === 0) {
		return null;
	}

	return { email, password };
}

export async function registerController(
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> {
	const input = parseRegisterBody(req.body);

	if (!input) {
		fail(next, 400, INVALID_BODY_MESSAGE);
		return;
	}

	try {
		const authResponse = await registerUser(input);
		setAuthCookie(res, authResponse.token);
		res.status(201).json({ user: authResponse.user });
	} catch (error) {
		next(error);
	}
}

export async function loginController(
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> {
	const input = parseLoginBody(req.body);

	if (!input) {
		fail(next, 400, INVALID_BODY_MESSAGE);
		return;
	}

	try {
		const authResponse = await loginUser(input);
		setAuthCookie(res, authResponse.token);
		res.status(200).json({ user: authResponse.user });
	} catch (error) {
		next(error);
	}
}

export async function meController(
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> {
	const userId = parseAuthUserId(req.auth);

	if (!userId) {
		fail(next, 401, UNAUTHORIZED_MESSAGE);
		return;
	}

	try {
		const user = await getCurrentUser(userId);
		res.status(200).json({ user });
	} catch (error) {
		next(error);
	}
}

export async function demoLoginController(
	_req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> {
	try {
		const authResponse = await createDemoCustomerSession();
		setAuthCookie(res, authResponse.token);
		res.status(201).json({ user: authResponse.user });
	} catch (error) {
		next(error);
	}
}

export function logoutController(_req: Request, res: Response): void {
	clearAuthCookie(res);
	res.status(204).end();
}
