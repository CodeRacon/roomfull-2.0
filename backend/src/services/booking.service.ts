import type { Booking } from "@prisma/client";
import { BookingStatus, UnitTypeName } from "@prisma/client";
import { findActiveAreaById } from "../db/area.repository.js";
import {
	cancelBooking as cancelBookingRecord,
	findBookingById as findBookingByIdRecord,
	listActiveBookingIntervalsForUnitInRange,
	listAllBookings as listAllBookingsRecords,
	listUserBookings as listUserBookingsRecords,
	type UserBookingRecord,
} from "../db/booking.repository.js";
import {
	countActiveUnitCapacityByAreaAndUnitType,
	createBookingWithTransaction,
	findActiveUnitById,
	findActiveUnitByIdWithRelations,
	findUnitTypeByName,
	listAvailableUnitsForAllocation,
} from "../db/unit.repository.js";
import { AppError } from "../lib/app-error.js";
import {
	assertBookableDateTimeRange,
	getBookableBerlinDayRange,
	parseDateTime,
} from "./booking-time-policy.js";

type CreateBookingForUserInput = {
	userId: string;
	start: string;
	end: string;
	unitId?: string;
	areaId?: string;
	unitType?: string;
};

type ListUserBookingsInput = {
	userId: string;
};

type CancelBookingForUserInput = {
	bookingId: string;
	userId: string;
};

type ListUnitDayBookingsInput = {
	unitId: string;
	date: string;
};

type GetBookingContextInput = {
	unitId?: string;
	areaId?: string;
	unitType?: string;
};

type BookingContextEntry =
	| {
			mode: "DIRECT";
			unitId: string;
	  }
	| {
			mode: "AUTO_ASSIGN";
			areaId: string;
			unitType: UnitTypeName;
	  };

export type UnitDayBookings = {
	date: string;
	unitId: string;
	bookedIntervals: {
		start: string;
		end: string;
	}[];
};

export type BookingContextMode = "DIRECT" | "AUTO_ASSIGN";

export type BookingContextUnitType = {
	name: UnitTypeName;
	minDurationMinutes: number;
	maxDurationMinutes: number;
};

export type DirectBookingContext = {
	mode: "DIRECT";
	unit: {
		id: string;
		name: string;
		description: string;
		capacity: number;
		unitType: BookingContextUnitType;
	};
};

export type AutoAssignBookingContext = {
	mode: "AUTO_ASSIGN";
	unitType: BookingContextUnitType;
	area: {
		id: string;
		name: string;
		description: string | null;
		seatCount: number;
	};
};

export type BookingContext = DirectBookingContext | AutoAssignBookingContext;

function parseUnitType(value: string): UnitTypeName {
	const normalized = value.trim().toUpperCase();

	switch (normalized) {
		case UnitTypeName.HOT_DESK:
			return UnitTypeName.HOT_DESK;
		case UnitTypeName.BOOTH:
			return UnitTypeName.BOOTH;
		case UnitTypeName.TEAM_ROOM:
			return UnitTypeName.TEAM_ROOM;
		case UnitTypeName.MEETING_ROOM:
			return UnitTypeName.MEETING_ROOM;
		default:
			throw new AppError(400, "unitType ist ungültig");
	}
}

function resolveBookingContextEntry(
	input: GetBookingContextInput,
): BookingContextEntry {
	const unitId = input.unitId?.trim() ?? "";
	const areaId = input.areaId?.trim() ?? "";
	const unitTypeRaw = input.unitType?.trim() ?? "";

	const directSelected = unitId.length > 0;
	const autoSelected = areaId.length > 0 || unitTypeRaw.length > 0;

	if (directSelected && autoSelected) {
		throw new AppError(
			400,
			"Entweder unitId ODER areaId+unitType senden, nicht beides",
		);
	}

	if (!directSelected && !autoSelected) {
		throw new AppError(
			400,
			"Entweder unitId oder areaId+unitType ist erforderlich",
		);
	}

	if (directSelected) {
		return { mode: "DIRECT", unitId };
	}

	if (areaId.length === 0 || unitTypeRaw.length === 0) {
		throw new AppError(
			400,
			"Für Auto-Assign sind areaId und unitType erforderlich",
		);
	}

	const unitType = parseUnitType(unitTypeRaw);

	if (unitType !== UnitTypeName.HOT_DESK) {
		throw new AppError(400, "Auto-Assign ist in V1 nur für HOT_DESK erlaubt");
	}

	return { mode: "AUTO_ASSIGN", areaId, unitType };
}

