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
import { resolveBookingRequestMode } from "./booking-request-mode.js";
import { bookingTimePolicy } from "./booking-time-policy.js";

type GetBookingAvailabilityInput = {
	areaId?: string;
	date?: string;
	unitId?: string;
	unitType?: string;
};

type AvailabilitySlot = {
	start: string;
	end: string;
	availableUnitCount: number;
};

export type BookingAvailability = {
	blockedIntervals: { start: string; end: string }[];
	date: string;
	openingHours: { start: string; end: string };
	slots: AvailabilitySlot[];
	timeGridMinutes: number;
};

type PlannedSlot = {
	start: string;
	end: string;
	startTime: Date;
	endTime: Date;
};

function overlaps(
	interval: { startTime: Date; endTime: Date },
	slot: PlannedSlot,
): boolean {
	return interval.startTime < slot.endTime && interval.endTime > slot.startTime;
}

function countAvailableDirectUnit(
	slot: PlannedSlot,
	blockingIntervals: BookedInterval[],
): number {
	return blockingIntervals.some((interval) => overlaps(interval, slot)) ? 0 : 1;
}

function countAvailableHotDeskUnits(
	slot: PlannedSlot,
	units: UnitForAvailability[],
): number {
	return units.filter(
		(unit) => !unit.bookings.some((booking) => overlaps(booking, slot)),
	).length;
}

function buildResponse(input: {
	plan: ReturnType<typeof bookingTimePolicy.getBookingDayPlan>;
	slots: AvailabilitySlot[];
	blockedIntervals?: { start: string; end: string }[];
}): BookingAvailability {
	return {
		date: input.plan.date,
		timeGridMinutes: input.plan.timeGridMinutes,
		openingHours: input.plan.openingHours,
		slots: input.slots,
		blockedIntervals: input.blockedIntervals ?? [],
	};
}

export async function getBookingAvailability(
	input: GetBookingAvailabilityInput,
): Promise<BookingAvailability> {
	const mode = resolveBookingRequestMode(input);
	const date = input.date?.trim() ?? "";

	if (mode.mode === "DIRECT") {
		const unit = await findActiveUnitByIdWithRelations(mode.unitId);
		if (!unit) throw new AppError(404, "Unit wurde nicht gefunden");

		const plan = bookingTimePolicy.getBookingDayPlan({
			date,
			minDurationMinutes: unit.unitType.minDurationMinutes,
			maxDurationMinutes: unit.unitType.maxDurationMinutes,
		});
		const blockingIntervals = await listActiveBookingIntervalsForUnitInRange({
			unitId: unit.id,
			startTime: plan.startTime,
			endTime: plan.endTime,
		});
		const slots = plan.slots
			.map((slot) => ({
				start: slot.start,
				end: slot.end,
				availableUnitCount: countAvailableDirectUnit(slot, blockingIntervals),
			}))
			.filter((slot) => slot.availableUnitCount > 0);

		return buildResponse({
			plan,
			slots,
			blockedIntervals: bookingTimePolicy.toBlockedIntervals(blockingIntervals),
		});
	}

	const area = await findActiveAreaById(mode.areaId);
	if (!area) throw new AppError(404, "Area wurde nicht gefunden");

	const unitType = await findUnitTypeByName(mode.unitType);
	if (!unitType) throw new AppError(404, "UnitType wurde nicht gefunden");

	const plan = bookingTimePolicy.getBookingDayPlan({
		date,
		minDurationMinutes: unitType.minDurationMinutes,
		maxDurationMinutes: unitType.maxDurationMinutes,
	});
	const units = await listActiveUnitsForAvailability({
		areaId: area.id,
		unitTypeId: unitType.id,
		startTime: plan.startTime,
		endTime: plan.endTime,
	});
	const slots = plan.slots
		.map((slot) => ({
			start: slot.start,
			end: slot.end,
			availableUnitCount: countAvailableHotDeskUnits(slot, units),
		}))
		.filter((slot) => slot.availableUnitCount > 0);

	return buildResponse({ plan, slots });
}
