import type { Area, BookableUnit } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import { AppError } from "../lib/app-error.js";
import {
	createNewUnit,
	deactivateExistingUnit,
	getAdminUnitContext,
	listAdminUnits,
	updateExistingUnit,
} from "../services/unit.service.js";

type CreateUnitBody = {
	name: string;
	description: string;
	capacity: number;
	isActive?: boolean;
	unitTypeId: string;
	areaId?: string;
	displayOrder?: number;
};

type UpdateUnitBody = Partial<Omit<CreateUnitBody, "areaId">> & {
	areaId?: string | null;
};
const INVALID_BODY_MESSAGE = "Ungültiger Request Body";
const INVALID_QUERY_MESSAGE = "Ungültige Query-Parameter";
const INVALID_ROUTE_PARAMS_MESSAGE = "Ungültige Route-Parameter";

type LocalizedDescriptionFields = {
	descriptionDe?: string | null;
	descriptionEn?: string | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

function omitLocalizedDescriptionFields<T extends object>(
	value: T,
): Omit<T, "descriptionDe" | "descriptionEn"> {
	const {
		descriptionDe: _descriptionDe,
		descriptionEn: _descriptionEn,
		...rest
	} = value as T & LocalizedDescriptionFields;

	return rest;
}

function serializeAdminUnit<
	T extends BookableUnit & {
		area?: (Area & LocalizedDescriptionFields) | null;
	},
>(unit: T) {
	const { area, ...unitWithoutArea } = unit;

	if (!("area" in unit)) {
		return omitLocalizedDescriptionFields(unit);
	}

	return {
		...omitLocalizedDescriptionFields(unitWithoutArea),
		area: area ? omitLocalizedDescriptionFields(area) : area,
	};
}

function fail(next: NextFunction, statusCode: number, message: string): void {
	next(new AppError(statusCode, message));
}

function parseCreateUnitBody(body: unknown): CreateUnitBody | null {
	if (!isRecord(body)) {
		return null;
	}

	if (
		typeof body.name !== "string" ||
		typeof body.description !== "string" ||
		typeof body.unitTypeId !== "string" ||
		typeof body.capacity !== "number" ||
		("isActive" in body && typeof body.isActive !== "boolean") ||
		("areaId" in body && typeof body.areaId !== "string") ||
		("displayOrder" in body && typeof body.displayOrder !== "number")
	) {
		return null;
	}

	const isActive =
		typeof body.isActive === "boolean" ? body.isActive : undefined;
	const areaId =
		typeof body.areaId === "string" ? body.areaId.trim() : undefined;
	const displayOrder =
		typeof body.displayOrder === "number" ? body.displayOrder : undefined;

	return {
		name: body.name.trim(),
		description: body.description.trim(),
		capacity: body.capacity,
		isActive,
		unitTypeId: body.unitTypeId.trim(),
		areaId,
		displayOrder,
	};
}

function parseUpdateUnitBody(body: unknown): UpdateUnitBody | null {
	if (!isRecord(body)) {
		return null;
	}

	const parsed: UpdateUnitBody = {};

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

	if ("unitTypeId" in body) {
		if (typeof body.unitTypeId !== "string") {
			return null;
		}
		parsed.unitTypeId = body.unitTypeId.trim();
	}

	if ("areaId" in body) {
		if (body.areaId !== null && typeof body.areaId !== "string") {
			return null;
		}
		parsed.areaId = body.areaId === null ? null : body.areaId.trim();
	}

	if ("displayOrder" in body) {
		if (typeof body.displayOrder !== "number") {
			return null;
		}
		parsed.displayOrder = body.displayOrder;
	}

	if (Object.keys(parsed).length === 0) {
		return null;
	}

	return parsed;
}

function parseUnitId(params: Request["params"]): string | null {
	const unitId = typeof params.unitId === "string" ? params.unitId.trim() : "";
	return unitId.length > 0 ? unitId : null;
}

function parseOptionalQueryString(value: unknown): string | undefined | null {
	if (value === undefined) {
		return undefined;
	}

	if (typeof value !== "string") {
		return null;
	}

	return value;
}

function parseAdminUnitsQuery(query: Request["query"]): {
	status?: string;
	unitType?: string;
	search?: string;
} | null {
	const status = parseOptionalQueryString(query.status);
	const unitType = parseOptionalQueryString(query.unitType);
	const search = parseOptionalQueryString(query.search);

	if (status === null || unitType === null || search === null) {
		return null;
	}

	return { status, unitType, search };
}

export async function listAdminUnitsController(
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> {
	const query = parseAdminUnitsQuery(req.query);

	if (!query) {
		fail(next, 400, INVALID_QUERY_MESSAGE);
		return;
	}

	try {
		const units = await listAdminUnits(query);
		res.status(200).json({ units: units.map(serializeAdminUnit) });
	} catch (error) {
		next(error);
	}
}

export async function getAdminUnitContextController(
	_req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> {
	try {
		const context = await getAdminUnitContext();
		res.status(200).json({
			...context,
			areas: context.areas.map(omitLocalizedDescriptionFields),
		});
	} catch (error) {
		next(error);
	}
}

export async function createAdminUnitController(
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> {
	const input = parseCreateUnitBody(req.body);

	if (!input) {
		fail(next, 400, INVALID_BODY_MESSAGE);
		return;
	}

	try {
		const newUnit = await createNewUnit(input);
		res.status(201).json({ unit: serializeAdminUnit(newUnit) });
	} catch (error) {
		next(error);
	}
}

export async function updateAdminUnitController(
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> {
	const unitId = parseUnitId(req.params);
	if (!unitId) {
		fail(next, 400, INVALID_ROUTE_PARAMS_MESSAGE);
		return;
	}

	const input = parseUpdateUnitBody(req.body);
	if (!input) {
		fail(next, 400, INVALID_BODY_MESSAGE);
		return;
	}

	try {
		const updatedUnit = await updateExistingUnit({ id: unitId, ...input });
		res.status(200).json({ unit: serializeAdminUnit(updatedUnit) });
	} catch (error) {
		next(error);
	}
}

export async function deactivateAdminUnitController(
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> {
	const unitId = parseUnitId(req.params);
	if (!unitId) {
		fail(next, 400, INVALID_ROUTE_PARAMS_MESSAGE);
		return;
	}

	try {
		const deactivatedUnit = await deactivateExistingUnit(unitId);
		res.status(200).json({ unit: serializeAdminUnit(deactivatedUnit) });
	} catch (error) {
		next(error);
	}
}
