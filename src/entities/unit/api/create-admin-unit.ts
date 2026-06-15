import { apiPostAuthenticated } from "@/shared/api";
import type { CreateAdminUnitInput, Unit, UnitResponse } from "../model";

export async function createAdminUnit(
	input: CreateAdminUnitInput,
): Promise<Unit> {
	const response = await apiPostAuthenticated<UnitResponse>(
		"/admin/units",
		input,
	);

	return response.unit;
}