function resolveBookingMode(
	input: CreateBookingForUserInput,
):
	| { mode: "DIRECT"; unitId: string }
	| { mode: "AUTO"; areaId: string; unitType: UnitTypeName } {
	const unitId = input.unitId?.trim() ?? "";
	const areaId = input.areaId?.trim() ?? "";
	const unitTypeRaw = input.unitType?.trim() ?? "";

	const directSelected = unitId.length > 0;
	const autoSelected = areaId.length > 0 || unitTypeRaw.length > 0;

	if (directSelected && autoSelected) {
		throw new AppError(
			400,
			"Entweder unitId ODER areaId+unitType senden, nicht beides",
		);
	}

	if (!directSelected && !autoSelected) {
		throw new AppError(
			400,
			"Entweder unitId oder areaId+unitType ist erforderlich",
		);
	}

	if (directSelected) {
		return { mode: "DIRECT", unitId };
	}

	if (areaId.length === 0 || unitTypeRaw.length === 0) {
		throw new AppError(
			400,
			"Für Auto-Assign sind areaId und unitType erforderlich",
		);
	}

	const unitType = parseUnitType(unitTypeRaw);

	if (unitType !== UnitTypeName.HOT_DESK) {
		throw new AppError(400, "Auto-Assign ist in V1 nur für HOT_DESK erlaubt");
	}

	return { mode: "AUTO", areaId, unitType };
}

function mapUnitTypePolicy(
	name: UnitTypeName,
	minDurationMinutes: number,
	maxDurationMinutes: number,
): BookingContextUnitType {
	return { name, minDurationMinutes, maxDurationMinutes };
}

function assertDurationForType(
	startTime: Date,
	endTime: Date,
	minDurationMinutes: number,
	maxDurationMinutes: number,
): void {
	const durationMs = endTime.getTime() - startTime.getTime();
	const minDurationMs = minDurationMinutes * 60 * 1000;
	const maxDurationMs = maxDurationMinutes * 60 * 1000;

	if (durationMs < minDurationMs || durationMs > maxDurationMs) {
		throw new AppError(
			400,
			`Buchungsdauer muss zwischen ${minDurationMinutes} und ${maxDurationMinutes} Minuten liegen`,
		);
	}
}

async function getDirectBookingContext(
	unitId: string,
): Promise<DirectBookingContext> {
	const unit = await findActiveUnitByIdWithRelations(unitId);

	if (!unit) {
		throw new AppError(404, "Unit wurde nicht gefunden");
	}

	return {
		mode: "DIRECT",
		unit: {
			id: unit.id,
			name: unit.name,
			description: unit.description,
			capacity: unit.capacity,
			unitType: mapUnitTypePolicy(
				unit.unitType.name,
				unit.unitType.minDurationMinutes,
				unit.unitType.maxDurationMinutes,
			),
		},
	};
}

async function getAutoAssignBookingContext(input: {
	areaId: string;
	unitType: UnitTypeName;
}): Promise<AutoAssignBookingContext> {
	const area = await findActiveAreaById(input.areaId);

	if (!area) {
		throw new AppError(404, "Area wurde nicht gefunden");
	}

	const unitType = await findUnitTypeByName(input.unitType);

	if (!unitType) {
		throw new AppError(404, "UnitType wurde nicht gefunden");
	}

	const seatCount = await countActiveUnitCapacityByAreaAndUnitType({
		areaId: area.id,
		unitTypeId: unitType.id,
	});

	if (seatCount === 0) {
		throw new AppError(404, "Kein Hot Desk in dieser Area verfügbar");
	}

	return {
		mode: "AUTO_ASSIGN",
		unitType: mapUnitTypePolicy(
			unitType.name,
			unitType.minDurationMinutes,
			unitType.maxDurationMinutes,
		),
		area: {
			id: area.id,
			name: area.name,
			description: area.description,
			seatCount,
		},
	};
}

export async function getBookingContext(
	input: GetBookingContextInput,
): Promise<BookingContext> {
	const entry = resolveBookingContextEntry(input);

	if (entry.mode === "DIRECT") {
		return getDirectBookingContext(entry.unitId);
	}

	return getAutoAssignBookingContext({
		areaId: entry.areaId,
		unitType: entry.unitType,
	});
}

async function createDirectBooking(input: {
	userId: string;
	unitId: string;
	startTime: Date;
	endTime: Date;
}): Promise<Booking> {
	const unit = await findActiveUnitByIdWithRelations(input.unitId);
	if (!unit) {
		throw new AppError(404, "Unit wurde nicht gefunden");
	}

	assertDurationForType(
		input.startTime,
		input.endTime,
		unit.unitType.minDurationMinutes,
		unit.unitType.maxDurationMinutes,
	);

	const booking = await createBookingWithTransaction({
		userId: input.userId,
		unitId: unit.id,
		startTime: input.startTime,
		endTime: input.endTime,
	});

	if (!booking) {
		throw new AppError(409, "Zeitraum kollidiert mit bestehender Buchung");
	}

	return booking;
}

