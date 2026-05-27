import { apiDeleteAuthenticated } from "@/shared/api";
import type { Booking, BookingResponse } from "../model";

export async function cancelBooking(bookingId: string): Promise<Booking> {
	const response = await apiDeleteAuthenticated<BookingResponse>(
		`/bookings/${bookingId}`,
	);

	return response.booking;
}
