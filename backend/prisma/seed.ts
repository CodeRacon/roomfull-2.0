import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const spaceTypes: { name: string }[] = [
	{ name: "Hot Desk" },
	{ name: "Booth" },
	{ name: "Team Room" },
];

async function main(): Promise<void> {
	await Promise.all(
		spaceTypes.map((spaceType) =>
			prisma.spaceType.upsert({
				where: { name: spaceType.name },
				update: {},
				create: { name: spaceType.name },
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
