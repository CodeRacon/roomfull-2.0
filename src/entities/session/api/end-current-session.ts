import { apiPost } from "@/shared/api";

export async function endCurrentSession(): Promise<void> {
	await apiPost<void>("/auth/logout", {});
}
