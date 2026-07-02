import "dotenv/config";
import { prisma } from "../src/db/prisma.js";
import { bootstrapAdminUser } from "../src/services/admin-bootstrap.service.js";

async function main(): Promise<void> {
	const admin = await bootstrapAdminUser({
		name: process.env.ADMIN_NAME ?? "",
		email: process.env.ADMIN_EMAIL ?? "",
		password: process.env.ADMIN_PASSWORD ?? "",
	});

	console.log(`Admin bootstrap abgeschlossen: ${admin.email}`);
}

main()
	.catch((error) => {
		console.error(
			error instanceof Error ? error.message : "Admin bootstrap fehlgeschlagen",
		);
		process.exitCode = 1;
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
