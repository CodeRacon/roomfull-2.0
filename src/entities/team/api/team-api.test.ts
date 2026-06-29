import { describe, expect, it, vi } from "vitest";
import {
	addCustomerTeamMember,
	createCustomerTeam,
	deleteCustomerTeam,
	deleteCustomerTeamMember,
	getCustomerTeamDetail,
	listCustomerTeams,
	renameCustomerTeam,
	updateCustomerTeamMember,
} from "@/entities/team";

const mocks = vi.hoisted(() => ({
	apiDeleteAuthenticated: vi.fn(),
	apiGetAuthenticated: vi.fn(),
	apiPostAuthenticated: vi.fn(),
	apiPutAuthenticated: vi.fn(),
}));

vi.mock("@/shared/api", () => ({
	apiDeleteAuthenticated: mocks.apiDeleteAuthenticated,
	apiGetAuthenticated: mocks.apiGetAuthenticated,
	apiPostAuthenticated: mocks.apiPostAuthenticated,
	apiPutAuthenticated: mocks.apiPutAuthenticated,
}));

describe("Customer Team API", () => {
	it("loads Team summaries and Team detail", async () => {
		const teams = [{ id: "team-1", name: "Workshop Crew", memberCount: 2 }];
		const team = {
			id: "team-1",
			name: "Workshop Crew",
			members: [{ id: "member-1", name: "Ada", email: "ada@example.com" }],
		};
		mocks.apiGetAuthenticated
			.mockResolvedValueOnce({ teams })
			.mockResolvedValueOnce({ team });

		await expect(listCustomerTeams()).resolves.toBe(teams);
		await expect(getCustomerTeamDetail("team-1")).resolves.toBe(team);
		expect(mocks.apiGetAuthenticated).toHaveBeenNthCalledWith(1, "/me/teams", {
			cache: "no-store",
		});
		expect(mocks.apiGetAuthenticated).toHaveBeenNthCalledWith(
			2,
			"/me/teams/team-1",
			{ cache: "no-store" },
		);
	});

	it("creates, renames, and deletes Teams", async () => {
		const team = { id: "team-1", name: "Workshop Crew", memberCount: 0 };
		mocks.apiPostAuthenticated.mockResolvedValueOnce({ team });
		mocks.apiPutAuthenticated.mockResolvedValueOnce({ team });
		mocks.apiDeleteAuthenticated.mockResolvedValueOnce(undefined);

		await expect(createCustomerTeam({ name: "Workshop Crew" })).resolves.toBe(
			team,
		);
		await expect(
			renameCustomerTeam("team-1", { name: "Product Circle" }),
		).resolves.toBe(team);
		await expect(deleteCustomerTeam("team-1")).resolves.toBeUndefined();

		expect(mocks.apiPostAuthenticated).toHaveBeenCalledWith("/me/teams", {
			name: "Workshop Crew",
		});
		expect(mocks.apiPutAuthenticated).toHaveBeenCalledWith("/me/teams/team-1", {
			name: "Product Circle",
		});
		expect(mocks.apiDeleteAuthenticated).toHaveBeenCalledWith(
			"/me/teams/team-1",
		);
	});

	it("adds, updates, and deletes Team Members", async () => {
		const member = { id: "member-1", name: "Ada", email: "ada@example.com" };
		mocks.apiPostAuthenticated.mockResolvedValueOnce({ member });
		mocks.apiPutAuthenticated.mockResolvedValueOnce({ member });
		mocks.apiDeleteAuthenticated.mockResolvedValueOnce(undefined);

		await expect(
			addCustomerTeamMember({
				teamId: "team-1",
				name: "Ada",
				email: "ada@example.com",
			}),
		).resolves.toBe(member);
		await expect(
			updateCustomerTeamMember({
				teamId: "team-1",
				memberId: "member-1",
				name: "Ada Byron",
				email: "ada.byron@example.com",
			}),
		).resolves.toBe(member);
		await expect(
			deleteCustomerTeamMember({ teamId: "team-1", memberId: "member-1" }),
		).resolves.toBeUndefined();

		expect(mocks.apiPostAuthenticated).toHaveBeenCalledWith(
			"/me/teams/team-1/members",
			{ name: "Ada", email: "ada@example.com" },
		);
		expect(mocks.apiPutAuthenticated).toHaveBeenCalledWith(
			"/me/teams/team-1/members/member-1",
			{ name: "Ada Byron", email: "ada.byron@example.com" },
		);
		expect(mocks.apiDeleteAuthenticated).toHaveBeenCalledWith(
			"/me/teams/team-1/members/member-1",
		);
	});
});
