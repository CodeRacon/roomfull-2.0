import { apiGetAuthenticated } from "@/shared/api";
import type { BookingListResponse, MyBooking } from "../model";

export async function listMyBookings(): Promise<MyBooking[]> {
	const response = await apiGetAuthenticated<BookingListResponse>(
		"/me/bookings",
		{
			cache: "no-store",
		},
	);

	return response.bookings;
}
