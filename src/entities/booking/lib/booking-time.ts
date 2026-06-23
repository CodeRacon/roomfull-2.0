export const BOOKING_TIME_ZONE = "Europe/Berlin";

const bookingDateKeyFormatter = new Intl.DateTimeFormat("en-CA", {
	timeZone: BOOKING_TIME_ZONE,
	year: "numeric",
	month: "2-digit",
	day: "2-digit",
});

export function createBookingDateTimeFormatter(
	locales?: Intl.LocalesArgument,
	options: Intl.DateTimeFormatOptions = {},
): Intl.DateTimeFormat {
	return new Intl.DateTimeFormat(locales, {
		...options,
		timeZone: BOOKING_TIME_ZONE,
	});
}

export function formatBookingDateKey(value: string | Date): string {
	const date = typeof value === "string" ? new Date(value) : value;
	const parts = bookingDateKeyFormatter.formatToParts(date);
	const values = new Map(parts.map((part) => [part.type, part.value]));

	return `${values.get("year")}-${values.get("month")}-${values.get("day")}`;
}

export function isSameBookingDay(
	left: string | Date,
	right: string | Date,
): boolean {
	return formatBookingDateKey(left) === formatBookingDateKey(right);
}
