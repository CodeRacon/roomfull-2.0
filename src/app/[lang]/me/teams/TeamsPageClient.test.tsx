import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getDictionary } from "@/shared/i18n";
import { TeamsPageClient } from "./TeamsPageClient";

const { createCustomerTeamMock, endSessionMock, listCustomerTeamsMock } =
	vi.hoisted(() => ({
		createCustomerTeamMock: vi.fn(),
		endSessionMock: vi.fn(),
		listCustomerTeamsMock: vi.fn(),
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
		createCustomerTeam: createCustomerTeamMock,
		listCustomerTeams: listCustomerTeamsMock,
	};
});

vi.mock("@/features/auth/require-auth", () => ({
	RequireAuth: ({ children }: { children: React.ReactNode }) => children,
}));

const copy = (await getDictionary("de")).myTeams;

describe("TeamsPageClient", () => {
	beforeEach(() => {
		createCustomerTeamMock.mockReset();
		listCustomerTeamsMock.mockReset();
		listCustomerTeamsMock.mockResolvedValue([
			{ id: "team-2", name: "zeta", memberCount: 1 },
			{ id: "team-1", name: "Alpha", memberCount: 3 },
		]);
	});

	it("loads and sorts teams alphabetically", async () => {
		render(<TeamsPageClient copy={copy} locale="de" />);

		expect(await screen.findByText("Alpha")).toBeTruthy();

		const headings = screen.getAllByRole("heading", { level: 3 });

		expect(headings.map((heading) => heading.textContent)).toEqual([
			"Alpha",
			"zeta",
		]);
	});

	it("adds newly created team to list", async () => {
		createCustomerTeamMock.mockResolvedValue({
			id: "team-3",
			name: "Beta Crew",
			memberCount: 0,
		});

		render(<TeamsPageClient copy={copy} locale="de" />);

		await screen.findByText("Alpha");

		fireEvent.change(screen.getByLabelText(copy.form.nameLabel), {
			target: { value: "Beta Crew" },
		});
		fireEvent.click(screen.getByRole("button", { name: copy.form.submit }));

		await screen.findByText(copy.form.success);

		expect(await screen.findByText("Beta Crew")).toBeTruthy();
		await waitFor(() =>
			expect(createCustomerTeamMock).toHaveBeenCalledWith({
				name: "Beta Crew",
			}),
		);
	});
});
