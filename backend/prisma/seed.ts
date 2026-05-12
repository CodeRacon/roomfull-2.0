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
	{ name: UnitTypeName.BOOTH, minDurationMinutes: 60, maxDurationMinutes: 480 },
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
		update: {},
		create: {
			name: "Open World",
			description: "Offener Bereich mit mehreren Hot-Desk-Units",
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

	const demoUnits = [
		{
			id: "seed-hot-desk-a1",
			name: "Hot Desk A1",
			description: "Flexibler Arbeitsplatz im Open-World-Bereich",
			capacity: 1,
			displayOrder: 10,
			unitTypeId: hotDeskType.id,
			areaId: openWorldArea.id,
		},
		{
			id: "seed-hot-desk-a2",
			name: "Hot Desk A2",
			description: "Flexibler Arbeitsplatz im Open-World-Bereich",
			capacity: 1,
			displayOrder: 20,
			unitTypeId: hotDeskType.id,
			areaId: openWorldArea.id,
		},
		{
			id: "seed-booth-b1",
			name: "Booth B1",
			description: "Kompakte Booth für fokussierte Arbeit im kleinen Team",
			capacity: 4,
			displayOrder: 30,
			unitTypeId: boothType.id,
			areaId: null,
		},
		{
			id: "seed-team-room-c1",
			name: "Team Room C1",
			description: "Meetingraum für kleine Teams und Workshops",
			capacity: 6,
			displayOrder: 40,
			unitTypeId: teamRoomType.id,
			areaId: null,
		},
		{
			id: "seed-meeting-room-d1",
			name: "Meeting Room D1",
			description: "Großer Meeting Room für Workshops und Abstimmungen",
			capacity: 16,
			displayOrder: 50,
			unitTypeId: meetingRoomType.id,
			areaId: null,
		},
	];

	await Promise.all(
		demoUnits.map((unit) =>
			prisma.bookableUnit.upsert({
				where: { id: unit.id },
				update: {
					name: unit.name,
					description: unit.description,
					capacity: unit.capacity,
					displayOrder: unit.displayOrder,
					unitTypeId: unit.unitTypeId,
					areaId: unit.areaId,
					isActive: true,
				},
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
