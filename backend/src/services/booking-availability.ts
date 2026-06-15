import { UnitTypeName } from "@prisma/client";
import { findActiveAreaById } from "../db/area.repository.js";
import {
	type BookedInterval,
	listActiveBookingIntervalsForUnitInRange,
} from "../db/booking.repository.js";
import {
	findActiveUnitByIdWithRelations,
	findUnitTypeByName,
	listActiveUnitsForAvailability,
	type UnitForAvailability,
} from "../db/unit.repository.js";
import { AppError } from "../lib/app-error.js";
import {
	BOOKING_TIME_GRID_MINUTES,
	CLOSING_MINUTES,
	formatMinutesOfDay,
	getBerlinMinutesOfDay,
	getBookableBerlinDayRange,
	getFirstBookableStartMinutesForDate,
	OPENING_MINUTES,
	toUtcDateFromBerlinDateAndMinutes,
} from "./booking-time-policy.js";

type GetBookingAvailabilityInput = {
	areaId?: string;
	date?: string;
	unitId?: string;
	unitType?: string;
};

type MinuteInterval = {
	start: number;
	end: number;
};

type AvailabilityMode =
	| {
			mode: "DIRECT";
			unitId: string;
	  }
	| {
			mode: "HOT_DESK";
			areaId: string;
			unitType: UnitTypeName;
	  };

type AvailabilitySlot = {
	start: string;
	end: string;
	availableUnitCount: number;
};

type BlockedInterval = {
	start: string;
	end: string;
};

export type BookingAvailability = {
	blockedIntervals: BlockedInterval[];
	date: string;
	openingHours: {
		start: string;
		end: string;
	};
	slots: AvailabilitySlot[];
	timeGridMinutes: number;
};

function normalizeAvailabilityMode(
	input: GetBookingAvailabilityInput,
): AvailabilityMode {
	const unitId = input.unitId?.trim() ?? "";
	const areaId = input.areaId?.trim() ?? "";
	const unitTypeRaw = input.unitType?.trim().toUpperCase() ?? "";

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
			"Für Hot-Desk-Availability sind areaId und unitType erforderlich",
		);
	}

	if (unitTypeRaw !== UnitTypeName.HOT_DESK) {
		throw new AppError(
			400,
			"Hot-Desk-Availability ist in V1 nur für HOT_DESK erlaubt",
		);
	}

	return { mode: "HOT_DESK", areaId, unitType: UnitTypeName.HOT_DESK };
}

function normalizeAvailabilityDate(date?: string): string {
	const normalizedDate = date?.trim() ?? "";

	if (normalizedDate.length === 0) {
		throw new AppError(400, "date Query-Parameter ist erforderlich");
	}

	return normalizedDate;
}

function overlaps(
	firstInterval: { startTime: Date; endTime: Date },
	secondInterval: { startTime: Date; endTime: Date },
): boolean {
	return (
		firstInterval.startTime < secondInterval.endTime &&
		firstInterval.endTime > secondInterval.startTime
	);
}

function roundUpToGrid(minutes: number): number {
	const remainder = minutes % BOOKING_TIME_GRID_MINUTES;
	return remainder === 0
		? minutes
		: minutes + (BOOKING_TIME_GRID_MINUTES - remainder);
}

function roundDownToGrid(minutes: number): number {
	return minutes - (minutes % BOOKING_TIME_GRID_MINUTES);
}

function listSlotMinuteIntervals(input: {
	date: string;
	minDurationMinutes: number;
	maxDurationMinutes: number;
}): MinuteInterval[] {
	const firstStart = getFirstBookableStartMinutesForDate(input.date);
	const firstDuration = roundUpToGrid(input.minDurationMinutes);
	const maxDuration = roundDownToGrid(input.maxDurationMinutes);
	const slots: MinuteInterval[] = [];

	for (
		let start = firstStart;
		start + firstDuration <= CLOSING_MINUTES;
		start += BOOKING_TIME_GRID_MINUTES
	) {
		for (
			let end = start + firstDuration;
			end <= CLOSING_MINUTES && end - start <= maxDuration;
			end += BOOKING_TIME_GRID_MINUTES
		) {
			slots.push({ start, end });
		}
	}

	return slots;
}

function toSlotDateInterval(date: string, slot: MinuteInterval) {
	return {
		startTime: toUtcDateFromBerlinDateAndMinutes(date, slot.start),
		endTime: toUtcDateFromBerlinDateAndMinutes(date, slot.end),
	};
}

function countAvailableDirectUnit(input: {
	blockingIntervals: BookedInterval[];
	date: string;
	slot: MinuteInterval;
}): number {
	const slotDateInterval = toSlotDateInterval(input.date, input.slot);

	return input.blockingIntervals.some((blockingInterval) =>
		overlaps(blockingInterval, slotDateInterval),
	)
		? 0
		: 1;
}

