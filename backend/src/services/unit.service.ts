import type { BookableUnit, UnitTypeName } from "@prisma/client";
import { doesAreaExist } from "../db/area.repository.js";
import { hasOverlappingActiveBookings } from "../db/booking.repository.js";
import {
	type CreateUnitInput,
	createUnit,
	deactivateUnit,
	findActiveUnitById,
	findActiveUnitByIdWithRelations,
	findUnitById,
	findUnitTypeById,
	listActiveUnitsWithRelations,
	listActiveUnitsWithRelationsByUnitType,
	listUnitTypesForBookingOptions,
	type UnitTypeForBookingOption,
	type UnitWithRelations,
	type UpdateUnitInput,
	updateUnit,
} from "../db/unit.repository.js";
import { AppError } from "../lib/app-error.js";
import {
	assertBookableDateTimeRange,
	parseDateTime,
} from "./booking-time-policy.js";

export type UnitAvailability = {
	unitId: string;
	startTime: string;
	endTime: string;
	isAvailable: boolean;
};

export type BookingMode = "AUTO_ASSIGN" | "CHOOSE_UNIT";
export type AreaSelectionMode = "REQUIRED" | "NOT_APPLICABLE";
export type BookingOptionStatus = "AVAILABLE" | "UNAVAILABLE";

export type BookingOptionArea = {
	id: string;
	name: string;
	activeUnitCount: number;
};

export type BookingOption = {
	key: UnitTypeName;
	unitType: {
		id: string;
		name: UnitTypeName;
		minDurationMinutes: number;
		maxDurationMinutes: number;
	};
	bookingMode: BookingMode;
	areaSelection: AreaSelectionMode;
	status: BookingOptionStatus;
	totalActiveUnits: number;
	maxCapacity: number;
	areas: BookingOptionArea[];
};

export const BOOKING_OPTION_UNIT_TYPES: UnitTypeName[] = [
	"HOT_DESK",
	"BOOTH",
	"TEAM_ROOM",
	"MEETING_ROOM",
];

function parseOptionalUnitType(value?: string): UnitTypeName | undefined {
	const normalized = value?.trim().toUpperCase();

	if (!normalized) {
		return undefined;
	}

	switch (normalized) {
		case "HOT_DESK":
			return "HOT_DESK";
		case "BOOTH":
			return "BOOTH";
		case "TEAM_ROOM":
			return "TEAM_ROOM";
		case "MEETING_ROOM":
			return "MEETING_ROOM";
		default:
			throw new AppError(400, "unitType ist ungültig");
	}
}

function getBookingOptionStatus(totalActiveUnits: number): BookingOptionStatus {
	return totalActiveUnits > 0 ? "AVAILABLE" : "UNAVAILABLE";
}

function buildHotDeskAreas(
	unitType: UnitTypeForBookingOption,
): BookingOptionArea[] {
	const areaCounts = new Map<string, BookingOptionArea>();

	for (const unit of unitType.units) {
		const area = unit.area;
		if (!area) {
			continue;
		}

		let existing = areaCounts.get(area.id);
		if (!existing) {
			existing = {
				id: area.id,
				name: area.name,
				activeUnitCount: 0,
			};
			areaCounts.set(area.id, existing);
		}

		existing.activeUnitCount += 1;
	}

	return Array.from(areaCounts.values());
}

function buildBookingOption(unitType: UnitTypeForBookingOption): BookingOption {
	const isHotDesk = unitType.name === "HOT_DESK";

	const areas = isHotDesk ? buildHotDeskAreas(unitType) : [];

	const totalActiveUnits = isHotDesk
		? areas.reduce((sum, area) => sum + area.activeUnitCount, 0)
		: unitType.units.length;

	const maxCapacity = unitType.units.reduce(
		(max, unit) => Math.max(max, unit.capacity),
		0,
	);

	return {
		key: unitType.name,
		unitType: {
			id: unitType.id,
			name: unitType.name,
			minDurationMinutes: unitType.minDurationMinutes,
			maxDurationMinutes: unitType.maxDurationMinutes,
		},
		bookingMode: isHotDesk ? "AUTO_ASSIGN" : "CHOOSE_UNIT",
		areaSelection: isHotDesk ? "REQUIRED" : "NOT_APPLICABLE",
		status: getBookingOptionStatus(totalActiveUnits),
		totalActiveUnits,
		maxCapacity,
		areas,
	};
}

