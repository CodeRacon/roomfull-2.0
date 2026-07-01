import { describe, expect, it } from "vitest";
import type { BookingContext } from "@/entities/booking";
import { ApiRequestError } from "@/shared/api";
import { getDictionary } from "@/shared/i18n";
import {
	buildBookingSummary,
	createBookingInputFromSelection,
	getBookingContextView,
	isBookingSelectionComplete,
	resetBookingSelectionDate,
	resetBookingSelectionStartTime,
	resolveCreateBookingSubmitError,
} from "./create-booking-flow";

const copy = (await getDictionary("en")).createBooking;

const directContext: BookingContext = {
	mode: "DIRECT",
	unit: {
		id: "unit-1",
		name: "Focus Booth 1",
		description: "Quiet booth",
		capacity: 1,
		unitType: {
			name: "BOOTH",
			minDurationMinutes: 60,
			maxDurationMinutes: 240,
		},
	},
};

const autoAssignContext: BookingContext = {
	mode: "AUTO_ASSIGN",
	area: {
		id: "area-1",
		name: "Open World",
		description: null,
		seatCount: 12,
	},
	unitType: {
		name: "HOT_DESK",
		minDurationMinutes: 30,
		maxDurationMinutes: 240,
	},
};

describe("Create Booking Flow", () => {
	it("derives Direct Booking context view data without changing backend rules", () => {
		expect(
			getBookingContextView({
				bookingContext: directContext,
				fallbackAreaDescription: copy.context.fallbackAreaDescription,
			}),
		).toEqual({
			capacityCount: 1,
			capacityKind: "person",
			description: "Quiet booth",
			selectionMode: "DIRECT",
			title: "Focus Booth 1",
			unitType: directContext.unit.unitType,
		});
	});

	it("derives Auto-Assign context view data with fallback Area description", () => {
		expect(
			getBookingContextView({
				bookingContext: autoAssignContext,
				fallbackAreaDescription: copy.context.fallbackAreaDescription,
			}),
		).toEqual({
			capacityCount: 12,
			capacityKind: "desk",
			description: copy.context.fallbackAreaDescription,
			selectionMode: "AUTO_ASSIGN",
			title: "Open World",
			unitType: autoAssignContext.unitType,
		});
	});

	it("resets dependent time selection when date or start time changes", () => {
		const selection = {
			date: "2026-07-02",
			startTime: "09:00",
			endTime: "10:00",
		};

		expect(resetBookingSelectionDate(selection, "2026-07-03")).toEqual({
			date: "2026-07-03",
			startTime: "",
			endTime: "",
		});
		expect(resetBookingSelectionStartTime(selection, "10:00")).toEqual({
			date: "2026-07-02",
			startTime: "10:00",
			endTime: "",
		});
	});

	it("creates the correct submit payload for Direct and Auto-Assign selections", () => {
		const selection = {
			date: "2026-07-02",
			startTime: "09:00",
			endTime: "10:00",
		};

		expect(isBookingSelectionComplete(selection)).toBe(true);
		expect(createBookingInputFromSelection(directContext, selection)).toEqual({
			unitId: "unit-1",
			date: "2026-07-02",
			startTime: "09:00",
			endTime: "10:00",
		});
		expect(
			createBookingInputFromSelection(autoAssignContext, selection),
		).toEqual({
			areaId: "area-1",
			unitType: "HOT_DESK",
			date: "2026-07-02",
			startTime: "09:00",
			endTime: "10:00",
		});
	});

	it("returns no submit payload or summary for incomplete selections", () => {
		const selection = { date: "2026-07-02", startTime: "09:00", endTime: "" };

		expect(isBookingSelectionComplete(selection)).toBe(false);
		expect(
			createBookingInputFromSelection(directContext, selection),
		).toBeNull();
		expect(
			buildBookingSummary({
				selection,
				target: "Focus Booth 1",
				copy: copy.summary,
			}),
		).toBeNull();
	});

	it("builds display-only Booking summary data", () => {
		expect(
			buildBookingSummary({
				selection: {
					date: "2026-07-02",
					startTime: "09:00",
					endTime: "10:30",
				},
				target: "Focus Booth 1",
				copy: copy.summary,
			}),
		).toEqual({
			date: "on Thursday, July 02",
			duration: "1h 30 min",
			target: "Focus Booth 1",
			time: "09:00-10:30",
		});
	});

	it("maps known submit failures to workflow outcomes", () => {
		expect(
			resolveCreateBookingSubmitError(
				new ApiRequestError("Bad Request", 400),
				copy.errors,
			),
		).toEqual({ type: "message", message: copy.errors.badRequest });
		expect(
			resolveCreateBookingSubmitError(
				new ApiRequestError("Unauthorized", 401),
				copy.errors,
			),
		).toEqual({ type: "unauthorized" });
		expect(
			resolveCreateBookingSubmitError(
				new ApiRequestError("Conflict", 409),
				copy.errors,
			),
		).toEqual({ type: "message", message: copy.errors.conflict });
		expect(
			resolveCreateBookingSubmitError(new Error("Network"), copy.errors),
		).toEqual({ type: "message", message: copy.errors.createFallback });
	});
});
