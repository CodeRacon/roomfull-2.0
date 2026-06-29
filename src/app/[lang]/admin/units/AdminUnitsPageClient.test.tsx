import {
	act,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getDictionary } from "@/shared/i18n";
import { AdminUnitsPageClient } from "./AdminUnitsPageClient";

const { endSessionMock, getAdminUnitContextMock, listAdminUnitsMock } =
	vi.hoisted(() => ({
		endSessionMock: vi.fn(),
		getAdminUnitContextMock: vi.fn(),
		listAdminUnitsMock: vi.fn(),
	}));

vi.mock("@/entities/session", () => ({
	useSession: () => ({
		status: "authenticated",
		user: { role: "ADMIN" },
		endSession: endSessionMock,
	}),
}));

vi.mock("@/entities/unit", async (importOriginal) => {
	const original = await importOriginal<typeof import("@/entities/unit")>();

	return {
		...original,
		getAdminUnitContext: getAdminUnitContextMock,
		listAdminUnits: listAdminUnitsMock,
	};
});

vi.mock("@/features/auth/require-auth", () => ({
	RequireAuth: ({ children }: { children: React.ReactNode }) => children,
}));

const copy = (await getDictionary("de")).adminWorkspaces.units;

describe("AdminUnitsPageClient", () => {
	beforeEach(() => {
		getAdminUnitContextMock.mockResolvedValue({ areas: [], unitTypes: [] });
		listAdminUnitsMock.mockReset();
		listAdminUnitsMock.mockResolvedValue([]);
	});

	it("keeps the search input focused while filtered units are loading", async () => {
		let resolveFilteredUnits: ((units: []) => void) | undefined;
		const filteredUnits = new Promise<[]>((resolve) => {
			resolveFilteredUnits = resolve;
		});

		listAdminUnitsMock
			.mockResolvedValueOnce([])
			.mockReturnValueOnce(filteredUnits);

		render(<AdminUnitsPageClient copy={copy} />);

		const searchInput = await screen.findByLabelText(copy.table.name);
		searchInput.focus();
		fireEvent.change(searchInput, { target: { value: "B" } });

		await waitFor(() => expect(listAdminUnitsMock).toHaveBeenCalledTimes(2));

		expect(screen.getByLabelText(copy.table.name)).toBe(searchInput);
		expect(document.activeElement).toBe(searchInput);

		await act(async () => {
			resolveFilteredUnits?.([]);
			await filteredUnits;
		});
	});
});
