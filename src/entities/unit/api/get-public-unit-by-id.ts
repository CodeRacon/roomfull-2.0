import { apiGet } from "@/shared/api";
import type { Unit, UnitResponse } from "../model";

export async function getPublicUnitById(unitId: string): Promise<Unit> {
	const response = await apiGet<UnitResponse>(`/public/units/${unitId}`, {
		cache: "no-store",
	});

	return response.unit;
}