function assertNonEmpty(value: string, message: string): void {
	if (value.trim().length === 0) {
		throw new AppError(400, message);
	}
}

function assertPositiveInteger(value: number, message: string): void {
	if (!Number.isInteger(value) || value <= 0) {
		throw new AppError(400, message);
	}
}

function assertNonNegativeInteger(value: number, message: string): void {
	if (!Number.isInteger(value) || value < 0) {
		throw new AppError(400, message);
	}
}

function normalizeCreateInput(input: CreateUnitInput): CreateUnitInput {
	const trimmedAreaId = input.areaId?.trim();
	const areaId =
		trimmedAreaId && trimmedAreaId.length > 0 ? trimmedAreaId : undefined;

	return {
		...input,
		name: input.name.trim(),
		description: input.description.trim(),
		unitTypeId: input.unitTypeId.trim(),
		areaId,
	};
}

function normalizeUpdateInput(input: UpdateUnitInput): UpdateUnitInput {
	const normalized: UpdateUnitInput = {
		id: input.id.trim(),
	};

	if (input.name !== undefined) {
		normalized.name = input.name.trim();
	}

	if (input.description !== undefined) {
		normalized.description = input.description.trim();
	}

	if (input.unitTypeId !== undefined) {
		normalized.unitTypeId = input.unitTypeId.trim();
	}

	if (input.areaId !== undefined) {
		const trimmedAreaId = input.areaId.trim();
		normalized.areaId = trimmedAreaId.length > 0 ? trimmedAreaId : undefined;
	}

	if (input.capacity !== undefined) {
		normalized.capacity = input.capacity;
	}

	if (input.displayOrder !== undefined) {
		normalized.displayOrder = input.displayOrder;
	}

	if (input.isActive !== undefined) {
		normalized.isActive = input.isActive;
	}

	return normalized;
}

async function assertUnitExists(unitId: string): Promise<BookableUnit> {
	const existingUnit = await findUnitById(unitId);

	if (!existingUnit) {
		throw new AppError(404, "Unit wurde nicht gefunden");
	}

	return existingUnit;
}

async function assertAreaExists(areaId: string): Promise<void> {
	const existingArea = await doesAreaExist(areaId);

	if (!existingArea) {
		throw new AppError(404, "Area wurde nicht gefunden");
	}
}

async function assertUnitTypeExistsAndHotDeskHasArea(
	unitTypeId: string,
	areaId: string | undefined,
): Promise<void> {
	const unitType = await findUnitTypeById(unitTypeId);

	if (!unitType) {
		throw new AppError(404, "UnitType wurde nicht gefunden");
	}

	if (unitType.name === "HOT_DESK" && !areaId) {
		throw new AppError(400, "Hot Desk benötigt eine Area");
	}
}

function validateCreateInput(input: CreateUnitInput): void {
	assertNonEmpty(input.name, "Unit-Name darf nicht leer sein");
	assertNonEmpty(input.description, "Beschreibung darf nicht leer sein");
	assertNonEmpty(input.unitTypeId, "UnitType ist erforderlich");
	assertPositiveInteger(input.capacity, "Kapazität muss größer als 0 sein");

	if (input.displayOrder !== undefined) {
		assertNonNegativeInteger(input.displayOrder, "displayOrder muss >= 0 sein");
	}

	if (input.areaId !== undefined && input.areaId.length > 0) {
		assertNonEmpty(input.areaId, "areaId ist ungültig");
	}
}

function validateUpdateInput(input: UpdateUnitInput): void {
	if (input.name !== undefined) {
		assertNonEmpty(input.name, "Unit-Name darf nicht leer sein");
	}

	if (input.description !== undefined) {
		assertNonEmpty(input.description, "Beschreibung darf nicht leer sein");
	}

	if (input.capacity !== undefined) {
		assertPositiveInteger(input.capacity, "Kapazität muss größer als 0 sein");
	}

	if (input.unitTypeId !== undefined) {
		assertNonEmpty(input.unitTypeId, "UnitType ist erforderlich");
	}

	if (input.displayOrder !== undefined) {
		assertNonNegativeInteger(input.displayOrder, "displayOrder muss >= 0 sein");
	}

	if (input.areaId !== undefined) {
		assertNonEmpty(input.areaId, "areaId ist ungültig");
	}
}

