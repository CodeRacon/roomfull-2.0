import type { BookingOptionStatus } from "../model";

const formattedBookingOptionStatus: Record<BookingOptionStatus, string> = {
	AVAILABLE: "verfügbar",
	UNAVAILABLE: "nicht verfügbar",
};

export function formatBookingOptionStatus(status: BookingOptionStatus): string {
	return formattedBookingOptionStatus[status];
}
