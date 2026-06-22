import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { AppError } from "../src/lib/app-error.js";
import { createBookingTimePolicy } from "../src/services/booking-time-policy.js";
import { createCoworkingCalendar } from "../src/services/coworking-calendar.js";

const fixedCalendar = createCoworkingCalendar({
	now: () => new Date("2026-06-22T08:07:00.000Z"),
});
const policy = createBookingTimePolicy(fixedCalendar);

function assertBadRequest(action: () => unknown): void {
	assert.throws(
		action,
		(error: unknown) => error instanceof AppError && error.statusCode === 400,
	);
}

describe("Booking Time Policy", () => {
	it("resolves local Coworking Time independently of the browser timezone", () => {
		const summer = policy.resolveBookingTimeInput({
			date: "2026-07-01",
			startTime: "09:00",
			endTime: "10:00",
		});
		const winter = policy.resolveBookingTimeInput({
			date: "2027-01-04",
			startTime: "09:00",
			endTime: "10:00",
		});

		assert.equal(summer.startTime.toISOString(), "2026-07-01T07:00:00.000Z");
		assert.equal(summer.endTime.toISOString(), "2026-07-01T08:00:00.000Z");
		assert.equal(winter.startTime.toISOString(), "2027-01-04T08:00:00.000Z");
		assert.equal(winter.endTime.toISOString(), "2027-01-04T09:00:00.000Z");
	});

	it("accepts Booking Time Input at the Duration Policy boundaries", () => {
		const minimumDurationInput = {
			date: "2026-07-01",
			startTime: "09:00",
			endTime: "09:30",
			minDurationMinutes: 30,
			maxDurationMinutes: 60,
		};
		const maximumDurationInput = {
			...minimumDurationInput,
			endTime: "10:00",
		};

		assert.doesNotThrow(() =>
			policy.resolveBookingTimeInput(minimumDurationInput),
		);
		assert.doesNotThrow(() =>
			policy.resolveBookingTimeInput(maximumDurationInput),
		);
	});

	it("rejects Booking Time Input outside the Duration Policy boundaries", () => {
		for (const input of [
			{
				date: "2026-07-01",
				startTime: "09:00",
				endTime: "09:15",
				minDurationMinutes: 30,
				maxDurationMinutes: 60,
			},
			{
				date: "2026-07-01",
				startTime: "09:00",
				endTime: "10:15",
				minDurationMinutes: 30,
				maxDurationMinutes: 60,
			},
		]) {
			assertBadRequest(() => policy.resolveBookingTimeInput(input));
		}
	});

	it("rejects malformed, past, weekend, reversed, off-grid, and closed-hour inputs", () => {
		for (const input of [
			{ date: "bad", startTime: "09:00", endTime: "10:00" },
			{ date: "2026-06-19", startTime: "09:00", endTime: "10:00" },
			{ date: "2026-06-27", startTime: "09:00", endTime: "10:00" },
			{ date: "2026-07-01", startTime: "10:00", endTime: "09:00" },
			{ date: "2026-07-01", startTime: "09:10", endTime: "10:00" },
			{ date: "2026-07-01", startTime: "07:45", endTime: "09:00" },
		]) {
			assertBadRequest(() => policy.resolveBookingTimeInput(input));
		}
	});

	it("plans today's slots from the next future grid point", () => {
		const plan = policy.getBookingDayPlan({
			date: "2026-06-22",
			minDurationMinutes: 30,
			maxDurationMinutes: 60,
		});

		assert.equal(plan.slots[0]?.start, "10:15");
		assert.equal(plan.slots[0]?.end, "10:45");
		assert.deepEqual(plan.openingHours, { start: "08:00", end: "22:00" });
		assert.equal(plan.timeGridMinutes, 15);
	});

	it("can evaluate duration-valid slots without the Today Booking Start Rule", () => {
		const hasSlot = policy.hasDurationValidSlot({
			date: "2026-06-22",
			minDurationMinutes: 60,
			maxDurationMinutes: 240,
			blockingIntervals: [
				{
					startTime: new Date("2026-06-22T06:00:00.000Z"),
					endTime: new Date("2026-06-22T19:30:00.000Z"),
				},
			],
		});

		assert.equal(hasSlot, false);
	});
});
