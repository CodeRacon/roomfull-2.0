export type UserRole = "CUSTOMER" | "ADMIN";

export type PublicUser = {
	id: string;
	name: string;
	email: string;
	role: UserRole;
	isDemo: boolean;
	demoExpiresAt: string | null;
	createdAt: string;
};

export type AuthResponse = {
	user: PublicUser;
};
