import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { BookingOption } from "@/entities/booking-option";
import { getDictionary } from "@/shared/i18n";
import { BookingOptionsList } from "./BookingOptionsList";

const copy = (await getDictionary("de")).bookingOptionsPage;

const boothOption: BookingOption = {
	key: "BOOTH",
	unitType: {
		id: "type-booth",
		name: "BOOTH",
		minDurationMinutes: 60,
		maxDurationMinutes: 240,
	},
	bookingMode: "CHOOSE_UNIT",
	areaSelection: "NOT_APPLICABLE",
	status: "AVAILABLE",
	totalActiveUnits: 4,
	maxCapacity: 5,
	areas: [],
	units: [
		{ id: "booth-cozy", name: "Cozy Cocoon" },
		{ id: "booth-book", name: "Book Nook" },
		{ id: "booth-call", name: "Call-in Cabin" },
		{ id: "booth-hive", name: "Hive Five" },
	],
};

const meetingRoomOption: BookingOption = {
	key: "MEETING_ROOM",
	unitType: {
		id: "type-meeting-room",
		name: "MEETING_ROOM",
		minDurationMinutes: 60,
		maxDurationMinutes: 480,
	},
	bookingMode: "CHOOSE_UNIT",
	areaSelection: "NOT_APPLICABLE",
	status: "AVAILABLE",
	totalActiveUnits: 1,
	maxCapacity: 16,
	areas: [],
	units: [{ id: "meeting-table-talk", name: "Table Talk" }],
};

describe("BookingOptionsList", () => {
	it("shows the active BookableUnits instead of static variants", () => {
		render(
			<BookingOptionsList
				bookingOptions={[boothOption]}
				copy={copy}
				locale="de"
			/>,
		);

		for (const name of [
			"Cozy Cocoon",
			"Book Nook",
			"Call-in Cabin",
			"Hive Five",
		]) {
			expect(screen.getByText(name)).toBeTruthy();
		}
		expect(screen.queryByText("Phone Booth")).toBeNull();
	});

	it("emphasizes the intended phrase in the localized UnitType copy", () => {
		render(
			<BookingOptionsList
				bookingOptions={[meetingRoomOption]}
				copy={copy}
				locale="de"
			/>,
		);

		const expectedDescription =
			"Mehr Raum für interaktiven Austausch, Entscheidungen und Präsentationen – einladend, großzügig und gemacht für die guten Meetings.";
		const description = screen.getByText(
			(_content, element) =>
				element?.tagName === "P" && element.textContent === expectedDescription,
		);

		expect(description.querySelector("em")?.textContent).toBe("guten");
	});
});
