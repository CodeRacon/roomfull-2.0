import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { AppError } from "../src/lib/app-error.js";
import { createAdminBookingOperations } from "../src/services/admin-booking-operations.js";
import { createCoworkingCalendar } from "../src/services/coworking-calendar.js";

const fixedCalendar = createCoworkingCalendar({
	now: () => new Date("2026-06-22T08:07:00.000Z"),
});

function createOperations() {
	const listScopes: unknown[] = [];
	const countScopes: unknown[] = [];
	const topBookedUnitScopes: unknown[] = [];
	const topBookedUnit = {
		id: "unit-1",
		name: "Booth Eins",
		unitType: "BOOTH" as const,
		bookingCount: 3,
	};
	const operations = createAdminBookingOperations({
		calendar: fixedCalendar,
		source: {
			listBookings: async (scope) => {
				listScopes.push(scope);
				return [];
			},
			countBookings: async (scope) => {
				countScopes.push(scope);
				switch (scope.status) {
					case "today":
						return 2;
					case "upcoming":
						return 5;
					case "cancelled":
						return 1;
				}
			},
			findTopBookedUnit: async (scope) => {
				topBookedUnitScopes.push(scope);
				return topBookedUnit;
			},
		},
	});

	return {
		countScopes,
		listScopes,
		operations,
		topBookedUnit,
		topBookedUnitScopes,
	};
}

function assertBadRequest(action: () => Promise<unknown>): Promise<void> {
	return assert.rejects(
		action,
		(error: unknown) => error instanceof AppError && error.statusCode === 400,
	);
}

describe("Admin Booking Operations", () => {
	it("resolves rolling Berlin date ranges from status and preset", async () => {
		const cases = [
			{
				status: "today" as const,
				range: "year" as const,
				expected: { from: "2026-06-22", to: "2026-06-22" },
			},
			{
				status: "upcoming" as const,
				range: "week" as const,
				expected: { from: "2026-06-22", to: "2026-06-28" },
			},
			{
				status: "completed" as const,
				range: "month" as const,
				expected: { from: "2026-05-24", to: "2026-06-22" },
			},
			{
				status: "all" as const,
				range: "quarter" as const,
				expected: { from: "2026-03-25", to: "2026-09-19" },
			},
		];

		for (const testCase of cases) {
			const { operations } = createOperations();
			const result = await operations.get({
				status: testCase.status,
				range: testCase.range,
			});

			assert.deepEqual(result.dateRange, testCase.expected);
		}
	});

	it("accepts an explicit date range and rejects ambiguous range input", async () => {
		const { operations } = createOperations();
		const result = await operations.get({
			status: "cancelled",
			from: "2026-01-01",
			to: "2026-01-31",
		});

		assert.deepEqual(result.dateRange, {
			from: "2026-01-01",
			to: "2026-01-31",
		});
		await assertBadRequest(() =>
			operations.get({
				status: "upcoming",
				range: "month",
				from: "2026-06-22",
				to: "2026-07-21",
			}),
		);
		await assertBadRequest(() =>
			operations.get({ status: "upcoming", from: "2026-06-22" }),
		);
	});

	it("returns one Operations dataset with distinct list and summary scopes", async () => {
		const {
			countScopes,
			listScopes,
			operations,
			topBookedUnit,
			topBookedUnitScopes,
		} = createOperations();
		const result = await operations.get({
			status: "completed",
			range: "month",
			search: "  max@example.com  ",
			limit: "25",
		});

		assert.deepEqual(result, {
			bookings: [],
			dateRange: { from: "2026-05-24", to: "2026-06-22" },
			summary: {
				todayBookings: 2,
				upcomingInRange: 5,
				cancelledInRange: 1,
				topBookedUnit,
			},
		});
		assert.deepEqual(listScopes, [
			{
				dateRange: { from: "2026-05-24", to: "2026-06-22" },
				limit: 25,
				search: "max@example.com",
				status: "completed",
			},
		]);
		assert.deepEqual(countScopes, [
			{
				dateRange: { from: "2026-06-22", to: "2026-06-22" },
				search: "max@example.com",
				status: "today",
			},
			{
				dateRange: { from: "2026-05-24", to: "2026-06-22" },
				search: "max@example.com",
				status: "upcoming",
			},
			{
				dateRange: { from: "2026-05-24", to: "2026-06-22" },
				search: "max@example.com",
				status: "cancelled",
			},
		]);
		assert.deepEqual(topBookedUnitScopes, [
			{
				dateRange: { from: "2026-05-24", to: "2026-06-22" },
				search: "max@example.com",
			},
		]);
	});
});
