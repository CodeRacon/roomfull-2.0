import { BookingStatus, type UnitTypeName } from "@prisma/client";
import {
	type AdminBookingRecord,
	countAdminBookings,
	findTopBookedAdminUnit,
	listAllBookings,
} from "../db/booking.repository.js";
import { AppError } from "../lib/app-error.js";
import {
	type CoworkingCalendar,
	coworkingCalendar,
} from "./coworking-calendar.js";

export type AdminBookingViewStatus =
	| "upcoming"
	| "today"
	| "completed"
	| "cancelled"
	| "all";

export type AdminBookingRangePreset = "week" | "month" | "quarter" | "year";

type AdminBookingDateRange = { from: string; to: string };
type AdminBookingSearchScope = {
	dateRange: AdminBookingDateRange;
	search?: string;
};

export type AdminBookingListScope = AdminBookingSearchScope & {
	limit: number;
	status: AdminBookingViewStatus;
};

export type AdminBookingCountScope = AdminBookingSearchScope & {
	status: "today" | "upcoming" | "cancelled";
};

export type AdminBookingTopBookedUnit = {
	id: string;
	name: string;
	unitType: UnitTypeName;
	bookingCount: number;
};

export type AdminBookingOperationsSource = {
	listBookings: (scope: AdminBookingListScope) => Promise<AdminBookingRecord[]>;
	countBookings: (scope: AdminBookingCountScope) => Promise<number>;
	findTopBookedUnit: (
		scope: AdminBookingSearchScope,
	) => Promise<AdminBookingTopBookedUnit | undefined>;
};

type GetAdminBookingOperationsInput = {
	from?: string;
	limit?: string;
	range?: string;
	search?: string;
	status?: string;
	to?: string;
};

const RANGE_DAYS: Record<AdminBookingRangePreset, number> = {
	week: 7,
	month: 30,
	quarter: 90,
	year: 365,
};

function parseStatus(value?: string): AdminBookingViewStatus {
	const status = value?.trim() || "upcoming";

	switch (status) {
		case "upcoming":
		case "today":
		case "completed":
		case "cancelled":
		case "all":
			return status;
		default:
			throw new AppError(400, "status ist ungültig");
	}
}

function parseRange(value?: string): AdminBookingRangePreset {
	const range = value?.trim() || "month";

	switch (range) {
		case "week":
		case "month":
		case "quarter":
		case "year":
			return range;
		default:
			throw new AppError(400, "range ist ungültig");
	}
}

function parseLimit(value?: string): number {
	const normalized = value?.trim() || "100";
	const limit = Number(normalized);

	if (!Number.isInteger(limit) || limit < 1 || limit > 500) {
		throw new AppError(400, "limit muss zwischen 1 und 500 liegen");
	}

	return limit;
}

function resolveDateRange(input: {
	calendar: CoworkingCalendar;
	from?: string;
	range?: string;
	status: AdminBookingViewStatus;
	to?: string;
}): AdminBookingDateRange {
	const from = input.from?.trim() || "";
	const to = input.to?.trim() || "";
	const hasExplicitRange = from !== "" || to !== "";

	if (hasExplicitRange && input.range?.trim()) {
		throw new AppError(400, "range darf nicht mit from/to kombiniert werden");
	}

	if (hasExplicitRange) {
		if (from === "" || to === "") {
			throw new AppError(400, "from und to müssen gemeinsam angegeben werden");
		}

		const normalizedFrom = input.calendar.getDayRange(from).date;
		const normalizedTo = input.calendar.getDayRange(to).date;
		if (normalizedFrom > normalizedTo) {
			throw new AppError(400, "from darf nicht nach to liegen");
		}

		return { from: normalizedFrom, to: normalizedTo };
	}

	const today = input.calendar.getTodayDate();
	if (input.status === "today") {
		return { from: today, to: today };
	}

	const offset = RANGE_DAYS[parseRange(input.range)] - 1;
	if (input.status === "upcoming") {
		return { from: today, to: input.calendar.addDays(today, offset) };
	}

	if (input.status === "completed" || input.status === "cancelled") {
		return { from: input.calendar.addDays(today, -offset), to: today };
	}

	return {
		from: input.calendar.addDays(today, -offset),
		to: input.calendar.addDays(today, offset),
	};
}

