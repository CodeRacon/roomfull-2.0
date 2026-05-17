import type { AuthResponse } from "@/entities/user";
import { apiPost } from "@/shared/api";

type SignUpInput = {
	name: string;
	email: string;
	password: string;
};

export function signUp(input: SignUpInput): Promise<AuthResponse> {
	return apiPost<AuthResponse>("/auth/register", input);
}
