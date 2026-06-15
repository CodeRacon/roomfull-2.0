import { apiPutAuthenticated } from "@/shared/api";
import type { Unit, UnitResponse, UpdateAdminUnitInput } from "../model";

export async function updateAdminUnit(input: {
	unitId: string;
	values: UpdateAdminUnitInput;
}): Promise<Unit> {
	const response = await apiPutAuthenticated<UnitResponse>(
		`/admin/units/${input.unitId}`,
		input.values,
	);

	return response.unit;
}
