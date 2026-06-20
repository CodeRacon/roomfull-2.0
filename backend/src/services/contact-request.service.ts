import { ContactRequestType } from "@prisma/client";
import {
	type AdminContactRequestRecord,
	type ContactRequestRecord,
	countUnreadContactRequests,
	createContactRequest,
	listContactRequests,
	markContactRequestAsRead,
} from "../db/contact-request.repository.js";
import { AppError } from "../lib/app-error.js";

type CreateContactRequestForCustomerInput = {
	userId: string;
	type: string;
	message: string;
};

type ListContactRequestsForAdminInput = {
	readState?: string;
	sort?: string;
	type?: string;
};

type MarkContactRequestAsReadForAdminInput = {
	contactRequestId: string;
};

type ContactRequestDependencies = {
	createContactRequest: typeof createContactRequest;
	listContactRequests: typeof listContactRequests;
	markContactRequestAsRead: typeof markContactRequestAsRead;
};

type CountUnreadContactRequestDependencies = {
	countUnreadContactRequests: typeof countUnreadContactRequests;
};

const defaultDependencies: ContactRequestDependencies = {
	createContactRequest,
	listContactRequests,
	markContactRequestAsRead,
};

const defaultCountDependencies: CountUnreadContactRequestDependencies = {
	countUnreadContactRequests,
};

function parseContactRequestType(type: string): ContactRequestType {
	const normalized = type.trim().toUpperCase();

	switch (normalized) {
		case ContactRequestType.QUESTION:
			return ContactRequestType.QUESTION;
		case ContactRequestType.FEEDBACK:
			return ContactRequestType.FEEDBACK;
		case ContactRequestType.CRITICISM:
			return ContactRequestType.CRITICISM;
		default:
			throw new AppError(400, "Contact Request Type ist ungültig");
	}
}

function parseMessage(message: string): string {
	const trimmed = message.trim();

	if (trimmed.length === 0) {
		throw new AppError(400, "Nachricht ist erforderlich");
	}

	return trimmed;
}

function parseReadState(readState?: string): boolean | undefined {
	const normalized = readState?.trim().toLowerCase() ?? "all";

	switch (normalized) {
		case "all":
			return undefined;
		case "read":
			return true;
		case "unread":
			return false;
		default:
			throw new AppError(400, "readState ist ungültig");
	}
}

function parseSort(sort?: string): { createdAt: "asc" | "desc" } {
	const normalized = sort?.trim().toLowerCase() ?? "received_desc";

	switch (normalized) {
		case "received_desc":
			return { createdAt: "desc" };
		case "received_asc":
			return { createdAt: "asc" };
		default:
			throw new AppError(400, "sort ist ungültig");
	}
}

function parseOptionalContactRequestType(
	type?: string,
): ContactRequestType | undefined {
	const trimmed = type?.trim() ?? "";
	return trimmed.length > 0 ? parseContactRequestType(trimmed) : undefined;
}

export async function createContactRequestForCustomer(
	input: CreateContactRequestForCustomerInput,
	dependencies: ContactRequestDependencies = defaultDependencies,
): Promise<ContactRequestRecord> {
	const userId = input.userId.trim();

	if (userId.length === 0) {
		throw new AppError(401, "Nicht eingeloggt");
	}

	return dependencies.createContactRequest({
		userId,
		type: parseContactRequestType(input.type),
		message: parseMessage(input.message),
		isRead: false,
	});
}

export async function listContactRequestsForAdmin(
	input: ListContactRequestsForAdminInput = {},
	dependencies: ContactRequestDependencies = defaultDependencies,
): Promise<AdminContactRequestRecord[]> {
	return dependencies.listContactRequests({
		isRead: parseReadState(input.readState),
		orderBy: parseSort(input.sort),
		type: parseOptionalContactRequestType(input.type),
	});
}

export async function getUnreadContactRequestCountForAdmin(
	dependencies: CountUnreadContactRequestDependencies = defaultCountDependencies,
): Promise<number> {
	return dependencies.countUnreadContactRequests();
}

export async function markContactRequestAsReadForAdmin(
	input: MarkContactRequestAsReadForAdminInput,
	dependencies: ContactRequestDependencies = defaultDependencies,
): Promise<AdminContactRequestRecord> {
	const contactRequestId = input.contactRequestId.trim();

	if (contactRequestId.length === 0) {
		throw new AppError(400, "Ungültige Route-Parameter");
	}

	const contactRequest = await dependencies.markContactRequestAsRead({
		contactRequestId,
	});

	if (!contactRequest) {
		throw new AppError(404, "Contact Request wurde nicht gefunden");
	}

	return contactRequest;
}
