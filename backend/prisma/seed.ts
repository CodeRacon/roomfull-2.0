import { PrismaClient, UnitTypeName } from "@prisma/client";

const prisma = new PrismaClient();

const unitTypes: {
	name: UnitTypeName;
	minDurationMinutes: number;
	maxDurationMinutes: number;
}[] = [
	{
		name: UnitTypeName.HOT_DESK,
		minDurationMinutes: 30,
		maxDurationMinutes: 240,
	},
	{ name: UnitTypeName.BOOTH, minDurationMinutes: 60, maxDurationMinutes: 240 },
	{
		name: UnitTypeName.TEAM_ROOM,
		minDurationMinutes: 60,
		maxDurationMinutes: 480,
	},
	{
		name: UnitTypeName.MEETING_ROOM,
		minDurationMinutes: 60,
		maxDurationMinutes: 480,
	},
];

async function main(): Promise<void> {
	const openWorldArea = await prisma.area.upsert({
		where: { name: "Open World" },
		update: {
			description: "Open World mit lebendiger Coworking-Atmosphäre",
			descriptionDe: "Open World mit lebendiger Coworking-Atmosphäre",
			descriptionEn: "Open World with a lively coworking atmosphere",
			isActive: true,
		},
		create: {
			name: "Open World",
			description: "Open World mit lebendiger Coworking-Atmosphäre",
			descriptionDe: "Open World mit lebendiger Coworking-Atmosphäre",
			descriptionEn: "Open World with a lively coworking atmosphere",
		},
	});

	const quietPlaceArea = await prisma.area.upsert({
		where: { name: "Quiet Place" },
		update: {
			description: "Ruhiger Bereich für konzentriertes Arbeiten",
			descriptionDe: "Ruhiger Bereich für konzentriertes Arbeiten",
			descriptionEn: "Quiet area for focused work",
			isActive: true,
		},
		create: {
			name: "Quiet Place",
			description: "Ruhiger Bereich für konzentriertes Arbeiten",
			descriptionDe: "Ruhiger Bereich für konzentriertes Arbeiten",
			descriptionEn: "Quiet area for focused work",
		},
	});

	const seededUnitTypes = await Promise.all(
		unitTypes.map((unitType) =>
			prisma.unitType.upsert({
				where: { name: unitType.name },
				update: {
					minDurationMinutes: unitType.minDurationMinutes,
					maxDurationMinutes: unitType.maxDurationMinutes,
				},
				create: unitType,
			}),
		),
	);

	const hotDeskType = seededUnitTypes.find(
		(unitType) => unitType.name === UnitTypeName.HOT_DESK,
	);

	const boothType = seededUnitTypes.find(
		(unitType) => unitType.name === UnitTypeName.BOOTH,
	);

	const teamRoomType = seededUnitTypes.find(
		(unitType) => unitType.name === UnitTypeName.TEAM_ROOM,
	);

	const meetingRoomType = seededUnitTypes.find(
		(unitType) => unitType.name === UnitTypeName.MEETING_ROOM,
	);

	if (!hotDeskType || !boothType || !teamRoomType || !meetingRoomType) {
		throw new Error("UnitTypes fehlen nach Seed");
	}

	const hotDeskUnits = [
		...Array.from({ length: 16 }, (_, index) => ({
			id: `seed-hot-desk-open-world-${index + 1}`,
			name: `Open World Desk ${index + 1}`,
			description: "Flexibler Einzelplatz im Open-World-Bereich",
			descriptionDe: "Flexibler Einzelplatz im Open-World-Bereich",
			descriptionEn: "Flexible single desk in the Open World area",
			capacity: 1,
			displayOrder: 10 + index,
			unitTypeId: hotDeskType.id,
			areaId: openWorldArea.id,
		})),
		...Array.from({ length: 12 }, (_, index) => ({
			id: `seed-hot-desk-quiet-place-${index + 1}`,
			name: `Quiet Place Desk ${index + 1}`,
			description: "Ruhiger Einzelplatz im Quiet-Place-Bereich",
			descriptionDe: "Ruhiger Einzelplatz im Quiet-Place-Bereich",
			descriptionEn: "Quiet single desk in the Quiet Place area",
			capacity: 1,
			displayOrder: 100 + index,
			unitTypeId: hotDeskType.id,
			areaId: quietPlaceArea.id,
		})),
	];

	const demoUnits = [
		...hotDeskUnits,
		{
			id: "seed-booth-a1",
			name: "Cozy Cocoon",
			description:
				"Dein geschützter Raum für längere Fokusphasen und Deep Work. Ruhig, bequem und ideal, wenn du tiefer eintauchen und für eine Weile wirklich bei einer Sache bleiben willst.",
			descriptionDe:
				"Dein geschützter Raum für längere Fokusphasen und Deep Work. Ruhig, bequem und ideal, wenn du tiefer eintauchen und für eine Weile wirklich bei einer Sache bleiben willst.",
			descriptionEn:
				"Your private space for longer focus sessions and deep work. Quiet, comfortable, and ideal when you want to dive deeper and stay with one task for a while.",
			capacity: 3,
			displayOrder: 1,
			unitTypeId: boothType.id,
			areaId: null,
		},
		{
			id: "seed-booth-b1",
			name: "Book Nook",
			description:
				"Dein ruhiger Rückzugsort für ungestörtes und konzentriertes Arbeiten. Still, kompakt und ideal, wenn du für eine Weile aus dem Trubel raus willst.",
			descriptionDe:
				"Dein ruhiger Rückzugsort für ungestörtes und konzentriertes Arbeiten. Still, kompakt und ideal, wenn du für eine Weile aus dem Trubel raus willst.",
			descriptionEn:
				"Your quiet retreat for uninterrupted, focused work. Calm, compact, and ideal when you want to get away from the bustle for a while.",
			capacity: 3,
			displayOrder: 2,
			unitTypeId: boothType.id,
			areaId: null,
		},
		{
			id: "seed-booth-c1",
			name: "Call-in Cabin",
			description:
				"Deine kleine Cabin für Calls, Videomeetings und vertrauliche Gespräche. Kompakt, abgeschirmt und genau richtig, wenn du ungestört sprechen willst.",
			descriptionDe:
				"Deine kleine Cabin für Calls, Videomeetings und vertrauliche Gespräche. Kompakt, abgeschirmt und genau richtig, wenn du ungestört sprechen willst.",
			descriptionEn:
				"Your small cabin for calls, video meetings, and confidential conversations. Compact, secluded, and just right when you want to speak without interruptions.",
			capacity: 4,
			displayOrder: 3,
			unitTypeId: boothType.id,
			areaId: null,
		},
		{
			id: "seed-booth-d1",
			name: "Hive Five",
			description:
				"Eure kleine Team-Booth für kurze Sessions zu fünft. Kompakt, lebendig und genau richtig, wenn ihr Ideen sammeln, Entscheidungen treffen oder schnell auf einen gemeinsamen Stand kommen wollt.",
			descriptionDe:
				"Eure kleine Team-Booth für kurze Sessions zu fünft. Kompakt, lebendig und genau richtig, wenn ihr Ideen sammeln, Entscheidungen treffen oder schnell auf einen gemeinsamen Stand kommen wollt.",
			descriptionEn:
				"Your small team booth for short sessions with up to five people. Compact, lively, and just right for collecting ideas, making decisions, or quickly getting everyone on the same page.",
			capacity: 5,
			displayOrder: 4,
			unitTypeId: boothType.id,
			areaId: null,
		},
		{
			id: "seed-team-room-c1",
			name: "Huddle Hub",
			description:
				"Euer Raum für kurze Team-Syncs, schnelle Abstimmungen und klare nächste Schritte. Kompakt, direkt und ideal, wenn alle kurz zusammenkommen müssen.",
			descriptionDe:
				"Euer Raum für kurze Team-Syncs, schnelle Abstimmungen und klare nächste Schritte. Kompakt, direkt und ideal, wenn alle kurz zusammenkommen müssen.",
			descriptionEn:
				"Your room for quick team syncs, fast alignment, and clear next steps. Compact, direct, and ideal when everyone needs to come together briefly.",
			capacity: 6,
			displayOrder: 1,
			unitTypeId: teamRoomType.id,
			areaId: null,
		},
		{
			id: "seed-team-room-c2",
			name: "Collab Cabana",
			description:
				"Eure ideale Umgebung für Workshops, Brainstormings und kreative Teamarbeit. Offen, locker, entspannt und gemacht für Ideen, die gemeinsam wachsen sollen.",
			descriptionDe:
				"Eure ideale Umgebung für Workshops, Brainstormings und kreative Teamarbeit. Offen, locker, entspannt und gemacht für Ideen, die gemeinsam wachsen sollen.",
			descriptionEn:
				"Your ideal setting for workshops, brainstorming, and creative teamwork. Open, casual, relaxed, and made for ideas that should grow together.",
			capacity: 8,
			displayOrder: 2,
			unitTypeId: teamRoomType.id,
			areaId: null,
		},
		{
			id: "seed-team-room-c3",
			name: "Sandbox",
			description:
				"Euer flexibler Raum für Try-Outs, Brain-Storming und Prototyping. Ideal, wenn ihr Gedanken sichtbar machen, testen und gemeinsam weiterentwickeln wollt.",
			descriptionDe:
				"Euer flexibler Raum für Try-Outs, Brain-Storming und Prototyping. Ideal, wenn ihr Gedanken sichtbar machen, testen und gemeinsam weiterentwickeln wollt.",
			descriptionEn:
				"Your flexible room for try-outs, brainstorming, and prototyping. Ideal when you want to make ideas visible, test them, and develop them together.",
			capacity: 10,
			displayOrder: 3,
			unitTypeId: teamRoomType.id,
			areaId: null,
		},
		{
			id: "seed-meeting-room-d0",
			name: "Meet’n Neat",
			description:
				"Euer Raum für Gespräche, bei denen der erste Eindruck zählt. Einladend, ruhig und aufgeräumt — ideal für Kundentermine, Beratung und kompakte Abstimmungen.",
			descriptionDe:
				"Euer Raum für Gespräche, bei denen der erste Eindruck zählt. Einladend, ruhig und aufgeräumt — ideal für Kundentermine, Beratung und kompakte Abstimmungen.",
			descriptionEn:
				"Your room for conversations where first impressions matter. Welcoming, calm, and tidy—ideal for client meetings, consultations, and focused alignment.",
			capacity: 6,
			displayOrder: 1,
			unitTypeId: meetingRoomType.id,
			areaId: null,
		},
		{
			id: "seed-meeting-room-d1",
			name: "Table Talk",
			description:
				"Euer Forum für aktiven Austausch, Entscheidungsfindung und gemeinsame Klärung. Ruhig, großzügig und ideal, wenn mehrere Perspektiven an einen Tisch gehören.",
			descriptionDe:
				"Euer Forum für aktiven Austausch, Entscheidungsfindung und gemeinsame Klärung. Ruhig, großzügig und ideal, wenn mehrere Perspektiven an einen Tisch gehören.",
			descriptionEn:
				"Your forum for active exchange, decision-making, and shared clarity. Calm, spacious, and ideal when multiple perspectives belong at one table.",
			capacity: 12,
			displayOrder: 2,
			unitTypeId: meetingRoomType.id,
			areaId: null,
		},
		{
			id: "seed-meeting-room-d2",
			name: "Show & Flow",
			description:
				"Euer Raum für Key-Notes, Pitches und Workshops - ausgestattet mit allem was es braucht, damit eure Ideen überzeugen und um euer Publikum mitzunehmen.",
			descriptionDe:
				"Euer Raum für Key-Notes, Pitches und Workshops - ausgestattet mit allem was es braucht, damit eure Ideen überzeugen und um euer Publikum mitzunehmen.",
			descriptionEn:
				"Your room for keynotes, pitches, and workshops—equipped with everything you need to make your ideas compelling and bring your audience along.",
			capacity: 12,
			displayOrder: 3,
			unitTypeId: meetingRoomType.id,
			areaId: null,
		},
	];

	await Promise.all(
		demoUnits.map((unit) =>
			prisma.bookableUnit.upsert({
				where: { id: unit.id },
				update: {},
				create: {
					...unit,
					isActive: true,
				},
			}),
		),
	);
}

main()
	.catch((e) => {
		console.error(e);
		throw e;
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
