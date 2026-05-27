import { apiGetAuthenticated } from "@/shared/api";
import type { UnitDayBookings, UnitDayBookingsResponse } from "../model";

export async function getUnitDayBookings(
	unitId: string,
	date: string,
): Promise<UnitDayBookings> {
	const searchParams = new URLSearchParams({ date });

	const response = await apiGetAuthenticated<UnitDayBookingsResponse>(
		`/units/${unitId}/day-bookings?${searchParams.toString()}`,
		{
			cache: "no-store",
		},
	);

	return response.dayBookings;
}