function createDefaultSource(
	calendar: CoworkingCalendar,
): AdminBookingOperationsSource {
	function getRange(dateRange: AdminBookingDateRange) {
		return {
			fromStart: calendar.getDayRange(dateRange.from).startTime,
			toEnd: calendar.getDayRange(dateRange.to).endTime,
		};
	}

	function getListQuery(scope: AdminBookingListScope) {
		const range = getRange(scope.dateRange);
		const now = calendar.now();

		switch (scope.status) {
			case "upcoming":
				return {
					...range,
					endAtOrAfter: now > range.fromStart ? now : range.fromStart,
					limit: scope.limit,
					orderBy: { startTime: "asc" as const },
					search: scope.search,
					status: BookingStatus.ACTIVE,
				};
			case "today":
				return {
					...range,
					endAfter: range.fromStart,
					limit: scope.limit,
					orderBy: { startTime: "asc" as const },
					search: scope.search,
					status: BookingStatus.ACTIVE,
				};
			case "completed":
				return {
					...range,
					endAfter: range.fromStart,
					endBefore: now,
					limit: scope.limit,
					orderBy: { endTime: "desc" as const },
					search: scope.search,
					status: BookingStatus.ACTIVE,
				};
			case "cancelled":
				return {
					...range,
					endAfter: range.fromStart,
					limit: scope.limit,
					orderBy: { updatedAt: "desc" as const },
					search: scope.search,
					status: BookingStatus.CANCELLED,
				};
			case "all":
				return {
					...range,
					endAfter: range.fromStart,
					limit: scope.limit,
					orderBy: { startTime: "asc" as const },
					search: scope.search,
				};
		}
	}

	return {
		listBookings: (scope) => listAllBookings(getListQuery(scope)),
		countBookings: (scope) => {
			const range = getRange(scope.dateRange);
			const now = calendar.now();

			if (scope.status === "today") {
				return countAdminBookings({
					...range,
					endAfter: range.fromStart,
					search: scope.search,
					status: BookingStatus.ACTIVE,
				});
			}

			if (scope.status === "upcoming") {
				return countAdminBookings({
					...range,
					endAtOrAfter: now > range.fromStart ? now : range.fromStart,
					search: scope.search,
					status: BookingStatus.ACTIVE,
				});
			}

			return countAdminBookings({
				...range,
				endAfter: range.fromStart,
				search: scope.search,
				status: BookingStatus.CANCELLED,
			});
		},
		findTopBookedUnit: (scope) => {
			const range = getRange(scope.dateRange);
			return findTopBookedAdminUnit({
				...range,
				endAfter: range.fromStart,
				search: scope.search,
				status: BookingStatus.ACTIVE,
			});
		},
	};
}

export function createAdminBookingOperations(dependencies: {
	calendar: CoworkingCalendar;
	source: AdminBookingOperationsSource;
}) {
	return {
		async get(input: GetAdminBookingOperationsInput = {}) {
			const status = parseStatus(input.status);
			const dateRange = resolveDateRange({
				calendar: dependencies.calendar,
				from: input.from,
				range: input.range,
				status,
				to: input.to,
			});
			const search = input.search?.trim() || undefined;
			const listScope = {
				dateRange,
				limit: parseLimit(input.limit),
				search,
				status,
			};
			const summaryScope = { dateRange, search };
			const today = dependencies.calendar.getTodayDate();

			const [
				bookings,
				todayBookings,
				upcomingInRange,
				cancelledInRange,
				topBookedUnit,
			] = await Promise.all([
				dependencies.source.listBookings(listScope),
				dependencies.source.countBookings({
					dateRange: { from: today, to: today },
					search,
					status: "today",
				}),
				dependencies.source.countBookings({
					...summaryScope,
					status: "upcoming",
				}),
				dependencies.source.countBookings({
					...summaryScope,
					status: "cancelled",
				}),
				dependencies.source.findTopBookedUnit(summaryScope),
			]);

			return {
				bookings,
				dateRange,
				summary: {
					todayBookings,
					upcomingInRange,
					cancelledInRange,
					topBookedUnit,
				},
			};
		},
	};
}

export const adminBookingOperations = createAdminBookingOperations({
	calendar: coworkingCalendar,
	source: createDefaultSource(coworkingCalendar),
});
