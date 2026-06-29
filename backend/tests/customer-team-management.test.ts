import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { AppError } from "../src/lib/app-error.js";
import {
	type CustomerTeamManagementSource,
	createCustomerTeamManagement,
} from "../src/services/customer-team-management.js";

function createHarness() {
	const teams: Array<{
		id: string;
		customerId: string;
		name: string;
		normalizedName: string;
	}> = [];
	const members: Array<{
		id: string;
		teamId: string;
		name: string;
		email: string;
	}> = [];

	const source = {
		createTeamMember: async (input) => {
			const member = {
				id: `member-${members.length + 1}`,
				...input,
			};
			members.push(member);
			return {
				id: member.id,
				name: member.name,
				email: member.email,
			};
		},
		updateTeamMember: async (input) => {
			const member = members.find(
				(member) =>
					member.teamId === input.teamId && member.id === input.memberId,
			);
			if (!member) {
				throw new Error("Member not found");
			}

			member.name = input.name;
			member.email = input.email;
			return {
				id: member.id,
				name: member.name,
				email: member.email,
			};
		},
		deleteTeamMember: async (input) => {
			const memberIndex = members.findIndex(
				(member) =>
					member.teamId === input.teamId && member.id === input.memberId,
			);
			if (memberIndex === -1) {
				throw new Error("Member not found");
			}

			members.splice(memberIndex, 1);
		},
		createTeam: async (input) => {
			const team = {
				id: `team-${teams.length + 1}`,
				...input,
			};
			teams.push(team);
			return team;
		},
		updateTeamName: async (input) => {
			const team = teams.find((team) => team.id === input.teamId);
			if (!team) {
				throw new Error("Team not found");
			}

			team.name = input.name;
			team.normalizedName = input.normalizedName;
			return {
				id: team.id,
				name: team.name,
			};
		},
		deleteTeam: async (teamId) => {
			const teamIndex = teams.findIndex((team) => team.id === teamId);
			if (teamIndex === -1) {
				throw new Error("Team not found");
			}

			teams.splice(teamIndex, 1);
			for (let index = members.length - 1; index >= 0; index -= 1) {
				if (members[index]?.teamId === teamId) {
					members.splice(index, 1);
				}
			}
		},
		listTeamSummaries: async (customerId) =>
			teams
				.filter((team) => team.customerId === customerId)
				.map((team) => ({
					id: team.id,
					name: team.name,
					memberCount: members.filter((member) => member.teamId === team.id)
						.length,
				})),
		findTeamDetail: async (input) => {
			const team = teams.find(
				(team) =>
					team.customerId === input.customerId && team.id === input.teamId,
			);

			if (!team) {
				return null;
			}

			return {
				id: team.id,
				name: team.name,
				members: members
					.filter((member) => member.teamId === team.id)
					.map((member) => ({
						id: member.id,
						name: member.name,
						email: member.email,
					})),
			};
		},
		findTeamByNormalizedName: async (customerId, normalizedName) =>
			teams.find(
				(team) =>
					team.customerId === customerId &&
					team.normalizedName === normalizedName,
			) ?? null,
		countTeamsByCustomer: async (customerId) =>
			teams.filter((team) => team.customerId === customerId).length,
	} satisfies CustomerTeamManagementSource;

	return createCustomerTeamManagement({ source });
}

function assertAppError(
	action: () => Promise<unknown>,
	statusCode: number,
): Promise<void> {
	return assert.rejects(
		action,
		(error: unknown) =>
			error instanceof AppError && error.statusCode === statusCode,
	);
}

