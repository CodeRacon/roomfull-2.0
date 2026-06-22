import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { AppError } from "../src/lib/app-error.js";
import {
	type DirectBookingCalendarStateDependencies,
	getDirectBookingCalendarState,
} from "../src/services/direct-booking-calendar-state.js";

function findDay(
	days: Awaited<ReturnType<typeof getDirectBookingCalendarState>>["days"],
	date: string,
) {
	return days.find((day) => day.date === date);
}

function createDependencies(input?: {
	activeUnitExists?: boolean;
	intervals?: { startTime: Date; endTime: Date }[];
	onRangeRead?: () => void;
}): DirectBookingCalendarStateDependencies {
	return {
		findActiveUnitById: async (unitId) =>
			input?.activeUnitExists === false
				? null
				: {
						id: unitId,
						unitType: {
							minDurationMinutes: 60,
							maxDurationMinutes: 240,
						},
					},
		listActiveBookingIntervalsForUnitInRange: async () => {
			input?.onRangeRead?.();
			return input?.intervals ?? [];
		},
	};
}

async function assertAppError(
	action: () => Promise<unknown>,
	statusCode: number,
): Promise<void> {
	await assert.rejects(
		action,
		(error: unknown) =>
			error instanceof AppError && error.statusCode === statusCode,
	);
}

describe("Direct Booking Calendar State", () => {
	it("returns a future month with one range read and no raw intervals", async () => {
		let rangeReadCount = 0;
		const calendarState = await getDirectBookingCalendarState(
			{ unitId: " unit-1 ", month: " 2099-01 " },
			createDependencies({
				onRangeRead: () => {
					rangeReadCount += 1;
				},
				intervals: [
					{
						startTime: new Date("2099-01-05T08:00:00+01:00"),
						endTime: new Date("2099-01-05T21:30:00+01:00"),
					},
					{
						startTime: new Date("2099-01-06T08:00:00+01:00"),
						endTime: new Date("2099-01-06T10:00:00+01:00"),
					},
				],
			}),
		);

		assert.equal(calendarState.unitId, "unit-1");
		assert.equal(calendarState.month, "2099-01");
		assert.equal(findDay(calendarState.days, "2099-01-01")?.state, "available");
		assert.equal(
			findDay(calendarState.days, "2099-01-05")?.state,
			"fully-booked",
		);
		assert.equal(
			findDay(calendarState.days, "2099-01-06")?.state,
			"partially-booked",
		);
		assert.equal(findDay(calendarState.days, "2099-01-03"), undefined);
		assert.equal(rangeReadCount, 1);
		assert.equal("bookedIntervals" in calendarState, false);
	});

	it("rejects missing, malformed, impossible, and past months", async () => {
		for (const month of ["", "2099-1", "2099-13", "2000-01"]) {
			await assertAppError(
				() =>
					getDirectBookingCalendarState(
						{ unitId: "unit-1", month },
						createDependencies(),
					),
				400,
			);
		}
	});

	it("rejects missing unit IDs and inactive or unknown BookableUnits", async () => {
		await assertAppError(
			() =>
				getDirectBookingCalendarState(
					{ unitId: " ", month: "2099-01" },
					createDependencies(),
				),
			400,
		);
		await assertAppError(
			() =>
				getDirectBookingCalendarState(
					{ unitId: "unit-1", month: "2099-01" },
					createDependencies({ activeUnitExists: false }),
				),
			404,
		);
	});
});
