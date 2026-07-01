export type SessionStatus = "loading" | "authenticated" | "anonymous";

export type SessionUserRole = "CUSTOMER" | "ADMIN";

export type SessionUser = {
	id: string;
	name: string;
	email: string;
	role: SessionUserRole;
	isDemo: boolean;
	demoExpiresAt: string | null;
	createdAt: string;
};

export type StartSessionInput = {
	user: SessionUser;
};

export type SessionContextValue = {
	status: SessionStatus;
	user: SessionUser | null;
	startSession: (input: StartSessionInput) => void;
	endSession(): void;
};
