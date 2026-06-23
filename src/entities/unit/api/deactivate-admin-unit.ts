import { apiPatchAuthenticated } from "@/shared/api";
import type { AdminUnit, AdminUnitResponse } from "../model";

export async function deactivateAdminUnit(unitId: string): Promise<AdminUnit> {
	const response = await apiPatchAuthenticated<AdminUnitResponse>(
		`/admin/units/${unitId}/deactivate`,
		{},
	);

	return response.unit;
}
