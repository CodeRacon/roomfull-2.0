import type { NextFunction, Request, Response } from "express";
import { AppError } from "../lib/app-error.js";
import {
	type CustomerTeamManagement,
	customerTeamManagement,
} from "../services/customer-team-management.js";

type CustomerTeamsControllerDependencies = {
	management: CustomerTeamManagement;
};

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

function parseAuthUserId(auth: Request["auth"]): string | null {
	const userId = auth?.userId?.trim() ?? "";
	return userId.length > 0 ? userId : null;
}

function parseCreateTeamBody(body: unknown): { name: string } | null {
	if (!isRecord(body) || typeof body.name !== "string") {
		return null;
	}

	return { name: body.name };
}

function parseCreateMemberBody(
	body: unknown,
): { name: string; email: string } | null {
	if (
		!isRecord(body) ||
		typeof body.name !== "string" ||
		typeof body.email !== "string"
	) {
		return null;
	}

	return { name: body.name, email: body.email };
}

function parseTeamId(params: Request["params"]): string | null {
	const rawTeamId = params.teamId;
	const teamId = typeof rawTeamId === "string" ? rawTeamId.trim() : "";
	return teamId.length > 0 ? teamId : null;
}

function parseMemberId(params: Request["params"]): string | null {
	const rawMemberId = params.memberId;
	const memberId = typeof rawMemberId === "string" ? rawMemberId.trim() : "";
	return memberId.length > 0 ? memberId : null;
}

export function createCustomerTeamsController(
	dependencies: CustomerTeamsControllerDependencies = {
		management: customerTeamManagement,
	},
) {
	const { management } = dependencies;

	return {
		async list(req: Request, res: Response, next: NextFunction): Promise<void> {
			const customerId = parseAuthUserId(req.auth);
			if (!customerId) {
				next(new AppError(401, "Nicht eingeloggt"));
				return;
			}

			try {
				const teams = await management.list({ customerId });

				res.status(200).json({ teams });
			} catch (error) {
				next(error);
			}
		},

		async getDetail(
			req: Request,
			res: Response,
			next: NextFunction,
		): Promise<void> {
			const customerId = parseAuthUserId(req.auth);
			if (!customerId) {
				next(new AppError(401, "Nicht eingeloggt"));
				return;
			}

			const teamId = parseTeamId(req.params);
			if (!teamId) {
				next(new AppError(400, "Ungültige Route-Parameter"));
				return;
			}

			try {
				const team = await management.getDetail({ customerId, teamId });

				res.status(200).json({ team });
			} catch (error) {
				next(error);
			}
		},

		async create(
			req: Request,
			res: Response,
			next: NextFunction,
		): Promise<void> {
			const customerId = parseAuthUserId(req.auth);
			if (!customerId) {
				next(new AppError(401, "Nicht eingeloggt"));
				return;
			}

			const input = parseCreateTeamBody(req.body);
			if (!input) {
				next(new AppError(400, "Ungültiger Request Body"));
				return;
			}

			try {
				const team = await management.create({
					customerId,
					name: input.name,
				});

				res.status(201).json({ team });
			} catch (error) {
				next(error);
			}
		},

		async addMember(
			req: Request,
			res: Response,
			next: NextFunction,
		): Promise<void> {
			const customerId = parseAuthUserId(req.auth);
			if (!customerId) {
				next(new AppError(401, "Nicht eingeloggt"));
				return;
			}

			const teamId = parseTeamId(req.params);
			if (!teamId) {
				next(new AppError(400, "Ungültige Route-Parameter"));
				return;
			}

			const input = parseCreateMemberBody(req.body);
			if (!input) {
				next(new AppError(400, "Ungültiger Request Body"));
				return;
			}

			try {
				const member = await management.addMember({
					customerId,
					teamId,
					name: input.name,
					email: input.email,
				});

				res.status(201).json({ member });
			} catch (error) {
				next(error);
			}
		},

		async updateMember(
			req: Request,
			res: Response,
			next: NextFunction,
		): Promise<void> {
			const customerId = parseAuthUserId(req.auth);
			if (!customerId) {
				next(new AppError(401, "Nicht eingeloggt"));
				return;
			}

			const teamId = parseTeamId(req.params);
			const memberId = parseMemberId(req.params);
			if (!teamId || !memberId) {
				next(new AppError(400, "Ungültige Route-Parameter"));
				return;
			}

			const input = parseCreateMemberBody(req.body);
			if (!input) {
				next(new AppError(400, "Ungültiger Request Body"));
				return;
			}

			try {
				const member = await management.updateMember({
					customerId,
					teamId,
					memberId,
					name: input.name,
					email: input.email,
				});

				res.status(200).json({ member });
			} catch (error) {
				next(error);
			}
		},

		async rename(
			req: Request,
			res: Response,
			next: NextFunction,
		): Promise<void> {
			const customerId = parseAuthUserId(req.auth);
			if (!customerId) {
				next(new AppError(401, "Nicht eingeloggt"));
				return;
			}

			const teamId = parseTeamId(req.params);
			if (!teamId) {
				next(new AppError(400, "Ungültige Route-Parameter"));
				return;
			}

			const input = parseCreateTeamBody(req.body);
			if (!input) {
				next(new AppError(400, "Ungültiger Request Body"));
				return;
			}

			try {
				const team = await management.rename({
					customerId,
					teamId,
					name: input.name,
				});

				res.status(200).json({ team });
			} catch (error) {
				next(error);
			}
		},

		async delete(
			req: Request,
			res: Response,
			next: NextFunction,
		): Promise<void> {
			const customerId = parseAuthUserId(req.auth);
			if (!customerId) {
				next(new AppError(401, "Nicht eingeloggt"));
				return;
			}

			const teamId = parseTeamId(req.params);
			if (!teamId) {
				next(new AppError(400, "Ungültige Route-Parameter"));
				return;
			}

			try {
				await management.delete({ customerId, teamId });

				res.status(204).end();
			} catch (error) {
				next(error);
			}
		},

		async deleteMember(
			req: Request,
			res: Response,
			next: NextFunction,
		): Promise<void> {
			const customerId = parseAuthUserId(req.auth);
			if (!customerId) {
				next(new AppError(401, "Nicht eingeloggt"));
				return;
			}

			const teamId = parseTeamId(req.params);
			const memberId = parseMemberId(req.params);
			if (!teamId || !memberId) {
				next(new AppError(400, "Ungültige Route-Parameter"));
				return;
			}

			try {
				await management.deleteMember({ customerId, teamId, memberId });

				res.status(204).end();
			} catch (error) {
				next(error);
			}
		},
	};
}

export const customerTeamsController = createCustomerTeamsController();
