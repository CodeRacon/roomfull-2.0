import { afterEach, describe, expect, it, vi } from "vitest";
import { apiDeleteAuthenticated, setApiAuthTokenResolver } from ".";

describe("authenticated API client", () => {
	afterEach(() => {
		setApiAuthTokenResolver(() => null);
		vi.unstubAllGlobals();
	});

	it("accepts 204 No Content delete responses", async () => {
		const fetchMock = vi
			.fn()
			.mockResolvedValue(new Response(null, { status: 204 }));
		vi.stubGlobal("fetch", fetchMock);
		setApiAuthTokenResolver(() => "token-1");

		const result = await apiDeleteAuthenticated<void>("/me/teams/team-1");

		expect(result).toBeUndefined();
		expect(fetchMock).toHaveBeenCalledWith(
			"http://localhost:4000/api/me/teams/team-1",
			expect.objectContaining({
				method: "DELETE",
				headers: expect.objectContaining({
					Authorization: "Bearer token-1",
				}),
			}),
		);
	});
});
