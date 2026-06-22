import { type Booking, BookingStatus, type UnitTypeName } from "@prisma/client";
import { findActiveAreaById } from "../db/area.repository.js";
import {
	cancelBooking as cancelBookingRecord,
	findBookingById as findBookingByIdRecord,
	listUserBookings as listUserBookingsRecords,
	type UserBookingRecord,
} from "../db/booking.repository.js";
import {
	countActiveUnitCapacityByAreaAndUnitType,
	createBookingWithTransaction,
	findActiveUnitByIdWithRelations,
	findUnitTypeByName,
	listAvailableUnitsForAllocation,
} from "../db/unit.repository.js";
import { AppError } from "../lib/app-error.js";
import {
	type ContentLocale,
	defaultContentLocale,
	resolveLocalizedDescription,
} from "../lib/content-locale.js";
import { resolveBookingRequestMode } from "./booking-request-mode.js";
import { bookingTimePolicy } from "./booking-time-policy.js";
import { coworkingCalendar } from "./coworking-calendar.js";

type CreateBookingForUserInput = {
	userId: string;
	date: string;
	startTime: string;
	endTime: string;
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

type GetBookingContextInput = {
	unitId?: string;
	areaId?: string;
	unitType?: string;
	locale?: ContentLocale;
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

function mapUnitTypePolicy(
	name: UnitTypeName,
	minDurationMinutes: number,
	maxDurationMinutes: number,
): BookingContextUnitType {
	return { name, minDurationMinutes, maxDurationMinutes };
}

async function getDirectBookingContext(
	unitId: string,
	locale: ContentLocale,
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
			description:
				resolveLocalizedDescription(
					{
						description: unit.description,
						descriptionDe: unit.descriptionDe,
						descriptionEn: unit.descriptionEn,
					},
					locale,
				) ?? unit.description,
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
	locale: ContentLocale;
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
			description: resolveLocalizedDescription(area, input.locale),
			seatCount,
		},
	};
}

export async function getBookingContext(
	input: GetBookingContextInput,
): Promise<BookingContext> {
	const entry = resolveBookingRequestMode(input);
	const locale = input.locale ?? defaultContentLocale;

	if (entry.mode === "DIRECT") {
		return getDirectBookingContext(entry.unitId, locale);
	}

	return getAutoAssignBookingContext({
		areaId: entry.areaId,
		unitType: entry.unitType,
		locale,
	});
}

async function createDirectBooking(input: {
	userId: string;
	unitId: string;
	date: string;
	startTime: string;
	endTime: string;
}): Promise<Booking> {
	const unit = await findActiveUnitByIdWithRelations(input.unitId);
	if (!unit) {
		throw new AppError(404, "Unit wurde nicht gefunden");
	}

	const { startTime, endTime } = bookingTimePolicy.resolveBookingTimeInput({
		date: input.date,
		startTime: input.startTime,
		endTime: input.endTime,
		minDurationMinutes: unit.unitType.minDurationMinutes,
		maxDurationMinutes: unit.unitType.maxDurationMinutes,
	});

	const booking = await createBookingWithTransaction({
		userId: input.userId,
		unitId: unit.id,
		startTime,
		endTime,
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
	date: string;
	startTime: string;
	endTime: string;
}): Promise<Booking> {
	const area = await findActiveAreaById(input.areaId);
	if (!area) {
		throw new AppError(404, "Area wurde nicht gefunden");
	}

	const unitType = await findUnitTypeByName(input.unitType);
	if (!unitType) {
		throw new AppError(404, "UnitType wurde nicht gefunden");
	}

	const { startTime, endTime } = bookingTimePolicy.resolveBookingTimeInput({
		date: input.date,
		startTime: input.startTime,
		endTime: input.endTime,
		minDurationMinutes: unitType.minDurationMinutes,
		maxDurationMinutes: unitType.maxDurationMinutes,
	});

	for (let attempt = 0; attempt < 3; attempt += 1) {
		const candidates = await listAvailableUnitsForAllocation({
			areaId: area.id,
			unitTypeId: unitType.id,
			startTime,
			endTime,
		});

		for (const candidate of candidates) {
			const booking = await createBookingWithTransaction({
				userId: input.userId,
				unitId: candidate.id,
				startTime,
				endTime,
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
	const userId = input.userId.trim();
	if (userId === "") {
		throw new AppError(400, "userId ist erforderlich");
	}

	const mode = resolveBookingRequestMode(input);

	if (mode.mode === "DIRECT") {
		return createDirectBooking({
			userId,
			unitId: mode.unitId,
			date: input.date,
			startTime: input.startTime,
			endTime: input.endTime,
		});
	}

	return createAutoAssignedHotDeskBooking({
		userId,
		areaId: mode.areaId,
		unitType: mode.unitType,
		date: input.date,
		startTime: input.startTime,
		endTime: input.endTime,
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

	if (booking.startTime <= coworkingCalendar.now()) {
		throw new AppError(409, "Nur zukünftige Buchungen können storniert werden");
	}

	return cancelBookingRecord({ bookingId });
}
