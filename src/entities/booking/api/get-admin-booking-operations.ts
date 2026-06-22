import { apiGetAuthenticated } from "@/shared/api";
import type {
	AdminBookingOperations,
	GetAdminBookingOperationsInput,
} from "../model";

export async function getAdminBookingOperations(
	input: GetAdminBookingOperationsInput = {},
): Promise<AdminBookingOperations> {
	const searchParams = new URLSearchParams();

	if (input.status) searchParams.set("status", input.status);
	if (input.range) searchParams.set("range", input.range);
	if (input.from) searchParams.set("from", input.from);
	if (input.to) searchParams.set("to", input.to);
	if (input.limit !== undefined) searchParams.set("limit", String(input.limit));

	const search = input.search?.trim();
	if (search) searchParams.set("search", search);

	const queryString = searchParams.toString();
	const path = queryString
		? `/admin/bookings?${queryString}`
		: "/admin/bookings";

	return apiGetAuthenticated<AdminBookingOperations>(path, {
		cache: "no-store",
	});
}
