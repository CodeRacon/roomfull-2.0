import {
	type BookedInterval,
	listActiveBookingIntervalsForUnitInRange,
} from "../db/booking.repository.js";
import { findActiveUnitByIdWithRelations } from "../db/unit.repository.js";
import { AppError } from "../lib/app-error.js";
import { bookingTimePolicy } from "./booking-time-policy.js";
import { coworkingCalendar } from "./coworking-calendar.js";

export type DirectBookingCalendarDayState =
	| "available"
	| "partially-booked"
	| "fully-booked";

export type DirectBookingCalendarState = {
	days: {
		date: string;
		state: DirectBookingCalendarDayState;
	}[];
	month: string;
	unitId: string;
};

export type DirectBookingCalendarStateDependencies = {
	findActiveUnitById: (unitId: string) => Promise<{
		id: string;
		unitType: { minDurationMinutes: number; maxDurationMinutes: number };
	} | null>;
	listActiveBookingIntervalsForUnitInRange: (input: {
		unitId: string;
		startTime: Date;
		endTime: Date;
	}) => Promise<BookedInterval[]>;
};

const defaultDependencies: DirectBookingCalendarStateDependencies = {
	findActiveUnitById: findActiveUnitByIdWithRelations,
	listActiveBookingIntervalsForUnitInRange,
};

function listBookableMonthDates(dates: string[]): string[] {
	const today = coworkingCalendar.getTodayDate();

	return dates.filter((date) => {
		const dayOfWeek = coworkingCalendar.getDayOfWeek(date);
		return date >= today && dayOfWeek >= 1 && dayOfWeek <= 5;
	});
}

function getDayIntervals(
	date: string,
	intervals: BookedInterval[],
): BookedInterval[] {
	const dayRange = coworkingCalendar.getDayRange(date);

	return intervals.filter(
		(interval) =>
			interval.startTime < dayRange.endTime &&
			interval.endTime > dayRange.startTime,
	);
}

function resolveDayState(
	date: string,
	intervals: BookedInterval[],
	unitType: { minDurationMinutes: number; maxDurationMinutes: number },
): DirectBookingCalendarDayState {
	const dayIntervals = getDayIntervals(date, intervals);

	if (dayIntervals.length === 0) {
		return "available";
	}

	return bookingTimePolicy.hasDurationValidSlot({
		date,
		minDurationMinutes: unitType.minDurationMinutes,
		maxDurationMinutes: unitType.maxDurationMinutes,
		blockingIntervals: dayIntervals,
	})
		? "partially-booked"
		: "fully-booked";
}

export async function getDirectBookingCalendarState(
	input: { month: string; unitId: string },
	dependencies: DirectBookingCalendarStateDependencies = defaultDependencies,
): Promise<DirectBookingCalendarState> {
	const unitId = input.unitId.trim();

	if (unitId === "") {
		throw new AppError(400, "unitId ist erforderlich");
	}

	const monthRange = coworkingCalendar.getMonthRange(input.month);

	if (monthRange.month < coworkingCalendar.getTodayDate().slice(0, 7)) {
		throw new AppError(400, "month darf nicht in der Vergangenheit liegen");
	}

	const unit = await dependencies.findActiveUnitById(unitId);

	if (!unit) {
		throw new AppError(404, "Unit wurde nicht gefunden");
	}

	const intervals = await dependencies.listActiveBookingIntervalsForUnitInRange(
		{
			unitId,
			startTime: monthRange.startTime,
			endTime: monthRange.endTime,
		},
	);

	return {
		unitId,
		month: monthRange.month,
		days: listBookableMonthDates(monthRange.dates).map((date) => ({
			date,
			state: resolveDayState(date, intervals, unit.unitType),
		})),
	};
}
