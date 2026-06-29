import { prisma } from "./prisma.js";

export type CreateTeamInput = {
	customerId: string;
	name: string;
	normalizedName: string;
};

export type TeamIdentity = {
	id: string;
	name: string;
};

export type TeamSummaryRecord = TeamIdentity & {
	memberCount: number;
};

export type TeamMemberRecord = {
	id: string;
	name: string;
	email: string;
};

export type CreateTeamMemberInput = {
	teamId: string;
	name: string;
	email: string;
};

export type UpdateTeamMemberInput = {
	teamId: string;
	memberId: string;
	name: string;
	email: string;
};

export type UpdateTeamNameInput = {
	teamId: string;
	name: string;
	normalizedName: string;
};

export type TeamDetailRecord = TeamIdentity & {
	members: TeamMemberRecord[];
};

export async function createTeam(
	input: CreateTeamInput,
): Promise<TeamIdentity> {
	return prisma.team.create({
		data: {
			userId: input.customerId,
			name: input.name,
			nameKey: input.normalizedName,
		},
		select: {
			id: true,
			name: true,
		},
	});
}

export async function createTeamMember(
	input: CreateTeamMemberInput,
): Promise<TeamMemberRecord> {
	return prisma.teamMember.create({
		data: {
			teamId: input.teamId,
			name: input.name,
			email: input.email,
		},
		select: {
			id: true,
			name: true,
			email: true,
		},
	});
}

export async function updateTeamMember(
	input: UpdateTeamMemberInput,
): Promise<TeamMemberRecord> {
	return prisma.teamMember.update({
		where: {
			id: input.memberId,
		},
		data: {
			name: input.name,
			email: input.email,
		},
		select: {
			id: true,
			name: true,
			email: true,
		},
	});
}

export async function deleteTeamMember(input: {
	teamId: string;
	memberId: string;
}): Promise<void> {
	await prisma.teamMember.delete({
		where: {
			id: input.memberId,
		},
	});
}

export async function updateTeamName(
	input: UpdateTeamNameInput,
): Promise<TeamIdentity> {
	return prisma.team.update({
		where: {
			id: input.teamId,
		},
		data: {
			name: input.name,
			nameKey: input.normalizedName,
		},
		select: {
			id: true,
			name: true,
		},
	});
}

export async function deleteTeam(teamId: string): Promise<void> {
	await prisma.team.delete({
		where: {
			id: teamId,
		},
	});
}

export async function findTeamByNormalizedName(
	customerId: string,
	normalizedName: string,
): Promise<{ id: string } | null> {
	return prisma.team.findFirst({
		where: {
			userId: customerId,
			nameKey: normalizedName,
		},
		select: {
			id: true,
		},
	});
}

export async function countTeamsByCustomer(
	customerId: string,
): Promise<number> {
	return prisma.team.count({
		where: {
			userId: customerId,
		},
	});
}

export async function listTeamSummaries(
	customerId: string,
): Promise<TeamSummaryRecord[]> {
	const teams = await prisma.team.findMany({
		where: {
			userId: customerId,
		},
		select: {
			id: true,
			name: true,
			_count: {
				select: {
					members: true,
				},
			},
		},
		orderBy: [{ name: "asc" }, { id: "asc" }],
	});

	return teams.map((team) => ({
		id: team.id,
		name: team.name,
		memberCount: team._count.members,
	}));
}

export async function findTeamDetail(input: {
	customerId: string;
	teamId: string;
}): Promise<TeamDetailRecord | null> {
	return prisma.team.findFirst({
		where: {
			id: input.teamId,
			userId: input.customerId,
		},
		select: {
			id: true,
			name: true,
			members: {
				select: {
					id: true,
					name: true,
					email: true,
				},
				orderBy: [{ name: "asc" }, { email: "asc" }, { id: "asc" }],
			},
		},
	});
}
