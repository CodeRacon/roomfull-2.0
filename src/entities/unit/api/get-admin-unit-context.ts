import { apiGetAuthenticated } from "@/shared/api";
import type { AdminUnitContext } from "../model";

export async function getAdminUnitContext(): Promise<AdminUnitContext> {
	return apiGetAuthenticated<AdminUnitContext>("/admin/units/context", {
		cache: "no-store",
	});
}
