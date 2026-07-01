import type { Prisma, PrismaClient } from "@prisma/client";
import type { DemoCustomerCleanupSource } from "../services/demo-customer-cleanup.service.js";
import { prisma } from "./prisma.js";

type DemoCustomerCleanupClient = PrismaClient | Prisma.TransactionClient;

export function createPrismaDemoCustomerCleanupSource(
	client: DemoCustomerCleanupClient = prisma,
	transactionRunner: PrismaClient = prisma,
): DemoCustomerCleanupSource {
	return {
		withTransaction: (operation) =>
			transactionRunner.$transaction((tx) =>
				operation(createPrismaDemoCustomerCleanupSource(tx, transactionRunner)),
			),
		async listExpiredDemoCustomerIds(expiresBefore) {
			const users = await client.user.findMany({
				where: {
					isDemo: true,
					demoExpiresAt: {
						lt: expiresBefore,
					},
				},
				select: {
					id: true,
				},
			});

			return users.map((user) => user.id);
		},
		async deleteBookingsForUsers(userIds) {
			const result = await client.booking.deleteMany({
				where: {
					userId: {
						in: userIds,
					},
				},
			});

			return result.count;
		},
		async deleteContactRequestsForUsers(userIds) {
			const result = await client.contactRequest.deleteMany({
				where: {
					userId: {
						in: userIds,
					},
				},
			});

			return result.count;
		},
		async deleteTeamMembersForUsers(userIds) {
			const result = await client.teamMember.deleteMany({
				where: {
					team: {
						userId: {
							in: userIds,
						},
					},
				},
			});

			return result.count;
		},
		async deleteTeamsForUsers(userIds) {
			const result = await client.team.deleteMany({
				where: {
					userId: {
						in: userIds,
					},
				},
			});

			return result.count;
		},
		async deleteExpiredDemoUsersByIds(input) {
			const result = await client.user.deleteMany({
				where: {
					id: {
						in: input.userIds,
					},
					isDemo: true,
					demoExpiresAt: {
						lt: input.expiresBefore,
					},
				},
			});

			return result.count;
		},
	};
}
