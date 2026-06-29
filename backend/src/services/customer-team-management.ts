import {
	countTeamsByCustomer,
	createTeam,
	createTeamMember,
	deleteTeam,
	deleteTeamMember,
	findTeamByNormalizedName,
	findTeamDetail,
	listTeamSummaries,
	updateTeamMember,
	updateTeamName,
} from "../db/team.repository.js";
import { AppError } from "../lib/app-error.js";

export type TeamSummary = {
	id: string;
	name: string;
	memberCount: number;
};

export type TeamMemberSummary = {
	id: string;
	name: string;
	email: string;
};

export type TeamDetail = {
	id: string;
	name: string;
	members: TeamMemberSummary[];
};

function isValidMemberEmail(email: string): boolean {
	const atIndex = email.indexOf("@");
	return (
		email.length > 0 &&
		email.length <= 254 &&
		atIndex > 0 &&
		email.indexOf(".", atIndex + 2) > atIndex + 1
	);
}

export type CustomerTeamManagementSource = {
	createTeamMember(input: {
		teamId: string;
		name: string;
		email: string;
	}): Promise<TeamMemberSummary>;
	updateTeamMember(input: {
		teamId: string;
		memberId: string;
		name: string;
		email: string;
	}): Promise<TeamMemberSummary>;
	createTeam(input: {
		customerId: string;
		name: string;
		normalizedName: string;
	}): Promise<{
		id: string;
		name: string;
	}>;
	updateTeamName(input: {
		teamId: string;
		name: string;
		normalizedName: string;
	}): Promise<{
		id: string;
		name: string;
	}>;
	deleteTeam(teamId: string): Promise<void>;
	deleteTeamMember(input: { teamId: string; memberId: string }): Promise<void>;
	findTeamDetail(input: {
		customerId: string;
		teamId: string;
	}): Promise<TeamDetail | null>;
	findTeamByNormalizedName(
		customerId: string,
		normalizedName: string,
	): Promise<{ id: string } | null>;
	countTeamsByCustomer(customerId: string): Promise<number>;
	listTeamSummaries(customerId: string): Promise<TeamSummary[]>;
};

