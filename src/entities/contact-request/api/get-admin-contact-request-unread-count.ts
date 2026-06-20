import { apiGetAuthenticated } from "@/shared/api";
import type { AdminContactRequestUnreadCountResponse } from "../model";

export async function getAdminContactRequestUnreadCount(): Promise<number> {
	const response =
		await apiGetAuthenticated<AdminContactRequestUnreadCountResponse>(
			"/admin/contact-requests/unread-count",
			{
				cache: "no-store",
			},
		);

	return response.unreadCount;
}
