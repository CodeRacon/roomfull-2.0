import { apiPatchAuthenticated } from "@/shared/api";
import type { Unit, UnitResponse } from "../model";

export async function deactivateAdminUnit(unitId: string): Promise<Unit> {
	const response = await apiPatchAuthenticated<UnitResponse>(
		`/admin/units/${unitId}/deactivate`,
		{},
	);

	return response.unit;
}
