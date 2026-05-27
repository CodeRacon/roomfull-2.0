import { apiGet } from "@/shared/api";
import type { SessionUser } from "../model";

export async function getCurrentSessionUser(
	token: string,
): Promise<SessionUser> {
	const response = await apiGet<{ user: SessionUser }>("/auth/me", {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});

	return response.user;
}
