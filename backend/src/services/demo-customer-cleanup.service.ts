export type DemoCustomerCleanupCounts = {
	usersDeleted: number;
	bookingsDeleted: number;
	contactRequestsDeleted: number;
	teamMembersDeleted: number;
	teamsDeleted: number;
};

export type DemoCustomerCleanupResult = DemoCustomerCleanupCounts & {
	expiredDemoCustomersFound: number;
};

export type DemoCustomerCleanupSource = {
	withTransaction<T>(
		operation: (source: DemoCustomerCleanupSource) => Promise<T>,
	): Promise<T>;
	listExpiredDemoCustomerIds(expiresBefore: Date): Promise<string[]>;
	deleteBookingsForUsers(userIds: string[]): Promise<number>;
	deleteContactRequestsForUsers(userIds: string[]): Promise<number>;
	deleteTeamMembersForUsers(userIds: string[]): Promise<number>;
	deleteTeamsForUsers(userIds: string[]): Promise<number>;
	deleteExpiredDemoUsersByIds(input: {
		userIds: string[];
		expiresBefore: Date;
	}): Promise<number>;
};

type DemoCustomerCleanupDependencies = {
	now: () => Date;
	source: DemoCustomerCleanupSource;
};

const emptyCleanupResult: DemoCustomerCleanupResult = {
	expiredDemoCustomersFound: 0,
	usersDeleted: 0,
	bookingsDeleted: 0,
	contactRequestsDeleted: 0,
	teamMembersDeleted: 0,
	teamsDeleted: 0,
};

export function createDemoCustomerCleanupService(
	dependencies: DemoCustomerCleanupDependencies,
) {
	return {
		async cleanupExpiredDemoCustomers(): Promise<DemoCustomerCleanupResult> {
			const expiresBefore = dependencies.now();

			return dependencies.source.withTransaction(async (source) => {
				const userIds = await source.listExpiredDemoCustomerIds(expiresBefore);

				if (userIds.length === 0) {
					return emptyCleanupResult;
				}

				const bookingsDeleted = await source.deleteBookingsForUsers(userIds);
				const contactRequestsDeleted =
					await source.deleteContactRequestsForUsers(userIds);
				const teamMembersDeleted =
					await source.deleteTeamMembersForUsers(userIds);
				const teamsDeleted = await source.deleteTeamsForUsers(userIds);
				const usersDeleted = await source.deleteExpiredDemoUsersByIds({
					userIds,
					expiresBefore,
				});

				return {
					expiredDemoCustomersFound: userIds.length,
					usersDeleted,
					bookingsDeleted,
					contactRequestsDeleted,
					teamMembersDeleted,
					teamsDeleted,
				};
			});
		},
	};
}
