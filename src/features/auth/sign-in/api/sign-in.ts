import type { AuthResponse } from "@/entities/user";
import { apiPost } from "@/shared/api";

type SignInInput = {
	email: string;
	password: string;
};

export function signIn(input: SignInInput): Promise<AuthResponse> {
	return apiPost<AuthResponse>("/auth/login", input);
}
