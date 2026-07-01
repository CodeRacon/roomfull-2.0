import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getDictionary } from "@/shared/i18n";
import { DemoLoginButton } from "./DemoLoginButton";

const mocks = vi.hoisted(() => ({
	demoLogin: vi.fn(),
	replace: vi.fn(),
	startSession: vi.fn(),
}));

vi.mock("next/navigation", () => ({
	useRouter: () => ({
		replace: mocks.replace,
	}),
}));

vi.mock("@/entities/session", () => ({
	useSession: () => ({
		startSession: mocks.startSession,
	}),
}));

vi.mock("../api", () => ({
	demoLogin: mocks.demoLogin,
}));

const copy = (await getDictionary("en")).auth.demoLogin;

describe("DemoLoginButton", () => {
	beforeEach(() => {
		mocks.demoLogin.mockReset();
		mocks.replace.mockReset();
		mocks.startSession.mockReset();
	});

	it("starts a Demo Customer session and redirects to My Bookings", async () => {
		const authResponse = {
			user: {
				id: "user-1",
				name: "Demo Customer",
				email: "demo@example.test",
				role: "CUSTOMER",
				isDemo: true,
				demoExpiresAt: "2099-01-01T00:00:00.000Z",
				createdAt: "2026-07-01T12:00:00.000Z",
			},
		};
		let resolveDemoLogin!: (value: typeof authResponse) => void;
		mocks.demoLogin.mockReturnValueOnce(
			new Promise((resolve) => {
				resolveDemoLogin = resolve;
			}),
		);

		render(<DemoLoginButton copy={copy} locale="en" />);

		fireEvent.click(screen.getByRole("button", { name: copy.submit }));

		const pendingButton = screen.getByRole("button", {
			name: copy.submitPending,
		});
		expect((pendingButton as HTMLButtonElement).disabled).toBe(true);
		resolveDemoLogin(authResponse);
		await waitFor(() =>
			expect(mocks.startSession).toHaveBeenCalledWith(authResponse),
		);
		expect(mocks.replace).toHaveBeenCalledWith("/en/me/bookings");
	});

	it("shows a fallback error when Demo Login fails unexpectedly", async () => {
		mocks.demoLogin.mockRejectedValueOnce(new Error("Network failed"));

		render(<DemoLoginButton copy={copy} locale="en" />);
		fireEvent.click(screen.getByRole("button", { name: copy.submit }));

		expect(await screen.findByText(copy.errorFallback)).toBeTruthy();
		expect(mocks.startSession).not.toHaveBeenCalled();
		expect(mocks.replace).not.toHaveBeenCalled();
	});
});
