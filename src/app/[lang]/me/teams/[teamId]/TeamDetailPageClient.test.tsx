import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getDictionary } from "@/shared/i18n";
import { TeamDetailPageClient } from "./TeamDetailPageClient";

const {
	addCustomerTeamMemberMock,
	deleteCustomerTeamMock,
	endSessionMock,
	getCustomerTeamDetailMock,
	renameCustomerTeamMock,
	updateCustomerTeamMemberMock,
} = vi.hoisted(() => ({
	addCustomerTeamMemberMock: vi.fn(),
	deleteCustomerTeamMock: vi.fn(),
	endSessionMock: vi.fn(),
	getCustomerTeamDetailMock: vi.fn(),
	renameCustomerTeamMock: vi.fn(),
	updateCustomerTeamMemberMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
	useRouter: () => ({
		replace: vi.fn(),
	}),
}));

vi.mock("@/entities/session", () => ({
	useSession: () => ({
		status: "authenticated",
		user: { role: "CUSTOMER" },
		endSession: endSessionMock,
	}),
}));

vi.mock("@/entities/team", async (importOriginal) => {
	const original = await importOriginal<typeof import("@/entities/team")>();

	return {
		...original,
		addCustomerTeamMember: addCustomerTeamMemberMock,
		deleteCustomerTeam: deleteCustomerTeamMock,
		getCustomerTeamDetail: getCustomerTeamDetailMock,
		renameCustomerTeam: renameCustomerTeamMock,
		updateCustomerTeamMember: updateCustomerTeamMemberMock,
	};
});

vi.mock("@/features/auth/require-auth", () => ({
	RequireAuth: ({ children }: { children: React.ReactNode }) => children,
}));

const copy = (await getDictionary("de")).myTeams.detail;

describe("TeamDetailPageClient", () => {
	beforeEach(() => {
		getCustomerTeamDetailMock.mockReset();
		renameCustomerTeamMock.mockReset();
		addCustomerTeamMemberMock.mockReset();
		updateCustomerTeamMemberMock.mockReset();
		deleteCustomerTeamMock.mockReset();

		getCustomerTeamDetailMock.mockResolvedValue({
			id: "team-1",
			name: "Workshop Crew",
			members: [
				{ id: "member-2", name: "Zoe", email: "zoe@example.com" },
				{ id: "member-1", name: "Anna", email: "anna@example.com" },
			],
		});
	});

	it("loads team detail and sorts members by name", async () => {
		render(<TeamDetailPageClient copy={copy} locale="de" teamId="team-1" />);

		expect(await screen.findByText("Workshop Crew")).toBeTruthy();

		const headings = screen
			.getAllByRole("heading", { level: 3 })
			.map((heading) => heading.textContent);

		expect(headings).toContain("Anna");
		expect(headings).toContain("Zoe");
		expect(headings.indexOf("Anna")).toBeLessThan(headings.indexOf("Zoe"));
	});

	it("renames team and adds member", async () => {
		renameCustomerTeamMock.mockResolvedValue({
			id: "team-1",
			name: "Core Crew",
			memberCount: 2,
		});
		addCustomerTeamMemberMock.mockResolvedValue({
			id: "member-3",
			name: "Ben",
			email: "ben@example.com",
		});

		render(<TeamDetailPageClient copy={copy} locale="de" teamId="team-1" />);

		await screen.findByText("Workshop Crew");

		fireEvent.change(screen.getByLabelText(copy.settings.rename.nameLabel), {
			target: { value: "Core Crew" },
		});
		fireEvent.click(
			screen.getByRole("button", { name: copy.settings.rename.action }),
		);

		await screen.findByText(copy.settings.rename.success);
		expect(await screen.findByText("Core Crew")).toBeTruthy();

		fireEvent.change(screen.getByLabelText(copy.members.create.nameLabel), {
			target: { value: "Ben" },
		});
		fireEvent.change(screen.getByLabelText(copy.members.create.emailLabel), {
			target: { value: "ben@example.com" },
		});
		fireEvent.click(
			screen.getByRole("button", { name: copy.members.create.action }),
		);

		await screen.findByText(copy.members.create.success);
		await waitFor(() =>
			expect(addCustomerTeamMemberMock).toHaveBeenCalledWith({
				teamId: "team-1",
				name: "Ben",
				email: "ben@example.com",
			}),
		);
		expect(await screen.findByText("Ben")).toBeTruthy();
	});
});