describe("Customer Team Management", () => {
	it("creates a private Team and lists it for its Customer", async () => {
		const management = createHarness();

		const created = await management.create({
			customerId: "customer-1",
			name: "  Workshop Crew  ",
		});
		const listed = await management.list({ customerId: "customer-1" });

		assert.deepEqual(created, {
			id: "team-1",
			name: "Workshop Crew",
			memberCount: 0,
		});
		assert.deepEqual(listed, [created]);
	});

	it("rejects an empty Team name", async () => {
		const management = createHarness();

		await assertAppError(
			() =>
				management.create({
					customerId: "customer-1",
					name: "   ",
				}),
			400,
		);
	});

	it("rejects a Team name longer than 80 characters", async () => {
		const management = createHarness();

		await assertAppError(
			() =>
				management.create({
					customerId: "customer-1",
					name: "A".repeat(81),
				}),
			400,
		);
	});

	it("rejects a duplicate Team name for the same Customer case-insensitively", async () => {
		const management = createHarness();

		await management.create({
			customerId: "customer-1",
			name: "Workshop Crew",
		});

		await assertAppError(
			() =>
				management.create({
					customerId: "customer-1",
					name: "  workshop crew  ",
				}),
			409,
		);
	});

	it("allows the same Team name for different Customers", async () => {
		const management = createHarness();

		await management.create({
			customerId: "customer-1",
			name: "Workshop Crew",
		});
		const created = await management.create({
			customerId: "customer-2",
			name: "workshop crew",
		});

		assert.deepEqual(created, {
			id: "team-2",
			name: "workshop crew",
			memberCount: 0,
		});
	});

	it("lists only Teams owned by the Customer", async () => {
		const management = createHarness();

		const firstCustomerTeam = await management.create({
			customerId: "customer-1",
			name: "Workshop Crew",
		});
		const secondCustomerTeam = await management.create({
			customerId: "customer-2",
			name: "Design Circle",
		});

		assert.deepEqual(await management.list({ customerId: "customer-1" }), [
			firstCustomerTeam,
		]);
		assert.deepEqual(await management.list({ customerId: "customer-2" }), [
			secondCustomerTeam,
		]);
	});

	it("loads an empty Team detail for its Customer", async () => {
		const management = createHarness();

		const created = await management.create({
			customerId: "customer-1",
			name: "Workshop Crew",
		});

		await assert.deepEqual(
			await management.getDetail({
				customerId: "customer-1",
				teamId: created.id,
			}),
			{
				id: created.id,
				name: "Workshop Crew",
				members: [],
			},
		);
	});

	it("adds a Member to an owned Team and shows it in Team detail", async () => {
		const management = createHarness();
		const created = await management.create({
			customerId: "customer-1",
			name: "Workshop Crew",
		});

		const member = await management.addMember({
			customerId: "customer-1",
			teamId: created.id,
			name: "  Ada Lovelace  ",
			email: "  ADA@Example.COM  ",
		});

		assert.deepEqual(member, {
			id: "member-1",
			name: "Ada Lovelace",
			email: "ada@example.com",
		});
		assert.deepEqual(
			await management.getDetail({
				customerId: "customer-1",
				teamId: created.id,
			}),
			{
				id: created.id,
				name: "Workshop Crew",
				members: [member],
			},
		);
	});

	it("hides missing and foreign Teams when adding Members", async () => {
		const management = createHarness();
		const foreignTeam = await management.create({
			customerId: "customer-2",
			name: "Design Circle",
		});

		await assertAppError(
			() =>
				management.addMember({
					customerId: "customer-1",
					teamId: foreignTeam.id,
					name: "Ada Lovelace",
					email: "ada@example.com",
				}),
			404,
		);
		await assertAppError(
			() =>
				management.addMember({
					customerId: "customer-1",
					teamId: "missing-team",
					name: "Ada Lovelace",
					email: "ada@example.com",
				}),
			404,
		);
	});

	it("rejects invalid Member names", async () => {
		const management = createHarness();
		const created = await management.create({
			customerId: "customer-1",
			name: "Workshop Crew",
		});

		await assertAppError(
			() =>
				management.addMember({
					customerId: "customer-1",
					teamId: created.id,
					name: "   ",
					email: "ada@example.com",
				}),
			400,
		);
		await assertAppError(
			() =>
				management.addMember({
					customerId: "customer-1",
					teamId: created.id,
					name: "A".repeat(101),
					email: "ada@example.com",
				}),
			400,
		);
	});

	it("rejects invalid Member emails", async () => {
		const management = createHarness();
		const created = await management.create({
			customerId: "customer-1",
			name: "Workshop Crew",
		});

		for (const email of ["   ", "not-an-email", `${"a".repeat(249)}@x.com`]) {
			await assertAppError(
				() =>
					management.addMember({
						customerId: "customer-1",
						teamId: created.id,
						name: "Ada Lovelace",
						email,
					}),
				400,
			);
		}
	});

	it("rejects duplicate Member emails in one Team case-insensitively", async () => {
		const management = createHarness();
		const created = await management.create({
			customerId: "customer-1",
			name: "Workshop Crew",
		});

		await management.addMember({
			customerId: "customer-1",
			teamId: created.id,
			name: "Ada Lovelace",
			email: "ada@example.com",
		});

		await assertAppError(
			() =>
				management.addMember({
					customerId: "customer-1",
					teamId: created.id,
					name: "Ada Again",
					email: "  ADA@EXAMPLE.COM  ",
				}),
			409,
		);
	});

	it("allows the same Member email in another Team", async () => {
		const management = createHarness();
		const firstTeam = await management.create({
			customerId: "customer-1",
			name: "Workshop Crew",
		});
		const secondTeam = await management.create({
			customerId: "customer-1",
			name: "Design Circle",
		});

		await management.addMember({
			customerId: "customer-1",
			teamId: firstTeam.id,
			name: "Ada Lovelace",
			email: "ada@example.com",
		});
		const secondMember = await management.addMember({
			customerId: "customer-1",
			teamId: secondTeam.id,
			name: "Ada Lovelace",
			email: "ada@example.com",
		});

		assert.deepEqual(secondMember, {
			id: "member-2",
			name: "Ada Lovelace",
			email: "ada@example.com",
		});
	});

	it("rejects adding more than 50 Members to one Team", async () => {
		const management = createHarness();
		const created = await management.create({
			customerId: "customer-1",
			name: "Workshop Crew",
		});

		for (let index = 1; index <= 50; index += 1) {
			await management.addMember({
				customerId: "customer-1",
				teamId: created.id,
				name: `Member ${index}`,
				email: `member-${index}@example.com`,
			});
		}

		await assertAppError(
			() =>
				management.addMember({
					customerId: "customer-1",
					teamId: created.id,
					name: "Member 51",
					email: "member-51@example.com",
				}),
			409,
		);
	});

	it("updates a Member in an owned Team and shows it in Team detail", async () => {
		const management = createHarness();
		const created = await management.create({
			customerId: "customer-1",
			name: "Workshop Crew",
		});
		const member = await management.addMember({
			customerId: "customer-1",
			teamId: created.id,
			name: "Ada Lovelace",
			email: "ada@example.com",
		});

		const updated = await management.updateMember({
			customerId: "customer-1",
			teamId: created.id,
			memberId: member.id,
			name: "  Grace Hopper  ",
			email: "  GRACE@Example.COM  ",
		});

		assert.deepEqual(updated, {
			id: member.id,
			name: "Grace Hopper",
			email: "grace@example.com",
		});
		assert.deepEqual(
			await management.getDetail({
				customerId: "customer-1",
				teamId: created.id,
			}),
			{
				id: created.id,
				name: "Workshop Crew",
				members: [updated],
			},
		);
	});

	it("hides missing and foreign Teams or Members when updating Members", async () => {
		const management = createHarness();
		const ownTeam = await management.create({
			customerId: "customer-1",
			name: "Workshop Crew",
		});
		const foreignTeam = await management.create({
			customerId: "customer-2",
			name: "Design Circle",
		});
		const member = await management.addMember({
			customerId: "customer-2",
			teamId: foreignTeam.id,
			name: "Ada Lovelace",
			email: "ada@example.com",
		});

		await assertAppError(
			() =>
				management.updateMember({
					customerId: "customer-1",
					teamId: foreignTeam.id,
					memberId: member.id,
					name: "Grace Hopper",
					email: "grace@example.com",
				}),
			404,
		);
		await assertAppError(
			() =>
				management.updateMember({
					customerId: "customer-1",
					teamId: ownTeam.id,
					memberId: "missing-member",
					name: "Grace Hopper",
					email: "grace@example.com",
				}),
			404,
		);
	});

	it("rejects invalid Member data when updating Members", async () => {
		const management = createHarness();
		const created = await management.create({
			customerId: "customer-1",
			name: "Workshop Crew",
		});
		const member = await management.addMember({
			customerId: "customer-1",
			teamId: created.id,
			name: "Ada Lovelace",
			email: "ada@example.com",
		});

		for (const input of [
			{ name: "   ", email: "grace@example.com" },
			{ name: "A".repeat(101), email: "grace@example.com" },
			{ name: "Grace Hopper", email: "   " },
			{ name: "Grace Hopper", email: "not-an-email" },
			{ name: "Grace Hopper", email: `${"a".repeat(249)}@x.com` },
		]) {
			await assertAppError(
				() =>
					management.updateMember({
						customerId: "customer-1",
						teamId: created.id,
						memberId: member.id,
						...input,
					}),
				400,
			);
		}
	});

	it("rejects duplicate Member emails when updating Members", async () => {
		const management = createHarness();
		const created = await management.create({
			customerId: "customer-1",
			name: "Workshop Crew",
		});
		const firstMember = await management.addMember({
			customerId: "customer-1",
			teamId: created.id,
			name: "Ada Lovelace",
			email: "ada@example.com",
		});
		const secondMember = await management.addMember({
			customerId: "customer-1",
			teamId: created.id,
			name: "Grace Hopper",
			email: "grace@example.com",
		});

		await assertAppError(
			() =>
				management.updateMember({
					customerId: "customer-1",
					teamId: created.id,
					memberId: firstMember.id,
					name: "Ada Lovelace",
					email: "  GRACE@EXAMPLE.COM  ",
				}),
			409,
		);
		await management.updateMember({
			customerId: "customer-1",
			teamId: created.id,
			memberId: secondMember.id,
			name: "Grace Hopper",
			email: "  GRACE@EXAMPLE.COM  ",
		});
	});

	it("deletes a Member from an owned Team", async () => {
		const management = createHarness();
		const created = await management.create({
			customerId: "customer-1",
			name: "Workshop Crew",
		});
		const member = await management.addMember({
			customerId: "customer-1",
			teamId: created.id,
			name: "Ada Lovelace",
			email: "ada@example.com",
		});

		await management.deleteMember({
			customerId: "customer-1",
			teamId: created.id,
			memberId: member.id,
		});

		assert.deepEqual(
			await management.getDetail({
				customerId: "customer-1",
				teamId: created.id,
			}),
			{
				id: created.id,
				name: "Workshop Crew",
				members: [],
			},
		);
	});

	it("hides missing and foreign Teams or Members when deleting Members", async () => {
		const management = createHarness();
		const ownTeam = await management.create({
			customerId: "customer-1",
			name: "Workshop Crew",
		});
		const foreignTeam = await management.create({
			customerId: "customer-2",
			name: "Design Circle",
		});
		const member = await management.addMember({
			customerId: "customer-2",
			teamId: foreignTeam.id,
			name: "Ada Lovelace",
			email: "ada@example.com",
		});

		await assertAppError(
			() =>
				management.deleteMember({
					customerId: "customer-1",
					teamId: foreignTeam.id,
					memberId: member.id,
				}),
			404,
		);
		await assertAppError(
			() =>
				management.deleteMember({
					customerId: "customer-1",
					teamId: ownTeam.id,
					memberId: "missing-member",
				}),
			404,
		);
	});

	it("renames an owned Team and exposes the new name", async () => {
		const management = createHarness();
		const created = await management.create({
			customerId: "customer-1",
			name: "Workshop Crew",
		});

		const renamed = await management.rename({
			customerId: "customer-1",
			teamId: created.id,
			name: "  Product Circle  ",
		});

		assert.deepEqual(renamed, {
			id: created.id,
			name: "Product Circle",
			memberCount: 0,
		});
		assert.deepEqual(await management.list({ customerId: "customer-1" }), [
			renamed,
		]);
		assert.equal(
			(
				await management.getDetail({
					customerId: "customer-1",
					teamId: created.id,
				})
			).name,
			"Product Circle",
		);
	});

	it("hides missing and foreign Teams when renaming", async () => {
		const management = createHarness();
		const foreignTeam = await management.create({
			customerId: "customer-2",
			name: "Design Circle",
		});

		await assertAppError(
			() =>
				management.rename({
					customerId: "customer-1",
					teamId: foreignTeam.id,
					name: "Product Circle",
				}),
			404,
		);
		await assertAppError(
			() =>
				management.rename({
					customerId: "customer-1",
					teamId: "missing-team",
					name: "Product Circle",
				}),
			404,
		);
	});

	it("rejects invalid Team names when renaming", async () => {
		const management = createHarness();
		const created = await management.create({
			customerId: "customer-1",
			name: "Workshop Crew",
		});

		await assertAppError(
			() =>
				management.rename({
					customerId: "customer-1",
					teamId: created.id,
					name: "   ",
				}),
			400,
		);
		await assertAppError(
			() =>
				management.rename({
					customerId: "customer-1",
					teamId: created.id,
					name: "A".repeat(81),
				}),
			400,
		);
	});

	it("rejects duplicate Team names when renaming", async () => {
		const management = createHarness();
		const firstTeam = await management.create({
			customerId: "customer-1",
			name: "Workshop Crew",
		});
		const secondTeam = await management.create({
			customerId: "customer-1",
			name: "Design Circle",
		});

		await assertAppError(
			() =>
				management.rename({
					customerId: "customer-1",
					teamId: firstTeam.id,
					name: "  design circle  ",
				}),
			409,
		);
		await management.rename({
			customerId: "customer-1",
			teamId: secondTeam.id,
			name: "  DESIGN CIRCLE  ",
		});
	});

	it("deletes an owned Team with its Members", async () => {
		const management = createHarness();
		const created = await management.create({
			customerId: "customer-1",
			name: "Workshop Crew",
		});
		await management.addMember({
			customerId: "customer-1",
			teamId: created.id,
			name: "Ada Lovelace",
			email: "ada@example.com",
		});

		await management.delete({
			customerId: "customer-1",
			teamId: created.id,
		});

		assert.deepEqual(await management.list({ customerId: "customer-1" }), []);
		await assertAppError(
			() =>
				management.getDetail({
					customerId: "customer-1",
					teamId: created.id,
				}),
			404,
		);
	});

	it("hides missing and foreign Teams when deleting", async () => {
		const management = createHarness();
		const foreignTeam = await management.create({
			customerId: "customer-2",
			name: "Design Circle",
		});

		await assertAppError(
			() =>
				management.delete({
					customerId: "customer-1",
					teamId: foreignTeam.id,
				}),
			404,
		);
		await assertAppError(
			() =>
				management.delete({
					customerId: "customer-1",
					teamId: "missing-team",
				}),
			404,
		);
	});

	it("hides missing and foreign Team details", async () => {
		const management = createHarness();

		const foreignTeam = await management.create({
			customerId: "customer-2",
			name: "Design Circle",
		});

		await assertAppError(
			() =>
				management.getDetail({
					customerId: "customer-1",
					teamId: foreignTeam.id,
				}),
			404,
		);
		await assertAppError(
			() =>
				management.getDetail({
					customerId: "customer-1",
					teamId: "missing-team",
				}),
			404,
		);
	});

	it("rejects creating more than 20 Teams for one Customer", async () => {
		const management = createHarness();

		for (let index = 1; index <= 20; index += 1) {
			await management.create({
				customerId: "customer-1",
				name: `Team ${index}`,
			});
		}

		await assertAppError(
			() =>
				management.create({
					customerId: "customer-1",
					name: "Team 21",
				}),
			409,
		);
	});
});
