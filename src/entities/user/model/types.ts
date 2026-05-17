export type UserRole = "CUSTOMER" | "ADMIN";

export type PublicUser = {
	id: string;
	name: string;
	email: string;
	role: UserRole;
	createdAt: string;
};

export type AuthResponse = {
	token: string;
	user: PublicUser;
};
