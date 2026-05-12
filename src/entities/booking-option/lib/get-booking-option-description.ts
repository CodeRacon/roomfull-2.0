import type { BookingOptionKey } from "../model";

const unitTypeDescriptions: Record<BookingOptionKey, string> = {
	HOT_DESK: "Flexibler Einzelplatz in einem offenen Arbeitsbereich.",
	BOOTH: "Kompakter Rückzugsort für konzentriertes Arbeiten.",
	TEAM_ROOM: "Raum für Teamarbeit, Abstimmungen und Workshops.",
	MEETING_ROOM: "Großer Raum für Meetings, Workshops und Präsentationen.",
};

export function getBookingOptionDescription(key: BookingOptionKey): string {
	return unitTypeDescriptions[key];
}
