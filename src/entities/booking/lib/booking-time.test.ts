import { describe, expect, it } from "vitest";
import {
	createBookingDateTimeFormatter,
	formatBookingDateKey,
	isSameBookingDay,
} from "./booking-time";

describe("Booking time presentation", () => {
	it("projects an instant near UTC midnight onto its Berlin booking date", () => {
		expect(formatBookingDateKey("2026-01-01T23:30:00.000Z")).toBe("2026-01-02");
	});

	it("compares booking days in Berlin instead of the browser timezone", () => {
		expect(
			isSameBookingDay("2026-06-21T22:30:00.000Z", "2026-06-22T20:00:00.000Z"),
		).toBe(true);
	});

	it("formats visible booking times in Europe/Berlin", () => {
		const formatter = createBookingDateTimeFormatter("de-DE", {
			hour: "2-digit",
			minute: "2-digit",
		});
		const values = new Map(
			formatter
				.formatToParts(new Date("2026-06-21T22:30:00.000Z"))
				.map((part) => [part.type, part.value]),
		);

		expect(formatter.resolvedOptions().timeZone).toBe("Europe/Berlin");
		expect(values.get("hour")).toBe("00");
		expect(values.get("minute")).toBe("30");
	});
});