export function createCustomerTeamManagement(input: {
	source: CustomerTeamManagementSource;
}) {
	const { source } = input;

	return {
		async create(createInput: {
			customerId: string;
			name: string;
		}): Promise<TeamSummary> {
			const name = createInput.name.trim();
			if (name.length === 0) {
				throw new AppError(400, "Teamname darf nicht leer sein");
			}
			if (name.length > 80) {
				throw new AppError(
					400,
					"Teamname darf hoechstens 80 Zeichen lang sein",
				);
			}

			const normalizedName = name.toLowerCase();
			const existingTeam = await source.findTeamByNormalizedName(
				createInput.customerId,
				normalizedName,
			);
			if (existingTeam !== null) {
				throw new AppError(409, "Teamname existiert bereits");
			}

			const teamCount = await source.countTeamsByCustomer(
				createInput.customerId,
			);
			if (teamCount >= 20) {
				throw new AppError(409, "Maximale Anzahl Teams erreicht");
			}

			const team = await source.createTeam({
				customerId: createInput.customerId,
				name,
				normalizedName,
			});

			return {
				id: team.id,
				name: team.name,
				memberCount: 0,
			};
		},

		async list(listInput: { customerId: string }): Promise<TeamSummary[]> {
			return source.listTeamSummaries(listInput.customerId);
		},

		async getDetail(getDetailInput: {
			customerId: string;
			teamId: string;
		}): Promise<TeamDetail> {
			const team = await source.findTeamDetail({
				customerId: getDetailInput.customerId,
				teamId: getDetailInput.teamId,
			});

			if (!team) {
				throw new AppError(404, "Team wurde nicht gefunden");
			}

			return team;
		},

		async addMember(addMemberInput: {
			customerId: string;
			teamId: string;
			name: string;
			email: string;
		}): Promise<TeamMemberSummary> {
			const team = await source.findTeamDetail({
				customerId: addMemberInput.customerId,
				teamId: addMemberInput.teamId,
			});
			if (!team) {
				throw new AppError(404, "Team wurde nicht gefunden");
			}

			const name = addMemberInput.name.trim();
			const email = addMemberInput.email.trim().toLowerCase();
			if (name.length === 0) {
				throw new AppError(400, "Member-Name darf nicht leer sein");
			}
			if (name.length > 100) {
				throw new AppError(
					400,
					"Member-Name darf hoechstens 100 Zeichen lang sein",
				);
			}
			if (!isValidMemberEmail(email)) {
				throw new AppError(400, "Member-E-Mail ist ungueltig");
			}
			if (team.members.some((member) => member.email === email)) {
				throw new AppError(409, "Member-E-Mail existiert bereits");
			}
			if (team.members.length >= 50) {
				throw new AppError(409, "Maximale Anzahl Team Members erreicht");
			}

			return source.createTeamMember({
				teamId: team.id,
				name,
				email,
			});
		},

		async updateMember(updateMemberInput: {
			customerId: string;
			teamId: string;
			memberId: string;
			name: string;
			email: string;
		}): Promise<TeamMemberSummary> {
			const team = await source.findTeamDetail({
				customerId: updateMemberInput.customerId,
				teamId: updateMemberInput.teamId,
			});
			if (!team) {
				throw new AppError(404, "Team wurde nicht gefunden");
			}

			const currentMember = team.members.find(
				(member) => member.id === updateMemberInput.memberId,
			);
			if (!currentMember) {
				throw new AppError(404, "Team Member wurde nicht gefunden");
			}

			const name = updateMemberInput.name.trim();
			const email = updateMemberInput.email.trim().toLowerCase();
			if (name.length === 0) {
				throw new AppError(400, "Member-Name darf nicht leer sein");
			}
			if (name.length > 100) {
				throw new AppError(
					400,
					"Member-Name darf hoechstens 100 Zeichen lang sein",
				);
			}
			if (!isValidMemberEmail(email)) {
				throw new AppError(400, "Member-E-Mail ist ungueltig");
			}
			if (
				team.members.some(
					(member) => member.email === email && member.id !== currentMember.id,
				)
			) {
				throw new AppError(409, "Member-E-Mail existiert bereits");
			}

			return source.updateTeamMember({
				teamId: team.id,
				memberId: currentMember.id,
				name,
				email,
			});
		},

		async deleteMember(deleteMemberInput: {
			customerId: string;
			teamId: string;
			memberId: string;
		}): Promise<void> {
			const team = await source.findTeamDetail({
				customerId: deleteMemberInput.customerId,
				teamId: deleteMemberInput.teamId,
			});
			if (!team) {
				throw new AppError(404, "Team wurde nicht gefunden");
			}

			const currentMember = team.members.find(
				(member) => member.id === deleteMemberInput.memberId,
			);
			if (!currentMember) {
				throw new AppError(404, "Team Member wurde nicht gefunden");
			}

			await source.deleteTeamMember({
				teamId: team.id,
				memberId: currentMember.id,
			});
		},

		async rename(renameInput: {
			customerId: string;
			teamId: string;
			name: string;
		}): Promise<TeamSummary> {
			const team = await source.findTeamDetail({
				customerId: renameInput.customerId,
				teamId: renameInput.teamId,
			});
			if (!team) {
				throw new AppError(404, "Team wurde nicht gefunden");
			}

			const name = renameInput.name.trim();
			if (name.length === 0) {
				throw new AppError(400, "Teamname darf nicht leer sein");
			}
			if (name.length > 80) {
				throw new AppError(
					400,
					"Teamname darf hoechstens 80 Zeichen lang sein",
				);
			}

			const normalizedName = name.toLowerCase();
			const existingTeam = await source.findTeamByNormalizedName(
				renameInput.customerId,
				normalizedName,
			);
			if (existingTeam !== null && existingTeam.id !== team.id) {
				throw new AppError(409, "Teamname existiert bereits");
			}

			const renamedTeam = await source.updateTeamName({
				teamId: team.id,
				name,
				normalizedName,
			});

			return {
				id: renamedTeam.id,
				name: renamedTeam.name,
				memberCount: team.members.length,
			};
		},

		async delete(deleteInput: {
			customerId: string;
			teamId: string;
		}): Promise<void> {
			const team = await source.findTeamDetail({
				customerId: deleteInput.customerId,
				teamId: deleteInput.teamId,
			});
			if (!team) {
				throw new AppError(404, "Team wurde nicht gefunden");
			}

			await source.deleteTeam(team.id);
		},
	};
}

export type CustomerTeamManagement = ReturnType<
	typeof createCustomerTeamManagement
>;

const prismaCustomerTeamManagementSource: CustomerTeamManagementSource = {
	countTeamsByCustomer,
	createTeamMember,
	createTeam,
	deleteTeam,
	deleteTeamMember,
	findTeamDetail,
	findTeamByNormalizedName,
	listTeamSummaries,
	updateTeamMember,
	updateTeamName,
};

export const customerTeamManagement = createCustomerTeamManagement({
	source: prismaCustomerTeamManagementSource,
});
