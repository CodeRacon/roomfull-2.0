import { describe, expect, it, vi } from "vitest";
import { demoLogin } from "./demo-login";

const mocks = vi.hoisted(() => ({
	apiPost: vi.fn(),
}));

vi.mock("@/shared/api", () => ({
	apiPost: mocks.apiPost,
}));

describe("demoLogin", () => {
	it("creates a Demo Customer session through the auth API", async () => {
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
		mocks.apiPost.mockResolvedValueOnce(authResponse);

		await expect(demoLogin()).resolves.toBe(authResponse);
		expect(mocks.apiPost).toHaveBeenCalledWith("/auth/demo-login", {});
	});
});
