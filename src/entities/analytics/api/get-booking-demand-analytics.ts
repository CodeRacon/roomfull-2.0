import { apiGetAuthenticated } from "@/shared/api";
import type {
	BookingDemandAnalytics,
	BookingDemandAnalyticsResponse,
	GetBookingDemandAnalyticsInput,
} from "../model";

export async function getBookingDemandAnalytics(
	input: GetBookingDemandAnalyticsInput = {},
): Promise<BookingDemandAnalytics> {
	const searchParams = new URLSearchParams();

	if (input.from) {
		searchParams.set("from", input.from);
	}

	if (input.to) {
		searchParams.set("to", input.to);
	}

	const queryString = searchParams.toString();
	const path =
		queryString.length > 0
			? `/admin/analytics/booking-demand?${queryString}`
			: "/admin/analytics/booking-demand";

	const response = await apiGetAuthenticated<BookingDemandAnalyticsResponse>(
		path,
		{
			cache: "no-store",
		},
	);

	return response.bookingDemand;
}
