import { PrismaClient, UnitTypeName, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const PASSWORD_HASH_ROUNDS = 12;

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
	const adminPasswordHash = await bcrypt.hash("1q2w3e4r", PASSWORD_HASH_ROUNDS);

	await prisma.user.upsert({
		where: { email: "admin@example.com" },
		update: {
			name: "Admin User",
			passwordHash: adminPasswordHash,
			role: UserRole.ADMIN,
		},
		create: {
			name: "Admin User",
			email: "admin@example.com",
			passwordHash: adminPasswordHash,
			role: UserRole.ADMIN,
		},
	});

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
