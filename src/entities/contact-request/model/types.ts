export type ContactRequestType = "QUESTION" | "FEEDBACK" | "CRITICISM";

export type ContactRequest = {
	id: string;
	userId: string;
	type: ContactRequestType;
	message: string;
	isRead: boolean;
	createdAt: string;
};

export type AdminContactRequest = ContactRequest & {
	user: {
		id: string;
		name: string;
		email: string;
	};
};

export type CreateContactRequestInput = {
	type: ContactRequestType;
	message: string;
};

export type AdminContactRequestReadState = "all" | "read" | "unread";
export type AdminContactRequestSort = "received_desc" | "received_asc";

export type ListAdminContactRequestsInput = {
	readState?: AdminContactRequestReadState;
	sort?: AdminContactRequestSort;
	type?: ContactRequestType;
};

export type ContactRequestResponse = {
	contactRequest: ContactRequest;
};

export type AdminContactRequestResponse = {
	contactRequest: AdminContactRequest;
};

export type AdminContactRequestListResponse = {
	contactRequests: AdminContactRequest[];
};

export type AdminContactRequestUnreadCountResponse = {
	unreadCount: number;
};
