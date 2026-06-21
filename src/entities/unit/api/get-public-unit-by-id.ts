import { apiGet } from "@/shared/api";
import type { Locale } from "@/shared/i18n";
import type { Unit, UnitResponse } from "../model";

export async function getPublicUnitById(
	unitId: string,
	locale?: Locale,
): Promise<Unit> {
	const searchParams = new URLSearchParams();

	if (locale) {
		searchParams.set("locale", locale);
	}

	const query = searchParams.toString();
	const path = query
		? `/public/units/${unitId}?${query}`
		: `/public/units/${unitId}`;

	const response = await apiGet<UnitResponse>(path, {
		cache: "no-store",
	});

	return response.unit;
}
