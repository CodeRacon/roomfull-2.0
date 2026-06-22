import { BookingStatus, UnitTypeName } from "@prisma/client";
import {
	type BookingDemandRecord,
	listBookingDemandRecordsInRange,
} from "../db/analytics.repository.js";
import { AppError } from "../lib/app-error.js";
import { coworkingCalendar } from "./coworking-calendar.js";

type GetBookingDemandInput = {
	from?: string;
	to?: string;
};

export type BookingDemandTrendPoint = {
	date: string;
	bookingCount: number;
};

export type BookingDemandUnitTypePoint = {
	unitType: UnitTypeName;
	bookingCount: number;
};

export type BookingCancellationStats = {
	activeBookings: number;
	cancelledBookings: number;
	totalBookings: number;
	cancellationRate: number;
};

export type BookingDemandAnalytics = {
	cancellationStats: BookingCancellationStats;
	dateRange: {
		from: string;
		to: string;
	};
	demandByUnitType: BookingDemandUnitTypePoint[];
	granularity: "day";
	metric: "activeBookingsByStartDate";
	trend: BookingDemandTrendPoint[];
};

const UNIT_TYPE_ORDER: UnitTypeName[] = [
	UnitTypeName.HOT_DESK,
	UnitTypeName.BOOTH,
	UnitTypeName.TEAM_ROOM,
	UnitTypeName.MEETING_ROOM,
];

function getDefaultBookingDemandDateRange(): { from: string; to: string } {
	const today = coworkingCalendar.getTodayDate();

	return {
		from: coworkingCalendar.addDays(today, -30),
		to: coworkingCalendar.addDays(today, 30),
	};
}

function resolveBookingDemandDateRange(input: GetBookingDemandInput): {
	from: string;
	fromStart: Date;
	to: string;
	toEnd: Date;
} {
	const defaultRange = getDefaultBookingDemandDateRange();
	const from = input.from?.trim() || defaultRange.from;
	const to = input.to?.trim() || defaultRange.to;

	if (from > to) {
		throw new AppError(400, "from darf nicht nach to liegen");
	}

	return {
		from,
		fromStart: coworkingCalendar.getDayRange(from).startTime,
		to,
		toEnd: coworkingCalendar.getDayRange(to).endTime,
	};
}

export function buildBookingDemandTrend(input: {
	bookings: BookingDemandRecord[];
	from: string;
	to: string;
}): BookingDemandTrendPoint[] {
	const countsByDate = new Map<string, number>();

	for (const booking of input.bookings) {
		const date = coworkingCalendar.getDateString(booking.startTime);
		countsByDate.set(date, (countsByDate.get(date) ?? 0) + 1);
	}

	const trend: BookingDemandTrendPoint[] = [];

	for (
		let date = input.from;
		date <= input.to;
		date = coworkingCalendar.addDays(date, 1)
	) {
		trend.push({
			date,
			bookingCount: countsByDate.get(date) ?? 0,
		});
	}

	return trend;
}

export function buildBookingDemandByUnitType(input: {
	bookings: BookingDemandRecord[];
}): BookingDemandUnitTypePoint[] {
	const countsByUnitType = new Map<UnitTypeName, number>();

	for (const booking of input.bookings) {
		const unitType = booking.unit.unitType.name;
		countsByUnitType.set(unitType, (countsByUnitType.get(unitType) ?? 0) + 1);
	}

	return UNIT_TYPE_ORDER.map((unitType) => ({
		unitType,
		bookingCount: countsByUnitType.get(unitType) ?? 0,
	}));
}

export function buildBookingCancellationStats(input: {
	bookings: BookingDemandRecord[];
}): BookingCancellationStats {
	let activeBookings = 0;
	let cancelledBookings = 0;

	for (const booking of input.bookings) {
		if (booking.status === BookingStatus.ACTIVE) {
			activeBookings += 1;
			continue;
		}

		if (booking.status === BookingStatus.CANCELLED) {
			cancelledBookings += 1;
		}
	}

	const totalBookings = activeBookings + cancelledBookings;

	return {
		activeBookings,
		cancelledBookings,
		totalBookings,
		cancellationRate: totalBookings > 0 ? cancelledBookings / totalBookings : 0,
	};
}

export async function getBookingDemandAnalytics(
	input: GetBookingDemandInput = {},
): Promise<BookingDemandAnalytics> {
	const dateRange = resolveBookingDemandDateRange(input);
	const bookings = await listBookingDemandRecordsInRange({
		fromStart: dateRange.fromStart,
		toEnd: dateRange.toEnd,
	});
	const activeBookings = bookings.filter(
		(booking) => booking.status === BookingStatus.ACTIVE,
	);

	return {
		cancellationStats: buildBookingCancellationStats({ bookings }),
		dateRange: {
			from: dateRange.from,
			to: dateRange.to,
		},
		demandByUnitType: buildBookingDemandByUnitType({
			bookings: activeBookings,
		}),
		granularity: "day",
		metric: "activeBookingsByStartDate",
		trend: buildBookingDemandTrend({
			bookings: activeBookings,
			from: dateRange.from,
			to: dateRange.to,
		}),
	};
}
