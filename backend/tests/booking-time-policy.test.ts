import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { AppError } from "../src/lib/app-error.js";
import {
	assertBookableDateTimeRange,
	toUtcDateFromBerlinDateAndMinutes,
} from "../src/services/booking-time-policy.js";

function futureBerlinDate(): string {
	return "2027-01-04";
}

function futureBerlinTime(minutes: number): Date {
	return toUtcDateFromBerlinDateAndMinutes(futureBerlinDate(), minutes);
}

function getErrorMessage(action: () => void): string {
	try {
		action();
	} catch (error) {
		assert(error instanceof AppError);
		return error.message;
	}

	throw new Error("Expected action to throw");
}

describe("Booking Time Grid", () => {
	it("accepts future bookings on the 15-minute grid", () => {
		assert.doesNotThrow(() =>
			assertBookableDateTimeRange(
				futureBerlinTime(9 * 60),
				futureBerlinTime(9 * 60 + 30),
			),
		);
	});

	it("rejects start times outside the 15-minute grid", () => {
		const message = getErrorMessage(() =>
			assertBookableDateTimeRange(
				futureBerlinTime(9 * 60 + 10),
				futureBerlinTime(9 * 60 + 45),
			),
		);

		assert.equal(message, "start muss auf dem 15-Minuten-Zeitraster liegen");
	});

	it("rejects end times outside the 15-minute grid", () => {
		const message = getErrorMessage(() =>
			assertBookableDateTimeRange(
				futureBerlinTime(9 * 60),
				futureBerlinTime(9 * 60 + 35),
			),
		);

		assert.equal(message, "end muss auf dem 15-Minuten-Zeitraster liegen");
	});
});
