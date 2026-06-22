import { apiGetAuthenticated } from "@/shared/api";
import type {
	DirectBookingCalendarState,
	DirectBookingCalendarStateResponse,
} from "../model";

export async function getDirectBookingCalendarState(
	unitId: string,
	month: string,
): Promise<DirectBookingCalendarState> {
	const searchParams = new URLSearchParams({ month });
	const response =
		await apiGetAuthenticated<DirectBookingCalendarStateResponse>(
			`/units/${unitId}/calendar-state?${searchParams.toString()}`,
			{ cache: "no-store" },
		);

	return response.calendarState;
}
