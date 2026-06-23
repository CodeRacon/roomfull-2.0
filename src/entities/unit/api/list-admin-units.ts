import { apiGetAuthenticated } from "@/shared/api";
import type {
	AdminUnit,
	AdminUnitListResponse,
	ListAdminUnitsInput,
} from "../model";

export async function listAdminUnits(
	input: ListAdminUnitsInput = {},
): Promise<AdminUnit[]> {
	const searchParams = new URLSearchParams();

	if (input.status) {
		searchParams.set("status", input.status);
	}

	if (input.unitType) {
		searchParams.set("unitType", input.unitType);
	}

	if (input.search) {
		searchParams.set("search", input.search);
	}

	const queryString = searchParams.toString();
	const path =
		queryString.length > 0 ? `/admin/units?${queryString}` : "/admin/units";

	const response = await apiGetAuthenticated<AdminUnitListResponse>(path, {
		cache: "no-store",
	});

	return response.units;
}
