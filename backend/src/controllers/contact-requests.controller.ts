import type { NextFunction, Request, Response } from "express";
import { AppError } from "../lib/app-error.js";
import { createContactRequestForCustomer } from "../services/contact-request.service.js";

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

function parseCreateContactRequestBody(body: unknown): {
	type: string;
	message: string;
} | null {
	if (!isRecord(body)) {
		return null;
	}

	if (typeof body.type !== "string" || typeof body.message !== "string") {
		return null;
	}

	return {
		type: body.type,
		message: body.message,
	};
}

export async function createContactRequestController(
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> {
	const userId = parseAuthUserId(req.auth);

	if (!userId) {
		fail(next, 401, "Nicht eingeloggt");
		return;
	}

	const input = parseCreateContactRequestBody(req.body);

	if (!input) {
		fail(next, 400, "Ungültiger Request Body");
		return;
	}

	try {
		const contactRequest = await createContactRequestForCustomer({
			userId,
			type: input.type,
			message: input.message,
		});

		res.status(201).json({ contactRequest });
	} catch (error) {
		next(error);
	}
}