async function createAutoAssignedHotDeskBooking(input: {
	userId: string;
	areaId: string;
	unitType: UnitTypeName;
	startTime: Date;
	endTime: Date;
}): Promise<Booking> {
	const area = await findActiveAreaById(input.areaId);
	if (!area) {
		throw new AppError(404, "Area wurde nicht gefunden");
	}

	const unitType = await findUnitTypeByName(input.unitType);
	if (!unitType) {
		throw new AppError(404, "UnitType wurde nicht gefunden");
	}

	assertDurationForType(
		input.startTime,
		input.endTime,
		unitType.minDurationMinutes,
		unitType.maxDurationMinutes,
	);

	for (let attempt = 0; attempt < 3; attempt += 1) {
		const candidates = await listAvailableUnitsForAllocation({
			areaId: area.id,
			unitTypeId: unitType.id,
			startTime: input.startTime,
			endTime: input.endTime,
		});

		for (const candidate of candidates) {
			const booking = await createBookingWithTransaction({
				userId: input.userId,
				unitId: candidate.id,
				startTime: input.startTime,
				endTime: input.endTime,
			});

			if (booking) {
				return booking;
			}
		}
	}

	throw new AppError(409, "Kein freier Hot Desk für den Zeitraum verfügbar");
}

export async function createBookingForUser(
	input: CreateBookingForUserInput,
): Promise<Booking> {
	const startTime = parseDateTime(input.start, "start");
	const endTime = parseDateTime(input.end, "end");
	assertBookableDateTimeRange(startTime, endTime);

	const userId = input.userId.trim();
	if (userId === "") {
		throw new AppError(400, "userId ist erforderlich");
	}

	const mode = resolveBookingMode(input);

	if (mode.mode === "DIRECT") {
		return createDirectBooking({
			userId,
			unitId: mode.unitId,
			startTime,
			endTime,
		});
	}

	return createAutoAssignedHotDeskBooking({
		userId,
		areaId: mode.areaId,
		unitType: mode.unitType,
		startTime,
		endTime,
	});
}

export async function listUserBookings(
	input: ListUserBookingsInput,
): Promise<UserBookingRecord[]> {
	const userId = input.userId.trim();

	if (userId === "") {
		throw new AppError(400, "userId ist erforderlich");
	}
	return listUserBookingsRecords({ userId });
}

export async function cancelBookingForUser(
	input: CancelBookingForUserInput,
): Promise<Booking> {
	const bookingId = input.bookingId.trim();
	if (bookingId === "") {
		throw new AppError(400, "bookingId ist erforderlich");
	}

	const userId = input.userId.trim();
	if (userId === "") {
		throw new AppError(400, "userId ist erforderlich");
	}

	const booking = await findBookingByIdRecord({ bookingId });
	if (!booking) {
		throw new AppError(404, "Buchung wurde nicht gefunden");
	}

	if (booking.status !== BookingStatus.ACTIVE) {
		throw new AppError(409, "Buchung ist bereits storniert");
	}

	if (booking.userId !== userId) {
		throw new AppError(403, "Buchung gehört nicht zum Benutzer");
	}

	if (booking.startTime.getTime() <= Date.now()) {
		throw new AppError(409, "Nur zukünftige Buchungen können storniert werden");
	}

	return cancelBookingRecord({ bookingId });
}

export async function listAllBookingsForAdmin(): Promise<Booking[]> {
	return listAllBookingsRecords();
}

export async function listUnitDayBookings(
	input: ListUnitDayBookingsInput,
): Promise<UnitDayBookings> {
	const unitId = input.unitId.trim();

	if (unitId === "") {
		throw new AppError(400, "unitId ist erforderlich");
	}

	const dayRange = getBookableBerlinDayRange(input.date);
	const unit = await findActiveUnitById(unitId);

	if (!unit) {
		throw new AppError(404, "Unit wurde nicht gefunden");
	}

	const intervals = await listActiveBookingIntervalsForUnitInRange({
		unitId,
		startTime: dayRange.startTime,
		endTime: dayRange.endTime,
	});

	return {
		date: dayRange.date,
		unitId,
		bookedIntervals: intervals.map((interval) => ({
			start: new Date(
				Math.max(interval.startTime.getTime(), dayRange.startTime.getTime()),
			).toISOString(),
			end: new Date(
				Math.min(interval.endTime.getTime(), dayRange.endTime.getTime()),
			).toISOString(),
		})),
	};
}
