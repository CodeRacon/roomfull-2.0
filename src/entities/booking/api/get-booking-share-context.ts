import { apiGetAuthenticated } from "@/shared/api";
import type {
	BookingShareContext,
	BookingShareContextResponse,
} from "../model";

export async function getBookingShareContext(
	bookingId: string,
): Promise<BookingShareContext> {
	const response = await apiGetAuthenticated<BookingShareContextResponse>(
		`/me/bookings/${bookingId}/share-context`,
		{
			cache: "no-store",
		},
	);

	return response.shareContext;
}
