import { apiGet } from "@/shared/api";
import type { Locale } from "@/shared/i18n";
import type { Unit, UnitListResponse, UnitTypeName } from "../model";

type GetPublicUnitsOptions = {
	locale?: Locale;
	unitType?: UnitTypeName;
};

export async function getPublicUnits(
	options: GetPublicUnitsOptions = {},
): Promise<Unit[]> {
	const searchParams = new URLSearchParams();

	if (options.locale) {
		searchParams.set("locale", options.locale);
	}

	if (options.unitType) {
		searchParams.set("unitType", options.unitType);
	}

	const query = searchParams.toString();
	const path = query ? `/public/units?${query}` : "/public/units";

	const response = await apiGet<UnitListResponse>(path, {
		cache: "no-store",
	});

	return response.units;
}
