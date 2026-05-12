import { apiGet } from "@/shared/api";
import type { BookingOption, BookingOptionListResponse } from "../model";

export async function getPublicBookingOptions(): Promise<BookingOption[]> {
	const response = await apiGet<BookingOptionListResponse>(
		"/public/booking-options",
		{ cache: "no-store" },
	);

	return response.bookingOptions;
}
