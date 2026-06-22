import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { AppError } from "../src/lib/app-error.js";
import { resolveBookingRequestMode } from "../src/services/booking-request-mode.js";

function assertBadRequest(action: () => unknown, message: string): void {
	assert.throws(
		action,
		(error: unknown) =>
			error instanceof AppError &&
			error.statusCode === 400 &&
			error.message === message,
	);
}

describe("Booking Request Modes", () => {
	it("resolves a trimmed unitId as DIRECT", () => {
		assert.deepEqual(resolveBookingRequestMode({ unitId: " unit-1 " }), {
			mode: "DIRECT",
			unitId: "unit-1",
		});
	});

	it("resolves a Hot Desk area selection as AUTO_ASSIGN", () => {
		assert.deepEqual(
			resolveBookingRequestMode({
				areaId: " area-1 ",
				unitType: " hot_desk ",
			}),
			{
				mode: "AUTO_ASSIGN",
				areaId: "area-1",
				unitType: "HOT_DESK",
			},
		);
	});

	it("rejects a mixed DIRECT and AUTO_ASSIGN selection", () => {
		assertBadRequest(
			() =>
				resolveBookingRequestMode({
					unitId: "unit-1",
					areaId: "area-1",
					unitType: "HOT_DESK",
				}),
			"Entweder unitId ODER areaId+unitType senden, nicht beides",
		);
	});

	it("rejects a missing mode selection", () => {
		assertBadRequest(
			() => resolveBookingRequestMode({}),
			"Entweder unitId oder areaId+unitType ist erforderlich",
		);
	});

	it("rejects an incomplete AUTO_ASSIGN selection", () => {
		for (const input of [{ areaId: "area-1" }, { unitType: "HOT_DESK" }]) {
			assertBadRequest(
				() => resolveBookingRequestMode(input),
				"Für Auto-Assign sind areaId und unitType erforderlich",
			);
		}
	});

	it("rejects AUTO_ASSIGN for every non-Hot-Desk unit type", () => {
		for (const unitType of ["BOOTH", "TEAM_ROOM", "MEETING_ROOM", "OTHER"]) {
			assertBadRequest(
				() => resolveBookingRequestMode({ areaId: "area-1", unitType }),
				"Auto-Assign ist dauerhaft nur für HOT_DESK erlaubt",
			);
		}
	});
});
