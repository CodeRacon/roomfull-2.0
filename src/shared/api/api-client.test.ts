import { afterEach, describe, expect, it, vi } from "vitest";
import { apiDeleteAuthenticated } from ".";

describe("authenticated API client", () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("accepts 204 No Content delete responses", async () => {
		const fetchMock = vi
			.fn()
			.mockResolvedValue(new Response(null, { status: 204 }));
		vi.stubGlobal("fetch", fetchMock);

		const result = await apiDeleteAuthenticated<void>("/me/teams/team-1");

		expect(result).toBeUndefined();
		expect(fetchMock).toHaveBeenCalledWith(
			"http://localhost:4000/api/me/teams/team-1",
			expect.objectContaining({
				credentials: "include",
				method: "DELETE",
			}),
		);
	});
});
