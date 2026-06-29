import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { NextFunction, Request, Response } from "express";
import { createCustomerTeamsController } from "../src/controllers/customer-teams.controller.js";
import type {
	TeamDetail,
	TeamMemberSummary,
	TeamSummary,
} from "../src/services/customer-team-management.js";

function createJsonResponse() {
	let statusCode = 200;
	let body: unknown = null;

	const response = {
		status(code: number) {
			statusCode = code;
			return this;
		},
		json(payload: unknown) {
			body = payload;
			return this;
		},
		end() {
			return this;
		},
	} as Response;

	return {
		response,
		get statusCode() {
			return statusCode;
		},
		get body() {
			return body;
		},
	};
}

describe("Customer Teams Controller", () => {
	it("creates a Team for the authenticated Customer", async () => {
		const createdTeam: TeamSummary = {
			id: "team-1",
			name: "Workshop Crew",
			memberCount: 0,
		};
		const calls: unknown[] = [];
		const result = createJsonResponse();
		const next: NextFunction = (error?: unknown) => {
			if (error) {
				throw error;
			}
		};
		const controller = createCustomerTeamsController({
			management: {
				create: async (input) => {
					calls.push(input);
					return createdTeam;
				},
				list: async () => [],
				getDetail: async () => {
					throw new Error("not used");
				},
				addMember: async () => {
					throw new Error("not used");
				},
				updateMember: async () => {
					throw new Error("not used");
				},
				deleteMember: async () => {
					throw new Error("not used");
				},
				rename: async () => {
					throw new Error("not used");
				},
				delete: async () => {
					throw new Error("not used");
				},
			},
		});

		await controller.create(
			{
				auth: { userId: "customer-1", role: "CUSTOMER" },
				body: { name: "  Workshop Crew  " },
			} as Request,
			result.response,
			next,
		);

		assert.deepEqual(calls, [
			{ customerId: "customer-1", name: "  Workshop Crew  " },
		]);
		assert.equal(result.statusCode, 201);
		assert.deepEqual(result.body, { team: createdTeam });
	});

	it("lists Teams for the authenticated Customer", async () => {
		const teams: TeamSummary[] = [
			{
				id: "team-1",
				name: "Workshop Crew",
				memberCount: 2,
			},
		];
		const calls: unknown[] = [];
		const result = createJsonResponse();
		const next: NextFunction = (error?: unknown) => {
			if (error) {
				throw error;
			}
		};
		const controller = createCustomerTeamsController({
			management: {
				create: async () => {
					throw new Error("not used");
				},
				list: async (input) => {
					calls.push(input);
					return teams;
				},
				getDetail: async () => {
					throw new Error("not used");
				},
				addMember: async () => {
					throw new Error("not used");
				},
				updateMember: async () => {
					throw new Error("not used");
				},
				deleteMember: async () => {
					throw new Error("not used");
				},
				rename: async () => {
					throw new Error("not used");
				},
				delete: async () => {
					throw new Error("not used");
				},
			},
		});

		await controller.list(
			{
				auth: { userId: "customer-1", role: "CUSTOMER" },
			} as Request,
			result.response,
			next,
		);

		assert.deepEqual(calls, [{ customerId: "customer-1" }]);
		assert.equal(result.statusCode, 200);
		assert.deepEqual(result.body, { teams });
	});

	it("loads Team detail for the authenticated Customer", async () => {
		const team: TeamDetail = {
			id: "team-1",
			name: "Workshop Crew",
			members: [],
		};
		const calls: unknown[] = [];
		const result = createJsonResponse();
		const next: NextFunction = (error?: unknown) => {
			if (error) {
				throw error;
			}
		};
		const controller = createCustomerTeamsController({
			management: {
				create: async () => {
					throw new Error("not used");
				},
				list: async () => [],
				getDetail: async (input) => {
					calls.push(input);
					return team;
				},
				addMember: async () => {
					throw new Error("not used");
				},
				updateMember: async () => {
					throw new Error("not used");
				},
				deleteMember: async () => {
					throw new Error("not used");
				},
				rename: async () => {
					throw new Error("not used");
				},
				delete: async () => {
					throw new Error("not used");
				},
			},
		});

		await controller.getDetail(
			{
				auth: { userId: "customer-1", role: "CUSTOMER" },
				params: { teamId: "team-1" },
			} as unknown as Request,
			result.response,
			next,
		);

		assert.deepEqual(calls, [{ customerId: "customer-1", teamId: "team-1" }]);
		assert.equal(result.statusCode, 200);
		assert.deepEqual(result.body, { team });
	});

	it("adds a Member to a Team for the authenticated Customer", async () => {
		const member: TeamMemberSummary = {
			id: "member-1",
			name: "Ada Lovelace",
			email: "ada@example.com",
		};
		const calls: unknown[] = [];
		const result = createJsonResponse();
		const next: NextFunction = (error?: unknown) => {
			if (error) {
				throw error;
			}
		};
		const controller = createCustomerTeamsController({
			management: {
				create: async () => {
					throw new Error("not used");
				},
				list: async () => [],
				getDetail: async () => {
					throw new Error("not used");
				},
				addMember: async (input) => {
					calls.push(input);
					return member;
				},
				updateMember: async () => {
					throw new Error("not used");
				},
				deleteMember: async () => {
					throw new Error("not used");
				},
				rename: async () => {
					throw new Error("not used");
				},
				delete: async () => {
					throw new Error("not used");
				},
			},
		});

		await controller.addMember(
			{
				auth: { userId: "customer-1", role: "CUSTOMER" },
				params: { teamId: "team-1" },
				body: {
					name: "  Ada Lovelace  ",
					email: "  ADA@Example.COM  ",
				},
			} as unknown as Request,
			result.response,
			next,
		);

		assert.deepEqual(calls, [
			{
				customerId: "customer-1",
				teamId: "team-1",
				name: "  Ada Lovelace  ",
				email: "  ADA@Example.COM  ",
			},
		]);
		assert.equal(result.statusCode, 201);
		assert.deepEqual(result.body, { member });
	});

	it("renames a Team for the authenticated Customer", async () => {
		const renamedTeam: TeamSummary = {
			id: "team-1",
			name: "Product Circle",
			memberCount: 2,
		};
		const calls: unknown[] = [];
		const result = createJsonResponse();
		const next: NextFunction = (error?: unknown) => {
			if (error) {
				throw error;
			}
		};
		const controller = createCustomerTeamsController({
			management: {
				create: async () => {
					throw new Error("not used");
				},
				list: async () => [],
				getDetail: async () => {
					throw new Error("not used");
				},
				addMember: async () => {
					throw new Error("not used");
				},
				updateMember: async () => {
					throw new Error("not used");
				},
				deleteMember: async () => {
					throw new Error("not used");
				},
				rename: async (input) => {
					calls.push(input);
					return renamedTeam;
				},
				delete: async () => {
					throw new Error("not used");
				},
			},
		});

		await controller.rename(
			{
				auth: { userId: "customer-1", role: "CUSTOMER" },
				params: { teamId: "team-1" },
				body: { name: "  Product Circle  " },
			} as unknown as Request,
			result.response,
			next,
		);

		assert.deepEqual(calls, [
			{
				customerId: "customer-1",
				teamId: "team-1",
				name: "  Product Circle  ",
			},
		]);
		assert.equal(result.statusCode, 200);
		assert.deepEqual(result.body, { team: renamedTeam });
	});

	it("deletes a Team for the authenticated Customer", async () => {
		const calls: unknown[] = [];
		const result = createJsonResponse();
		const next: NextFunction = (error?: unknown) => {
			if (error) {
				throw error;
			}
		};
		const controller = createCustomerTeamsController({
			management: {
				create: async () => {
					throw new Error("not used");
				},
				list: async () => [],
				getDetail: async () => {
					throw new Error("not used");
				},
				addMember: async () => {
					throw new Error("not used");
				},
				updateMember: async () => {
					throw new Error("not used");
				},
				deleteMember: async () => {
					throw new Error("not used");
				},
				rename: async () => {
					throw new Error("not used");
				},
				delete: async (input) => {
					calls.push(input);
				},
			},
		});

		await controller.delete(
			{
				auth: { userId: "customer-1", role: "CUSTOMER" },
				params: { teamId: "team-1" },
			} as unknown as Request,
			result.response,
			next,
		);

		assert.deepEqual(calls, [{ customerId: "customer-1", teamId: "team-1" }]);
		assert.equal(result.statusCode, 204);
		assert.equal(result.body, null);
	});

	it("updates a Member for the authenticated Customer", async () => {
		const member: TeamMemberSummary = {
			id: "member-1",
			name: "Grace Hopper",
			email: "grace@example.com",
		};
		const calls: unknown[] = [];
		const result = createJsonResponse();
		const next: NextFunction = (error?: unknown) => {
			if (error) {
				throw error;
			}
		};
		const controller = createCustomerTeamsController({
			management: {
				create: async () => {
					throw new Error("not used");
				},
				list: async () => [],
				getDetail: async () => {
					throw new Error("not used");
				},
				addMember: async () => {
					throw new Error("not used");
				},
				updateMember: async (input) => {
					calls.push(input);
					return member;
				},
				deleteMember: async () => {
					throw new Error("not used");
				},
				rename: async () => {
					throw new Error("not used");
				},
				delete: async () => {
					throw new Error("not used");
				},
			},
		});

		await controller.updateMember(
			{
				auth: { userId: "customer-1", role: "CUSTOMER" },
				params: { teamId: "team-1", memberId: "member-1" },
				body: {
					name: "  Grace Hopper  ",
					email: "  GRACE@Example.COM  ",
				},
			} as unknown as Request,
			result.response,
			next,
		);

		assert.deepEqual(calls, [
			{
				customerId: "customer-1",
				teamId: "team-1",
				memberId: "member-1",
				name: "  Grace Hopper  ",
				email: "  GRACE@Example.COM  ",
			},
		]);
		assert.equal(result.statusCode, 200);
		assert.deepEqual(result.body, { member });
	});

	it("deletes a Member for the authenticated Customer", async () => {
		const calls: unknown[] = [];
		const result = createJsonResponse();
		const next: NextFunction = (error?: unknown) => {
			if (error) {
				throw error;
			}
		};
		const controller = createCustomerTeamsController({
			management: {
				create: async () => {
					throw new Error("not used");
				},
				list: async () => [],
				getDetail: async () => {
					throw new Error("not used");
				},
				addMember: async () => {
					throw new Error("not used");
				},
				updateMember: async () => {
					throw new Error("not used");
				},
				deleteMember: async (input) => {
					calls.push(input);
				},
				rename: async () => {
					throw new Error("not used");
				},
				delete: async () => {
					throw new Error("not used");
				},
			},
		});

		await controller.deleteMember(
			{
				auth: { userId: "customer-1", role: "CUSTOMER" },
				params: { teamId: "team-1", memberId: "member-1" },
			} as unknown as Request,
			result.response,
			next,
		);

		assert.deepEqual(calls, [
			{ customerId: "customer-1", teamId: "team-1", memberId: "member-1" },
		]);
		assert.equal(result.statusCode, 204);
		assert.equal(result.body, null);
	});
});
