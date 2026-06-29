import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiRequestError } from "@/shared/api";
import { getDictionary } from "@/shared/i18n";
import { BookingSharePageClient } from "./BookingSharePageClient";

const {
	endSessionMock,
	getBookingShareContextMock,
	getCustomerTeamDetailMock,
	listCustomerTeamsMock,
	writeTextMock,
} = vi.hoisted(() => ({
	endSessionMock: vi.fn(),
	getBookingShareContextMock: vi.fn(),
	getCustomerTeamDetailMock: vi.fn(),
	listCustomerTeamsMock: vi.fn(),
	writeTextMock: vi.fn(),
}));

vi.mock("@/entities/session", () => ({
	useSession: () => ({
		status: "authenticated",
		user: { role: "CUSTOMER" },
		endSession: endSessionMock,
	}),
}));

vi.mock("@/entities/booking", async (importOriginal) => {
	const original = await importOriginal<typeof import("@/entities/booking")>();

	return {
		...original,
		getBookingShareContext: getBookingShareContextMock,
	};
});

vi.mock("@/entities/team", async (importOriginal) => {
	const original = await importOriginal<typeof import("@/entities/team")>();

	return {
		...original,
		getCustomerTeamDetail: getCustomerTeamDetailMock,
		listCustomerTeams: listCustomerTeamsMock,
	};
});

vi.mock("@/features/auth/require-auth", () => ({
	RequireAuth: ({ children }: { children: React.ReactNode }) => children,
}));

const copy = (await getDictionary("de")).bookingShare;

