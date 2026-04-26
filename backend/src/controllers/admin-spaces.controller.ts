import type { NextFunction, Request, Response } from "express";
import { AppError } from "../lib/app-error.js";
import {
	createNewSpace,
	deactivateExistingSpace,
	updateExistingSpace,
} from "../services/space.service.js";

type CreateSpaceBody = {
	name: string;
	description: string;
	capacity: number;
	isActive?: boolean;
	opensAt: string;
	closesAt: string;
	spaceTypeId: string;
};

type UpdateSpaceBody = Partial<CreateSpaceBody>;
const INVALID_BODY_MESSAGE = "Ungültiger Request Body";
const INVALID_ROUTE_PARAMS_MESSAGE = "Ungültige Route-Parameter";

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

function fail(next: NextFunction, statusCode: number, message: string): void {
	next(new AppError(statusCode, message));
}

function parseCreateSpaceBody(body: unknown): CreateSpaceBody | null {
	if (!isRecord(body)) {
		return null;
	}

	if (
		typeof body.name !== "string" ||
		typeof body.description !== "string" ||
		typeof body.opensAt !== "string" ||
		typeof body.closesAt !== "string" ||
		typeof body.spaceTypeId !== "string" ||
		typeof body.capacity !== "number" ||
		("isActive" in body && typeof body.isActive !== "boolean")
	) {
		return null;
	}

	const isActive =
		typeof body.isActive === "boolean" ? body.isActive : undefined;

	return {
		name: body.name.trim(),
		description: body.description.trim(),
		capacity: body.capacity,
		isActive,
		opensAt: body.opensAt.trim(),
		closesAt: body.closesAt.trim(),
		spaceTypeId: body.spaceTypeId.trim(),
	};
}

function parseUpdateSpaceBody(body: unknown): UpdateSpaceBody | null {
	if (!isRecord(body)) {
		return null;
	}

	const parsed: UpdateSpaceBody = {};

	if ("name" in body) {
		if (typeof body.name !== "string") {
			return null;
		}
		parsed.name = body.name.trim();
	}

	if ("description" in body) {
		if (typeof body.description !== "string") {
			return null;
		}
		parsed.description = body.description.trim();
	}

	if ("capacity" in body) {
		if (typeof body.capacity !== "number") {
			return null;
		}
		parsed.capacity = body.capacity;
	}

	if ("isActive" in body) {
		if (typeof body.isActive !== "boolean") {
			return null;
		}
		parsed.isActive = body.isActive;
	}

	if ("opensAt" in body) {
		if (typeof body.opensAt !== "string") {
			return null;
		}
		parsed.opensAt = body.opensAt.trim();
	}

	if ("closesAt" in body) {
		if (typeof body.closesAt !== "string") {
			return null;
		}
		parsed.closesAt = body.closesAt.trim();
	}

	if ("spaceTypeId" in body) {
		if (typeof body.spaceTypeId !== "string") {
			return null;
		}
		parsed.spaceTypeId = body.spaceTypeId.trim();
	}

	if (Object.keys(parsed).length === 0) {
		return null;
	}

	return parsed;
}

function parseSpaceId(params: Request["params"]): string | null {
	const spaceId =
		typeof params.spaceId === "string" ? params.spaceId.trim() : "";
	return spaceId.length > 0 ? spaceId : null;
}

export async function createAdminSpaceController(
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> {
	const input = parseCreateSpaceBody(req.body);

	if (!input) {
		fail(next, 400, INVALID_BODY_MESSAGE);
		return;
	}

	try {
		const newSpace = await createNewSpace(input);
		res.status(201).json({ space: newSpace });
	} catch (error) {
		next(error);
	}
}

export async function updateAdminSpaceController(
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> {
	const spaceId = parseSpaceId(req.params);
	if (!spaceId) {
		fail(next, 400, INVALID_ROUTE_PARAMS_MESSAGE);
		return;
	}

	const input = parseUpdateSpaceBody(req.body);
	if (!input) {
		fail(next, 400, INVALID_BODY_MESSAGE);
		return;
	}

	try {
		const updatedSpace = await updateExistingSpace({ id: spaceId, ...input });
		res.status(200).json({ space: updatedSpace });
	} catch (error) {
		next(error);
	}
}

export async function deactivateAdminSpaceController(
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> {
	const spaceId = parseSpaceId(req.params);
	if (!spaceId) {
		fail(next, 400, INVALID_ROUTE_PARAMS_MESSAGE);
		return;
	}

	try {
		const deactivatedSpace = await deactivateExistingSpace(spaceId);
		res.status(200).json({ space: deactivatedSpace });
	} catch (error) {
		next(error);
	}
}
