import { describe, expect, it } from "vitest";
import { getDictionary } from "@/shared/i18n";
import {
	buildTeamShareBccList,
	buildTeamShareIcsContent,
	buildTeamShareMessage,
	buildTeamShareSubject,
} from "./share-package";

const deCopy = (await getDictionary("de")).bookingShare.package;

const shareContext = {
	booking: {
		id: "booking-1",
		startTime: "2026-07-03T08:00:00.000Z",
		endTime: "2026-07-03T10:00:00.000Z",
	},
	unit: {
		id: "unit-1",
		name: "Team Room Atlas",
		capacity: 4,
		unitType: {
			name: "TEAM_ROOM" as const,
		},
	},
};

describe("share-package", () => {
	it("builds bcc list with comma-space separator", () => {
		expect(
			buildTeamShareBccList([
				{ id: "1", name: "Anna", email: "anna@example.com" },
				{ id: "2", name: "Ben", email: "ben@example.com" },
			]),
		).toBe("anna@example.com, ben@example.com");
	});

	it("builds subject and message from share context", () => {
		const subject = buildTeamShareSubject(shareContext, "de", deCopy);
		const message = buildTeamShareMessage({
			copy: deCopy,
			locale: "de",
			personalMessage: "Bitte seid 10 Minuten früher da.",
			shareContext,
		});

		expect(subject).toContain("Team Room Atlas");
		expect(message).toContain("Hallo zusammen,");
		expect(message).toContain("Bitte seid 10 Minuten früher da.");
		expect(message).toContain("Team Room Atlas");
	});

	it("builds recipient-friendly ics without organizer or attendees", () => {
		const ics = buildTeamShareIcsContent({
			copy: deCopy,
			locale: "de",
			shareContext,
		});

		expect(ics).toContain("BEGIN:VEVENT");
		expect(ics).toContain("SUMMARY:");
		expect(ics).not.toContain("ORGANIZER");
		expect(ics).not.toContain("ATTENDEE");
		expect(ics).not.toContain("RSVP");
	});
});
