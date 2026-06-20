import { apiPatchAuthenticated } from "@/shared/api";
import type {
	AdminContactRequest,
	AdminContactRequestResponse,
} from "../model";

export async function markAdminContactRequestRead(
	contactRequestId: string,
): Promise<AdminContactRequest> {
	const response = await apiPatchAuthenticated<AdminContactRequestResponse>(
		`/admin/contact-requests/${encodeURIComponent(contactRequestId)}/read`,
		{},
	);

	return response.contactRequest;
}
