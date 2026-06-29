import {
	type BookingShareContext,
	createBookingDateTimeFormatter,
} from "@/entities/booking";
import type { TeamMember } from "@/entities/team";
import { formatUnitTypeName } from "@/entities/unit";
import type { Dictionary, Locale } from "@/shared/i18n";

function getIntlLocale(locale: Locale): string {
	return locale === "de" ? "de-DE" : "en-US";
}

function escapeIcsText(value: string): string {
	return value
		.replace(/\\/g, "\\\\")
		.replace(/\n/g, "\\n")
		.replace(/,/g, "\\,")
		.replace(/;/g, "\\;");
}

function formatIcsDateTime(value: string): string {
	return new Date(value).toISOString().replace(/[-:]/g, "").replace(".000", "");
}

function formatShareWindow(
	shareContext: BookingShareContext,
	_locale: Locale,
	copy: Dictionary["bookingShare"]["package"]["dateTime"],
): string {
	const start = new Date(shareContext.booking.startTime);
	const end = new Date(shareContext.booking.endTime);
	const dayFormatter = createBookingDateTimeFormatter(copy.locale, {
		weekday: "long",
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	});
	const timeFormatter = createBookingDateTimeFormatter(copy.locale, {
		hour: "2-digit",
		minute: "2-digit",
	});

	return copy.sameDay
		.replace("{date}", dayFormatter.format(start))
		.replace("{start}", timeFormatter.format(start))
		.replace("{end}", timeFormatter.format(end));
}

export function buildTeamShareBccList(members: TeamMember[]): string {
	return members.map((member) => member.email).join(", ");
}

export function buildTeamShareSubject(
	shareContext: BookingShareContext,
	locale: Locale,
	copy: Dictionary["bookingShare"]["package"],
): string {
	return copy.subject
		.replace("{unitName}", shareContext.unit.name)
		.replace("{unitType}", formatUnitTypeName(shareContext.unit.unitType.name))
		.replace("{time}", formatShareWindow(shareContext, locale, copy.dateTime));
}

export function buildTeamShareMessage(args: {
	copy: Dictionary["bookingShare"]["package"];
	locale: Locale;
	personalMessage: string;
	shareContext: BookingShareContext;
}): string {
	const { copy, locale, personalMessage, shareContext } = args;
	const lines = [
		copy.greeting,
		personalMessage.trim(),
		copy.bookingLine
			.replace("{unitName}", shareContext.unit.name)
			.replace(
				"{unitType}",
				formatUnitTypeName(shareContext.unit.unitType.name),
			),
		copy.timeLine.replace(
			"{time}",
			formatShareWindow(shareContext, locale, copy.dateTime),
		),
		copy.calendarHint,
	].filter((line) => line.trim().length > 0);

	return lines.join("\n\n");
}

export function buildTeamShareFileName(
	shareContext: BookingShareContext,
): string {
	const date = shareContext.booking.startTime.slice(0, 10);
	const unitName = shareContext.unit.name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "");

	return `roomfull-share-${date}-${unitName || "booking"}.ics`;
}

export function buildTeamShareIcsContent(args: {
	copy: Dictionary["bookingShare"]["package"];
	locale: Locale;
	shareContext: BookingShareContext;
}): string {
	const { copy, locale, shareContext } = args;
	const unitTypeLabel = formatUnitTypeName(shareContext.unit.unitType.name);
	const summary = copy.ics.summary
		.replace("{unitName}", shareContext.unit.name)
		.replace("{unitType}", unitTypeLabel);
	const description = copy.ics.description.replace(
		"{time}",
		formatShareWindow(shareContext, locale, copy.dateTime),
	);
	const now = new Date().toISOString().replace(/[-:]/g, "").replace(".000", "");
	const localeTag = getIntlLocale(locale).startsWith("de") ? "DE" : "EN";

	return [
		"BEGIN:VCALENDAR",
		"VERSION:2.0",
		`PRODID:-//RoomFull//Team Share//${localeTag}`,
		"CALSCALE:GREGORIAN",
		"METHOD:PUBLISH",
		"BEGIN:VEVENT",
		`UID:${shareContext.booking.id}@roomfull.local`,
		`DTSTAMP:${now}`,
		`DTSTART:${formatIcsDateTime(shareContext.booking.startTime)}`,
		`DTEND:${formatIcsDateTime(shareContext.booking.endTime)}`,
		`SUMMARY:${escapeIcsText(summary)}`,
		`DESCRIPTION:${escapeIcsText(description)}`,
		`LOCATION:${escapeIcsText(shareContext.unit.name)}`,
		"END:VEVENT",
		"END:VCALENDAR",
	].join("\r\n");
}
