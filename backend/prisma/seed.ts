import { PrismaClient, UnitTypeName } from "@prisma/client";

const prisma = new PrismaClient();

const unitTypes: {
	name: UnitTypeName;
	minDurationMinutes: number;
	maxDurationMinutes: number;
}[] = [
	{ name: UnitTypeName.HOT_DESK, minDurationMinutes: 30, maxDurationMinutes: 240 },
	{ name: UnitTypeName.BOOTH, minDurationMinutes: 60, maxDurationMinutes: 480 },
	{ name: UnitTypeName.TEAM_ROOM, minDurationMinutes: 60, maxDurationMinutes: 480 },
];

async function main(): Promise<void> {
	await prisma.area.upsert({
		where: { name: "Open World" },
		update: {},
		create: {
			name: "Open World",
			description: "Offener Bereich mit mehreren Hot-Desk-Units",
		},
	});

	await Promise.all(
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
}

main()
	.catch((e) => {
		console.error(e);
		throw e;
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
