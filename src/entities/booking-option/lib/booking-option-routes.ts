import type { BookingOptionKey, BookingOptionSlug } from "../model";

const bookingOptionKeyBySlug: Record<BookingOptionSlug, BookingOptionKey> = {
	"hot-desk": "HOT_DESK",
	booth: "BOOTH",
	"team-room": "TEAM_ROOM",
	"meeting-room": "MEETING_ROOM",
};

const bookingOptionSlugByKey: Record<BookingOptionKey, BookingOptionSlug> = {
	HOT_DESK: "hot-desk",
	BOOTH: "booth",
	TEAM_ROOM: "team-room",
	MEETING_ROOM: "meeting-room",
};

export function parseBookingOptionSlug(slug: string): BookingOptionKey | null {
	if (!(slug in bookingOptionKeyBySlug)) {
		return null;
	}

	return bookingOptionKeyBySlug[slug as BookingOptionSlug];
}

export function getBookingOptionHref(key: BookingOptionKey): string {
	const slug = bookingOptionSlugByKey[key];

	return `/booking-options/${slug}`;
}
