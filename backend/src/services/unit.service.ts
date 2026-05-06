import type { BookableUnit } from "@prisma/client";
import { doesAreaExist } from "../db/area.repository.js";
import { hasOverlappingActiveBookings } from "../db/booking.repository.js";
import {
	type CreateUnitInput,
	createUnit,
	deactivateUnit,
	doesUnitTypeExist,
	findActiveUnitById,
	findUnitById,
	listActiveUnits,
	type UpdateUnitInput,
	updateUnit,
} from "../db/unit.repository.js";
import { AppError } from "../lib/app-error.js";

const WEEKDAY_START = 1;
const WEEKDAY_END = 5;
const OPENING_MINUTES = 8 * 60;
const CLOSING_MINUTES = 22 * 60;

export type UnitAvailability = {
	unitId: string;
	startTime: string;
	endTime: string;
	isAvailable: boolean;
};

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

function assertStartBeforeEnd(startTime: Date, endTime: Date): void {
	if (startTime.getTime() >= endTime.getTime()) {
		throw new AppError(400, "Startzeit muss vor Endzeit liegen");
	}
}

function assertFutureRange(startTime: Date): void {
	if (startTime.getTime() <= Date.now()) {
		throw new AppError(400, "Nur zukünftige Zeiträume sind erlaubt");
	}
}

function assertSameCalendarDay(startTime: Date, endTime: Date): void {
	const isSameDate =
		startTime.getFullYear() === endTime.getFullYear() &&
		startTime.getMonth() === endTime.getMonth() &&
		startTime.getDate() === endTime.getDate();

	if (!isSameDate) {
		throw new AppError(
			400,
			"Start und Ende müssen am selben Kalendertag liegen",
		);
	}
}

function assertWeekday(date: Date): void {
	const day = date.getDay();
	if (day < WEEKDAY_START || day > WEEKDAY_END) {
		throw new AppError(400, "Zeitraum muss an einem Werktag liegen (Mo-Fr)");
	}
}

function toMinutesOfDay(date: Date): number {
	return date.getHours() * 60 + date.getMinutes();
}

function assertWithinOpeningHours(startTime: Date, endTime: Date): void {
	const startMinutes = toMinutesOfDay(startTime);
	const endMinutes = toMinutesOfDay(endTime);

	if (startMinutes < OPENING_MINUTES || endMinutes > CLOSING_MINUTES) {
		throw new AppError(
			400,
			"Zeitraum muss innerhalb der Öffnungszeiten (08:00-22:00) liegen",
		);
	}
}

function parseDateTime(value: string, fieldName: "start" | "end"): Date {
	const parsed = new Date(value);
	if (Number.isNaN(parsed.getTime())) {
		throw new AppError(400, `Ungültiger ${fieldName}-Zeitpunkt`);
	}

	return parsed;
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

async function assertUnitTypeExists(unitTypeId: string): Promise<void> {
	const existingUnitType = await doesUnitTypeExist(unitTypeId);

	if (!existingUnitType) {
		throw new AppError(404, "UnitType wurde nicht gefunden");
	}
}

async function assertAreaExists(areaId: string): Promise<void> {
	const existingArea = await doesAreaExist(areaId);

	if (!existingArea) {
		throw new AppError(404, "Area wurde nicht gefunden");
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
	await assertUnitTypeExists(normalizedInput.unitTypeId);

	if (normalizedInput.areaId) {
		await assertAreaExists(normalizedInput.areaId);
	}

	return createUnit(normalizedInput);
}

export async function getPublicUnits(): Promise<BookableUnit[]> {
	return listActiveUnits();
}

export async function getPublicUnitById(unitId: string): Promise<BookableUnit> {
	const normalizedUnitId = unitId.trim();

	if (normalizedUnitId.length === 0) {
		throw new AppError(400, "Ungültige Route-Parameter");
	}

	const existingUnit = await findActiveUnitById(normalizedUnitId);

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

	assertStartBeforeEnd(startTime, endTime);
	assertFutureRange(startTime);
	assertSameCalendarDay(startTime, endTime);
	assertWeekday(startTime);
	assertWithinOpeningHours(startTime, endTime);

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
	await assertUnitExists(normalizedInput.id);

	validateUpdateInput(normalizedInput);

	if (normalizedInput.unitTypeId !== undefined) {
		await assertUnitTypeExists(normalizedInput.unitTypeId);
	}

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
