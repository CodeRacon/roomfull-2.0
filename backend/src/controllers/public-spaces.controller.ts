import type { NextFunction, Request, Response } from "express";
import { AppError } from "../lib/app-error.js";
import {
	getPublicSpaceById,
	getPublicSpaces,
} from "../services/space.service.js";

function parseSpaceId(params: Request["params"]): string | null {
	const spaceId =
		typeof params.spaceId === "string" ? params.spaceId.trim() : "";
	return spaceId.length > 0 ? spaceId : null;
}

export async function listPublicSpacesController(
	_req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> {
	try {
		const spaces = await getPublicSpaces();
		res.status(200).json({ spaces });
	} catch (error) {
		next(error);
	}
}

export async function getPublicSpaceByIdController(
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> {
	const spaceId = parseSpaceId(req.params);

	if (!spaceId) {
		next(new AppError(400, "Ungültige Route-Parameter"));
		return;
	}

	try {
		const space = await getPublicSpaceById(spaceId);
		res.status(200).json({ space });
	} catch (error) {
		next(error);
	}
}
