import { apiPostAuthenticated } from "@/shared/api";
import type {
	AdminUnit,
	AdminUnitResponse,
	CreateAdminUnitInput,
} from "../model";

export async function createAdminUnit(
	input: CreateAdminUnitInput,
): Promise<AdminUnit> {
	const response = await apiPostAuthenticated<AdminUnitResponse>(
		"/admin/units",
		input,
	);

	return response.unit;
}
