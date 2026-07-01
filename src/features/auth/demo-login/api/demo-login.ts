import type { AuthResponse } from "@/entities/user";
import { apiPost } from "@/shared/api";

export function demoLogin(): Promise<AuthResponse> {
	return apiPost<AuthResponse>("/auth/demo-login", {});
}
