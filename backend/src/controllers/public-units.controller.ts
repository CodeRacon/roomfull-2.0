import type { NextFunction, Request, Response } from "express";
import { AppError } from "../lib/app-error.js";
import { parseContentLocale } from "../lib/content-locale.js";
import {
	getPublicBookingOptions,
	getPublicUnitById,
	getPublicUnits,
} from "../services/unit.service.js";

function parseUnitId(params: Request["params"]): string | null {
	const unitId = typeof params.unitId === "string" ? params.unitId.trim() : "";
	return unitId.length > 0 ? unitId : null;
}

export async function listPublicUnitsController(
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> {
	const unitType =
		typeof req.query.unitType === "string"
			? req.query.unitType.trim()
			: undefined;
	const locale = parseContentLocale(
		typeof req.query.locale === "string" ? req.query.locale.trim() : undefined,
	);

	try {
		const units = await getPublicUnits({ unitType, locale });
		res.status(200).json({ units });
	} catch (error) {
		next(error);
	}
}

export async function listPublicBookingOptionsController(
	_req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> {
	try {
		const bookingOptions = await getPublicBookingOptions();
		res.status(200).json({ bookingOptions });
	} catch (error) {
		next(error);
	}
}

export async function getPublicUnitByIdController(
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> {
	const unitId = parseUnitId(req.params);

	if (!unitId) {
		next(new AppError(400, "Ungültige Route-Parameter"));
		return;
	}

	try {
		const unit = await getPublicUnitById(
			unitId,
			parseContentLocale(
				typeof req.query.locale === "string"
					? req.query.locale.trim()
					: undefined,
			),
		);
		res.status(200).json({ unit });
	} catch (error) {
		next(error);
	}
}
