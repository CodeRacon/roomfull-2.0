import { describe, expect, it, vi } from "vitest";
import { getBookingShareContext } from "@/entities/booking";

const mocks = vi.hoisted(() => ({
	apiGetAuthenticated: vi.fn(),
}));

vi.mock("@/shared/api", () => ({
	apiGetAuthenticated: mocks.apiGetAuthenticated,
}));

describe("getBookingShareContext", () => {
	it("loads and unwraps the Booking Share Context", async () => {
		const shareContext = {
			booking: {
				id: "booking-1",
				startTime: "2099-01-10T11:00:00.000Z",
				endTime: "2099-01-10T13:00:00.000Z",
			},
			unit: {
				id: "unit-1",
				name: "Focus Booth 1",
				capacity: 4,
				unitType: { name: "BOOTH" },
			},
		};
		mocks.apiGetAuthenticated.mockResolvedValueOnce({ shareContext });

		await expect(getBookingShareContext("booking-1")).resolves.toBe(
			shareContext,
		);
		expect(mocks.apiGetAuthenticated).toHaveBeenCalledWith(
			"/me/bookings/booking-1/share-context",
			{ cache: "no-store" },
		);
	});
});