function countAvailableHotDeskUnits(input: {
	date: string;
	slot: MinuteInterval;
	units: UnitForAvailability[];
}): number {
	const slotDateInterval = toSlotDateInterval(input.date, input.slot);

	return input.units.filter(
		(unit) =>
			!unit.bookings.some((booking) => overlaps(booking, slotDateInterval)),
	).length;
}

function toAvailabilitySlot(input: {
	availableUnitCount: number;
	slot: MinuteInterval;
}): AvailabilitySlot {
	return {
		start: formatMinutesOfDay(input.slot.start),
		end: formatMinutesOfDay(input.slot.end),
		availableUnitCount: input.availableUnitCount,
	};
}

function mergeMinuteIntervals(intervals: MinuteInterval[]): MinuteInterval[] {
	const sortedIntervals = intervals
		.filter((interval) => interval.end > interval.start)
		.sort(
			(firstInterval, secondInterval) =>
				firstInterval.start - secondInterval.start,
		);
	const mergedIntervals: MinuteInterval[] = [];

	for (const interval of sortedIntervals) {
		const lastInterval = mergedIntervals.at(-1);

		if (!lastInterval || interval.start > lastInterval.end) {
			mergedIntervals.push({ ...interval });
			continue;
		}

		lastInterval.end = Math.max(lastInterval.end, interval.end);
	}

	return mergedIntervals;
}

function toBlockedIntervals(intervals: BookedInterval[]): BlockedInterval[] {
	return mergeMinuteIntervals(
		intervals.map((interval) => ({
			start: Math.max(
				OPENING_MINUTES,
				roundDownToGrid(getBerlinMinutesOfDay(interval.startTime)),
			),
			end: Math.min(
				CLOSING_MINUTES,
				roundUpToGrid(getBerlinMinutesOfDay(interval.endTime)),
			),
		})),
	).map((interval) => ({
		start: formatMinutesOfDay(interval.start),
		end: formatMinutesOfDay(interval.end),
	}));
}

function buildAvailabilityResponse(input: {
	blockedIntervals: BlockedInterval[];
	date: string;
	slots: AvailabilitySlot[];
}): BookingAvailability {
	return {
		date: input.date,
		timeGridMinutes: BOOKING_TIME_GRID_MINUTES,
		openingHours: {
			start: formatMinutesOfDay(OPENING_MINUTES),
			end: formatMinutesOfDay(CLOSING_MINUTES),
		},
		slots: input.slots,
		blockedIntervals: input.blockedIntervals,
	};
}

export async function getBookingAvailability(
	input: GetBookingAvailabilityInput,
): Promise<BookingAvailability> {
	const date = normalizeAvailabilityDate(input.date);
	const dayRange = getBookableBerlinDayRange(date);
	const mode = normalizeAvailabilityMode(input);

	if (mode.mode === "DIRECT") {
		const unit = await findActiveUnitByIdWithRelations(mode.unitId);

		if (!unit) {
			throw new AppError(404, "Unit wurde nicht gefunden");
		}

		const blockingIntervals = await listActiveBookingIntervalsForUnitInRange({
			unitId: unit.id,
			startTime: dayRange.startTime,
			endTime: dayRange.endTime,
		});
		const slots = listSlotMinuteIntervals({
			date: dayRange.date,
			minDurationMinutes: unit.unitType.minDurationMinutes,
			maxDurationMinutes: unit.unitType.maxDurationMinutes,
		})
			.map((slot) => ({
				slot,
				availableUnitCount: countAvailableDirectUnit({
					blockingIntervals,
					date: dayRange.date,
					slot,
				}),
			}))
			.filter((slot) => slot.availableUnitCount > 0)
			.map(toAvailabilitySlot);

		return buildAvailabilityResponse({
			date: dayRange.date,
			slots,
			blockedIntervals: toBlockedIntervals(blockingIntervals),
		});
	}

	const area = await findActiveAreaById(mode.areaId);
	if (!area) {
		throw new AppError(404, "Area wurde nicht gefunden");
	}

	const unitType = await findUnitTypeByName(mode.unitType);
	if (!unitType) {
		throw new AppError(404, "UnitType wurde nicht gefunden");
	}

	const units = await listActiveUnitsForAvailability({
		areaId: area.id,
		unitTypeId: unitType.id,
		startTime: dayRange.startTime,
		endTime: dayRange.endTime,
	});
	const slots = listSlotMinuteIntervals({
		date: dayRange.date,
		minDurationMinutes: unitType.minDurationMinutes,
		maxDurationMinutes: unitType.maxDurationMinutes,
	})
		.map((slot) => ({
			slot,
			availableUnitCount: countAvailableHotDeskUnits({
				date: dayRange.date,
				slot,
				units,
			}),
		}))
		.filter((slot) => slot.availableUnitCount > 0)
		.map(toAvailabilitySlot);

	return buildAvailabilityResponse({
		date: dayRange.date,
		slots,
		blockedIntervals: [],
	});
}
