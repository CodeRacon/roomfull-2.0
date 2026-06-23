import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { UnitTypeName } from "@prisma/client";
import {
	BOOKING_OPTION_UNIT_TYPES,
	createGetPublicBookingOptions,
} from "../src/services/unit.service.js";

const timestamp = new Date("2026-06-23T08:00:00.000Z");

function createUnitType(
	name: UnitTypeName,
	units: Array<{ id: string; name: string; capacity: number }>,
) {
	return {
		id: `type-${name.toLowerCase()}`,
		name,
		minDurationMinutes: name === "HOT_DESK" ? 30 : 60,
		maxDurationMinutes: name === "HOT_DESK" ? 240 : 480,
		createdAt: timestamp,
		updatedAt: timestamp,
		units: units.map((unit, index) => ({
			...unit,
			description: `${unit.name} description`,
			descriptionDe: null,
			descriptionEn: null,
			isActive: true,
			displayOrder: index + 1,
			unitTypeId: `type-${name.toLowerCase()}`,
			areaId: null,
			createdAt: timestamp,
			updatedAt: timestamp,
			area: null,
		})),
	};
}

describe("Public BookingOptions", () => {
	it("exposes active direct-booking units in display order", async () => {
		const unitTypes = [
			createUnitType("HOT_DESK", []),
			createUnitType("BOOTH", [
				{ id: "booth-cozy", name: "Cozy Cocoon", capacity: 3 },
				{ id: "booth-book", name: "Book Nook", capacity: 3 },
				{ id: "booth-call", name: "Call-in Cabin", capacity: 4 },
				{ id: "booth-hive", name: "Hive Five", capacity: 5 },
			]),
			createUnitType("TEAM_ROOM", []),
			createUnitType("MEETING_ROOM", []),
		];
		const requestedUnitTypes: UnitTypeName[][] = [];
		const getPublicBookingOptions = createGetPublicBookingOptions({
			listUnitTypesForBookingOptions: async (names) => {
				requestedUnitTypes.push(names);
				return unitTypes;
			},
		});

		const bookingOptions = await getPublicBookingOptions();
		const booth = bookingOptions.find((option) => option.key === "BOOTH");

		assert.deepEqual(requestedUnitTypes, [BOOKING_OPTION_UNIT_TYPES]);
		assert.deepEqual(booth?.units, [
			{ id: "booth-cozy", name: "Cozy Cocoon" },
			{ id: "booth-book", name: "Book Nook" },
			{ id: "booth-call", name: "Call-in Cabin" },
			{ id: "booth-hive", name: "Hive Five" },
		]);
	});
});