describe("BookingSharePageClient", () => {
	beforeEach(() => {
		getBookingShareContextMock.mockReset();
		getCustomerTeamDetailMock.mockReset();
		listCustomerTeamsMock.mockReset();
		writeTextMock.mockReset();

		Object.assign(globalThis.navigator, {
			clipboard: {
				writeText: writeTextMock,
			},
		});

		getBookingShareContextMock.mockResolvedValue({
			booking: {
				id: "booking-1",
				startTime: "2026-07-03T08:00:00.000Z",
				endTime: "2026-07-03T10:00:00.000Z",
			},
			unit: {
				id: "unit-1",
				name: "Team Room Atlas",
				capacity: 1,
				unitType: {
					name: "TEAM_ROOM",
				},
			},
		});
	});

	it("shows empty state when no teams exist", async () => {
		listCustomerTeamsMock.mockResolvedValue([]);

		render(
			<BookingSharePageClient bookingId="booking-1" copy={copy} locale="de" />,
		);

		expect(await screen.findByText(copy.selection.noTeams)).toBeTruthy();
		expect(
			screen.getByRole("link", { name: copy.selection.openTeams }),
		).toBeTruthy();
	});

	it("does not auto-select a single eligible team", async () => {
		listCustomerTeamsMock.mockResolvedValue([
			{ id: "team-1", name: "Alpha", memberCount: 2 },
		]);

		render(
			<BookingSharePageClient bookingId="booking-1" copy={copy} locale="de" />,
		);

		expect(await screen.findByText("Alpha")).toBeTruthy();
		expect(
			screen.queryByText(
				copy.selection.membersTitle.replace("{teamName}", "Alpha"),
			),
		).toBeNull();
		expect(getCustomerTeamDetailMock).not.toHaveBeenCalled();
	});

	it("loads members after selecting a team and enables copy action", async () => {
		listCustomerTeamsMock.mockResolvedValue([
			{ id: "team-1", name: "Alpha", memberCount: 2 },
		]);
		getCustomerTeamDetailMock.mockResolvedValue({
			id: "team-1",
			name: "Alpha",
			members: [
				{ id: "member-1", name: "Anna", email: "anna@example.com" },
				{ id: "member-2", name: "Ben", email: "ben@example.com" },
			],
		});
		writeTextMock.mockResolvedValue(undefined);

		render(
			<BookingSharePageClient bookingId="booking-1" copy={copy} locale="de" />,
		);

		fireEvent.click(
			await screen.findByRole("button", { name: copy.selection.select }),
		);

		expect(await screen.findByText("Anna")).toBeTruthy();

		fireEvent.click(screen.getByRole("button", { name: copy.package.copyBcc }));

		await waitFor(() =>
			expect(writeTextMock).toHaveBeenCalledWith(
				"anna@example.com, ben@example.com",
			),
		);
		expect(await screen.findByText(copy.package.bccSuccess)).toBeTruthy();
	});

	it("preserves personal message and resets recipients on team switch", async () => {
		listCustomerTeamsMock.mockResolvedValue([
			{ id: "team-1", name: "Alpha", memberCount: 2 },
			{ id: "team-2", name: "Beta", memberCount: 1 },
		]);
		getCustomerTeamDetailMock
			.mockResolvedValueOnce({
				id: "team-1",
				name: "Alpha",
				members: [
					{ id: "member-1", name: "Anna", email: "anna@example.com" },
					{ id: "member-2", name: "Ben", email: "ben@example.com" },
				],
			})
			.mockResolvedValueOnce({
				id: "team-2",
				name: "Beta",
				members: [
					{ id: "member-3", name: "Clara", email: "clara@example.com" },
				],
			});
		writeTextMock.mockResolvedValue(undefined);

		render(
			<BookingSharePageClient bookingId="booking-1" copy={copy} locale="de" />,
		);

		const selectButtons = await screen.findAllByRole("button", {
			name: copy.selection.select,
		});
		fireEvent.click(selectButtons[0]);
		await screen.findByText("Anna");

		fireEvent.change(screen.getByLabelText(copy.selection.messageLabel), {
			target: { value: "Bitte Kalender prüfen." },
		});
		fireEvent.click(screen.getByLabelText(/Anna/i));
		fireEvent.click(selectButtons[1]);

		expect(await screen.findByText("Clara")).toBeTruthy();
		expect(screen.queryByText("Anna")).toBeNull();
		expect(
			(
				screen.getByLabelText(
					copy.selection.messageLabel,
				) as HTMLTextAreaElement
			).value,
		).toBe("Bitte Kalender prüfen.");

		fireEvent.click(screen.getByRole("button", { name: copy.package.copyBcc }));

		await waitFor(() =>
			expect(writeTextMock).toHaveBeenLastCalledWith("clara@example.com"),
		);
	});

	it("warns on over-capacity and disables actions when no member stays selected", async () => {
		listCustomerTeamsMock.mockResolvedValue([
			{ id: "team-1", name: "Alpha", memberCount: 2 },
		]);
		getCustomerTeamDetailMock.mockResolvedValue({
			id: "team-1",
			name: "Alpha",
			members: [
				{ id: "member-1", name: "Anna", email: "anna@example.com" },
				{ id: "member-2", name: "Ben", email: "ben@example.com" },
			],
		});

		render(
			<BookingSharePageClient bookingId="booking-1" copy={copy} locale="de" />,
		);

		fireEvent.click(
			await screen.findByRole("button", { name: copy.selection.select }),
		);

		expect(
			await screen.findByText(
				copy.selection.capacityWarning
					.replace("{selected}", "2")
					.replace("{capacity}", "1"),
			),
		).toBeTruthy();

		fireEvent.click(screen.getByLabelText(/Anna/i));
		fireEvent.click(screen.getByLabelText(/Ben/i));

		await waitFor(() =>
			expect(
				(
					screen.getByRole("button", {
						name: copy.package.copyBcc,
					}) as HTMLButtonElement
				).disabled,
			).toBe(true),
		);
	});

	it("shows team load error when selected team detail fails", async () => {
		listCustomerTeamsMock.mockResolvedValue([
			{ id: "team-1", name: "Alpha", memberCount: 2 },
		]);
		getCustomerTeamDetailMock.mockRejectedValue(
			new ApiRequestError("Not found", 404),
		);

		render(
			<BookingSharePageClient bookingId="booking-1" copy={copy} locale="de" />,
		);

		fireEvent.click(
			await screen.findByRole("button", { name: copy.selection.select }),
		);

		expect(await screen.findByText(copy.errors.teamLoad)).toBeTruthy();
	});

	it("shows eligibility conflict from share context load", async () => {
		getBookingShareContextMock.mockRejectedValue(
			new ApiRequestError("Conflict", 409),
		);
		listCustomerTeamsMock.mockResolvedValue([]);

		render(
			<BookingSharePageClient bookingId="booking-1" copy={copy} locale="de" />,
		);

		expect(await screen.findByText(copy.errors.conflict)).toBeTruthy();
	});
});
