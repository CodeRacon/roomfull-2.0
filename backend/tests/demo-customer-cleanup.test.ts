import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
	createDemoCustomerCleanupService,
	type DemoCustomerCleanupSource,
} from "../src/services/demo-customer-cleanup.service.js";

function createSourceHarness(options: { expiredDemoCustomerIds: string[] }) {
	const operations: string[] = [];
	const expiresBeforeValues: Date[] = [];
	const deletedUserInputs: Array<{ userIds: string[]; expiresBefore: Date }> =
		[];

	const source: DemoCustomerCleanupSource = {
		withTransaction: async (operation) => {
			operations.push("transaction:start");
			const result = await operation(source);
			operations.push("transaction:end");
			return result;
		},
		listExpiredDemoCustomerIds: async (expiresBefore) => {
			operations.push("users:list-expired-demo");
			expiresBeforeValues.push(expiresBefore);
			return options.expiredDemoCustomerIds;
		},
		deleteBookingsForUsers: async () => {
			operations.push("bookings:delete");
			return 3;
		},
		deleteContactRequestsForUsers: async () => {
			operations.push("contact-requests:delete");
			return 2;
		},
		deleteTeamMembersForUsers: async () => {
			operations.push("team-members:delete");
			return 6;
		},
		deleteTeamsForUsers: async () => {
			operations.push("teams:delete");
			return 3;
		},
		deleteExpiredDemoUsersByIds: async (input) => {
			operations.push("users:delete-expired-demo");
			deletedUserInputs.push(input);
			return input.userIds.length;
		},
	};

	return {
		source,
		operations,
		expiresBeforeValues,
		deletedUserInputs,
	};
}

describe("Demo Customer Cleanup", () => {
	it("does not delete anything when no Demo Customers are expired", async () => {
		const now = new Date("2026-07-01T10:00:00.000Z");
		const harness = createSourceHarness({ expiredDemoCustomerIds: [] });
		const service = createDemoCustomerCleanupService({
			now: () => now,
			source: harness.source,
		});

		const result = await service.cleanupExpiredDemoCustomers();

		assert.deepEqual(result, {
			expiredDemoCustomersFound: 0,
			usersDeleted: 0,
			bookingsDeleted: 0,
			contactRequestsDeleted: 0,
			teamMembersDeleted: 0,
			teamsDeleted: 0,
		});
		assert.deepEqual(harness.operations, [
			"transaction:start",
			"users:list-expired-demo",
			"transaction:end",
		]);
		assert.deepEqual(harness.expiresBeforeValues, [now]);
	});

	it("deletes dependent Demo Customer data before deleting expired Demo users", async () => {
		const now = new Date("2026-07-01T10:00:00.000Z");
		const harness = createSourceHarness({
			expiredDemoCustomerIds: ["demo-user-1", "demo-user-2"],
		});
		const service = createDemoCustomerCleanupService({
			now: () => now,
			source: harness.source,
		});

		const result = await service.cleanupExpiredDemoCustomers();

		assert.deepEqual(result, {
			expiredDemoCustomersFound: 2,
			usersDeleted: 2,
			bookingsDeleted: 3,
			contactRequestsDeleted: 2,
			teamMembersDeleted: 6,
			teamsDeleted: 3,
		});
		assert.deepEqual(harness.operations, [
			"transaction:start",
			"users:list-expired-demo",
			"bookings:delete",
			"contact-requests:delete",
			"team-members:delete",
			"teams:delete",
			"users:delete-expired-demo",
			"transaction:end",
		]);
		assert.deepEqual(harness.deletedUserInputs, [
			{
				userIds: ["demo-user-1", "demo-user-2"],
				expiresBefore: now,
			},
		]);
	});
});
