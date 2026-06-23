import { apiPutAuthenticated } from "@/shared/api";
import type {
	AdminUnit,
	AdminUnitResponse,
	UpdateAdminUnitInput,
} from "../model";

export async function updateAdminUnit(input: {
	unitId: string;
	values: UpdateAdminUnitInput;
}): Promise<AdminUnit> {
	const response = await apiPutAuthenticated<AdminUnitResponse>(
		`/admin/units/${input.unitId}`,
		input.values,
	);

	return response.unit;
}
