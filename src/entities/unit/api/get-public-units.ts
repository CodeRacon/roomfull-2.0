import { apiGet } from "@/shared/api";
import type { Unit, UnitListResponse } from "../model";

export async function getPublicUnits(): Promise<Unit[]> {
	const response = await apiGet<UnitListResponse>("/public/units", {
		cache: "no-store",
	});

	return response.units;
}
