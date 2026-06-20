import { apiGetAuthenticated } from "@/shared/api";
import type {
	AdminBooking,
	AdminBookingListResponse,
	ListAdminBookingsInput,
} from "../model";

export async function listAdminBookings(
	input: ListAdminBookingsInput = {},
): Promise<AdminBooking[]> {
	const searchParams = new URLSearchParams();

	if (input.status) {
		searchParams.set("status", input.status);
	}

	if (input.from) {
		searchParams.set("from", input.from);
	}

	if (input.to) {
		searchParams.set("to", input.to);
	}

	if (input.limit !== undefined) {
		searchParams.set("limit", String(input.limit));
	}

	const search = input.search?.trim();
	if (search) {
		searchParams.set("search", search);
	}

	const queryString = searchParams.toString();
	const path =
		queryString.length > 0
			? `/admin/bookings?${queryString}`
			: "/admin/bookings";

	const response = await apiGetAuthenticated<AdminBookingListResponse>(path, {
		cache: "no-store",
	});

	return response.bookings;
}
