import { apiGetAuthenticated } from "@/shared/api";
import type {
	AdminContactRequest,
	AdminContactRequestListResponse,
	ListAdminContactRequestsInput,
} from "../model";

export async function listAdminContactRequests(
	input: ListAdminContactRequestsInput = {},
): Promise<AdminContactRequest[]> {
	const searchParams = new URLSearchParams();

	if (input.type) {
		searchParams.set("type", input.type);
	}

	if (input.readState && input.readState !== "all") {
		searchParams.set("readState", input.readState);
	}

	if (input.sort) {
		searchParams.set("sort", input.sort);
	}

	const queryString = searchParams.toString();
	const path =
		queryString.length > 0
			? `/admin/contact-requests?${queryString}`
			: "/admin/contact-requests";

	const response = await apiGetAuthenticated<AdminContactRequestListResponse>(
		path,
		{
			cache: "no-store",
		},
	);

	return response.contactRequests;
}
