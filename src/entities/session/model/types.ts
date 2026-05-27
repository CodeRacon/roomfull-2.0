export type SessionStatus = "loading" | "authenticated" | "anonymous";

export type SessionUserRole = "CUSTOMER" | "ADMIN";

export type SessionUser = {
	id: string;
	name: string;
	email: string;
	role: SessionUserRole;
};

export type StartSessionInput = {
	token: string;
	user: SessionUser;
};

export type SessionContextValue = {
	status: SessionStatus;
	user: SessionUser | null;
	startSession: (input: StartSessionInput) => void;
	endSession(): void;
};
