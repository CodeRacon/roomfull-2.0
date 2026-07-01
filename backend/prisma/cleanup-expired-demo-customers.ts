import { createPrismaDemoCustomerCleanupSource } from "../src/db/demo-customer-cleanup.repository.js";
import { prisma } from "../src/db/prisma.js";
import { createDemoCustomerCleanupService } from "../src/services/demo-customer-cleanup.service.js";

async function main() {
	const service = createDemoCustomerCleanupService({
		now: () => new Date(),
		source: createPrismaDemoCustomerCleanupSource(),
	});
	const result = await service.cleanupExpiredDemoCustomers();

	console.log("Expired Demo Customer cleanup completed");
	console.log(
		`Expired Demo Customers found: ${result.expiredDemoCustomersFound}`,
	);
	console.log(`Users deleted: ${result.usersDeleted}`);
	console.log(`Bookings deleted: ${result.bookingsDeleted}`);
	console.log(`Contact Requests deleted: ${result.contactRequestsDeleted}`);
	console.log(`Team Members deleted: ${result.teamMembersDeleted}`);
	console.log(`Teams deleted: ${result.teamsDeleted}`);
}

void main()
	.catch((error) => {
		console.error("Expired Demo Customer cleanup failed");
		console.error(error);
		process.exitCode = 1;
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
