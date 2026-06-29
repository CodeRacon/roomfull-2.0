import {
	apiDeleteAuthenticated,
	apiGetAuthenticated,
	apiPostAuthenticated,
	apiPutAuthenticated,
} from "@/shared/api";
import type {
	CreateCustomerTeamInput,
	TeamDetail,
	TeamDetailResponse,
	TeamMember,
	TeamMemberResponse,
	TeamSummary,
	TeamSummaryListResponse,
	TeamSummaryResponse,
	UpsertCustomerTeamMemberInput,
} from "../model";

export async function listCustomerTeams(): Promise<TeamSummary[]> {
	const response = await apiGetAuthenticated<TeamSummaryListResponse>(
		"/me/teams",
		{
			cache: "no-store",
		},
	);

	return response.teams;
}

export async function createCustomerTeam(
	input: CreateCustomerTeamInput,
): Promise<TeamSummary> {
	const response = await apiPostAuthenticated<TeamSummaryResponse>(
		"/me/teams",
		input,
	);

	return response.team;
}

export async function getCustomerTeamDetail(
	teamId: string,
): Promise<TeamDetail> {
	const response = await apiGetAuthenticated<TeamDetailResponse>(
		`/me/teams/${teamId}`,
		{
			cache: "no-store",
		},
	);

	return response.team;
}

export async function renameCustomerTeam(
	teamId: string,
	input: CreateCustomerTeamInput,
): Promise<TeamSummary> {
	const response = await apiPutAuthenticated<TeamSummaryResponse>(
		`/me/teams/${teamId}`,
		input,
	);

	return response.team;
}

export async function deleteCustomerTeam(teamId: string): Promise<void> {
	await apiDeleteAuthenticated<void>(`/me/teams/${teamId}`);
}

export async function addCustomerTeamMember(
	input: UpsertCustomerTeamMemberInput,
): Promise<TeamMember> {
	const response = await apiPostAuthenticated<TeamMemberResponse>(
		`/me/teams/${input.teamId}/members`,
		{
			name: input.name,
			email: input.email,
		},
	);

	return response.member;
}

export async function updateCustomerTeamMember(
	input: UpsertCustomerTeamMemberInput & { memberId: string },
): Promise<TeamMember> {
	const response = await apiPutAuthenticated<TeamMemberResponse>(
		`/me/teams/${input.teamId}/members/${input.memberId}`,
		{
			name: input.name,
			email: input.email,
		},
	);

	return response.member;
}

export async function deleteCustomerTeamMember(input: {
	teamId: string;
	memberId: string;
}): Promise<void> {
	await apiDeleteAuthenticated<void>(
		`/me/teams/${input.teamId}/members/${input.memberId}`,
	);
}
