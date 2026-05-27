import type { MyBooking } from "@/entities/booking";
import { formatUnitTypeName } from "@/entities/unit";

function formatIcsDateTime(value: string): string {
	return new Date(value).toISOString().replace(/[-:]/g, "").replace(".000", "");
}

function escapeIcsText(value: string): string {
	return value
		.replace(/\\/g, "\\\\")
		.replace(/\n/g, "\\n")
		.replace(/,/g, "\\,")
		.replace(/;/g, "\\;");
}

export function buildBookingCalendarFileName(booking: MyBooking): string {
	const date = booking.startTime.slice(0, 10);
	const unitName = booking.unit.name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "");

	return `roomfull-${date}-${unitName || booking.id}.ics`;
}

export function buildBookingCalendarContent(booking: MyBooking): string {
	const unitTypeLabel = formatUnitTypeName(booking.unit.unitType.name);
	const summary = `RoomFull: ${booking.unit.name} (${unitTypeLabel})`;
	const description = `Booking-ID: ${booking.id}\\nStatus: ${booking.status}`;
	const now = new Date().toISOString().replace(/[-:]/g, "").replace(".000", "");

	return [
		"BEGIN:VCALENDAR",
		"VERSION:2.0",
		"PRODID:-//RoomFull//Bookings//DE",
		"CALSCALE:GREGORIAN",
		"METHOD:PUBLISH",
		"BEGIN:VEVENT",
		`UID:${booking.id}@roomfull.local`,
		`DTSTAMP:${now}`,
		`DTSTART:${formatIcsDateTime(booking.startTime)}`,
		`DTEND:${formatIcsDateTime(booking.endTime)}`,
		`SUMMARY:${escapeIcsText(summary)}`,
		`DESCRIPTION:${escapeIcsText(description)}`,
		`LOCATION:${escapeIcsText(booking.unit.name)}`,
		"END:VEVENT",
		"END:VCALENDAR",
	].join("\r\n");
}
