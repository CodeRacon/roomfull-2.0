import { apiPostAuthenticated } from "@/shared/api";
import type { Booking, BookingResponse, CreateBookingInput } from "../model";

export async function createBooking(
	input: CreateBookingInput,
): Promise<Booking> {
	const response = await apiPostAuthenticated<BookingResponse>(
		"/bookings",
		input,
	);

	return response.booking;
}
