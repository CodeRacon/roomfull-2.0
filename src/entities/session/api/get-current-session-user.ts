import { apiGet } from "@/shared/api";
import type { SessionUser } from "../model";

export async function getCurrentSessionUser(): Promise<SessionUser> {
	const response = await apiGet<{ user: SessionUser }>("/auth/me");

	return response.user;
}
