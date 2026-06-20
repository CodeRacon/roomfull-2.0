import { apiPostAuthenticated } from "@/shared/api";
import type {
	ContactRequest,
	ContactRequestResponse,
	CreateContactRequestInput,
} from "../model";

export async function createContactRequest(
	input: CreateContactRequestInput,
): Promise<ContactRequest> {
	const response = await apiPostAuthenticated<ContactRequestResponse>(
		"/contact-requests",
		input,
	);

	return response.contactRequest;
}