export async function createNewUnit(
	input: CreateUnitInput,
): Promise<BookableUnit> {
	const normalizedInput = normalizeCreateInput(input);

	validateCreateInput(normalizedInput);
	await assertUnitTypeExistsAndHotDeskHasArea(
		normalizedInput.unitTypeId,
		normalizedInput.areaId,
	);

	if (normalizedInput.areaId) {
		await assertAreaExists(normalizedInput.areaId);
	}

	return createUnit(normalizedInput);
}

export async function getPublicUnits(input?: {
	unitType?: string;
}): Promise<UnitWithRelations[]> {
	const unitType = parseOptionalUnitType(input?.unitType);

	if (unitType) {
		return listActiveUnitsWithRelationsByUnitType(unitType);
	}

	return listActiveUnitsWithRelations();
}

export async function getPublicBookingOptions(): Promise<BookingOption[]> {
	const unitTypes = await listUnitTypesForBookingOptions(
		BOOKING_OPTION_UNIT_TYPES,
	);
	const unitTypesByName = new Map(
		unitTypes.map((unitType) => [unitType.name, unitType]),
	);

	return BOOKING_OPTION_UNIT_TYPES.map((unitTypeName) => {
		const unitType = unitTypesByName.get(unitTypeName);

		if (!unitType) {
			throw new AppError(500, "BookingOption UnitType fehlt");
		}

		return buildBookingOption(unitType);
	});
}

export async function getPublicUnitById(
	unitId: string,
): Promise<UnitWithRelations> {
	const normalizedUnitId = unitId.trim();

	if (normalizedUnitId.length === 0) {
		throw new AppError(400, "Ungültige Route-Parameter");
	}

	const existingUnit = await findActiveUnitByIdWithRelations(normalizedUnitId);

	if (!existingUnit) {
		throw new AppError(404, "Unit wurde nicht gefunden");
	}

	return existingUnit;
}

export async function getPublicUnitAvailability(input: {
	unitId: string;
	start: string;
	end: string;
}): Promise<UnitAvailability> {
	const unitId = input.unitId.trim();
	const start = input.start.trim();
	const end = input.end.trim();

	if (unitId.length === 0) {
		throw new AppError(400, "Ungültige Route-Parameter");
	}

	if (start.length === 0 || end.length === 0) {
		throw new AppError(400, "start und end Query-Parameter sind erforderlich");
	}

	const startTime = parseDateTime(start, "start");
	const endTime = parseDateTime(end, "end");

	assertBookableDateTimeRange(startTime, endTime);

	const existingUnit = await findActiveUnitById(unitId);
	if (!existingUnit) {
		throw new AppError(404, "Unit wurde nicht gefunden");
	}

	const hasOverlap = await hasOverlappingActiveBookings({
		unitId,
		startTime,
		endTime,
	});

	return {
		unitId,
		startTime: startTime.toISOString(),
		endTime: endTime.toISOString(),
		isAvailable: !hasOverlap,
	};
}

export async function updateExistingUnit(
	input: UpdateUnitInput,
): Promise<BookableUnit> {
	const normalizedInput = normalizeUpdateInput(input);
	const existingUnit = await assertUnitExists(normalizedInput.id);

	validateUpdateInput(normalizedInput);

	const effectiveUnitTypeId =
		normalizedInput.unitTypeId ?? existingUnit.unitTypeId;
	const effectiveAreaId =
		normalizedInput.areaId ?? existingUnit.areaId ?? undefined;

	await assertUnitTypeExistsAndHotDeskHasArea(
		effectiveUnitTypeId,
		effectiveAreaId,
	);

	if (normalizedInput.areaId !== undefined) {
		await assertAreaExists(normalizedInput.areaId);
	}

	return updateUnit(normalizedInput);
}

export async function deactivateExistingUnit(
	id: string,
): Promise<BookableUnit> {
	const unitId = id.trim();

	await assertUnitExists(unitId);

	return deactivateUnit(unitId);
}
