import { apiGetAuthenticated } from "@/shared/api";
import type {
	BookingAvailability,
	BookingAvailabilityResponse,
	GetBookingAvailabilityInput,
} from "../model";

export async function getBookingAvailability(
	input: GetBookingAvailabilityInput,
): Promise<BookingAvailability> {
	const searchParams = new URLSearchParams({ date: input.date });

	if (input.unitId) {
		searchParams.set("unitId", input.unitId);
	}

	if (input.areaId) {
		searchParams.set("areaId", input.areaId);
		searchParams.set("unitType", input.unitType);
	}

	const response = await apiGetAuthenticated<BookingAvailabilityResponse>(
		`/bookings/availability?${searchParams.toString()}`,
		{
			cache: "no-store",
		},
	);

	return response.availability;
}
