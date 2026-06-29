export type TeamSummary = {
	id: string;
	name: string;
	memberCount: number;
};

export type TeamMember = {
	id: string;
	name: string;
	email: string;
};

export type TeamDetail = {
	id: string;
	name: string;
	members: TeamMember[];
};

export type CreateCustomerTeamInput = {
	name: string;
};

export type UpsertCustomerTeamMemberInput = {
	teamId: string;
	name: string;
	email: string;
};

export type TeamSummaryResponse = {
	team: TeamSummary;
};

export type TeamSummaryListResponse = {
	teams: TeamSummary[];
};

export type TeamDetailResponse = {
	team: TeamDetail;
};

export type TeamMemberResponse = {
	member: TeamMember;
};
