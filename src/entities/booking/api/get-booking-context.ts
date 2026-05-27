import { apiGetAuthenticated } from "@/shared/api";
import type {
	BookingContext,
	BookingContextResponse,
	GetBookingContextInput,
} from "../model";

export async function getBookingContext(
	input: GetBookingContextInput,
): Promise<BookingContext> {
	const searchParams = new URLSearchParams();

	if (input.unitId !== undefined) {
		searchParams.set("unitId", input.unitId);
	} else {
		searchParams.set("unitType", input.unitType);
		searchParams.set("areaId", input.areaId);
	}

	const response = await apiGetAuthenticated<BookingContextResponse>(
		`/bookings/context?${searchParams.toString()}`,
		{
			cache: "no-store",
		},
	);

	return response.bookingContext;
}
