import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ContactRequestType } from "@prisma/client";
import type { Request, Response } from "express";
import { AUTH_COOKIE_NAME } from "../src/lib/auth-cookie.js";
import { signAccessToken } from "../src/lib/jwt.js";
import { requireAuth, requireRole } from "../src/middleware/auth.middleware.js";
import {
	createContactRequestForCustomer,
	getUnreadContactRequestCountForAdmin,
	listContactRequestsForAdmin,
	markContactRequestAsReadForAdmin,
} from "../src/services/contact-request.service.js";

function getStatusCode(error: unknown): number | undefined {
	if (
		typeof error === "object" &&
		error !== null &&
		"statusCode" in error &&
		typeof error.statusCode === "number"
	) {
		return error.statusCode;
	}

	return undefined;
}

function createAuthCookie(userId: string, role: "ADMIN" | "CUSTOMER"): string {
	const token = signAccessToken({ userId, role });
	return `${AUTH_COOKIE_NAME}=${encodeURIComponent(token)}`;
}

function runAuthMiddleware(cookie?: string): unknown {
	let nextError: unknown;
	const req = {
		header: (name: string) =>
			name.toLowerCase() === "cookie" ? cookie : undefined,
	} as Request;

	requireAuth(req, {} as Response, (error?: unknown) => {
		nextError = error;
	});

	return nextError;
}

function runCustomerRoleMiddleware(req: Request): unknown {
	let nextError: unknown;
	requireRole("CUSTOMER")(req, {} as Response, (error?: unknown) => {
		nextError = error;
	});

	return nextError;
}

function runAdminRoleMiddleware(req: Request): unknown {
	let nextError: unknown;
	requireRole("ADMIN")(req, {} as Response, (error?: unknown) => {
		nextError = error;
	});

	return nextError;
}

describe("Customer Contact Request", () => {
	it("stores a customer contact request as unread", async () => {
		const persisted = await createContactRequestForCustomer(
			{
				userId: "customer-1",
				type: " QUESTION ",
				message: "  Ich habe eine Frage zu meiner Buchung.  ",
			},
			{
				createContactRequest: async (input) => ({
					id: "contact-request-1",
					userId: input.userId,
					type: input.type,
					message: input.message,
					isRead: input.isRead,
					createdAt: new Date("2026-06-20T10:00:00.000Z"),
				}),
			},
		);

		assert.deepEqual(persisted, {
			id: "contact-request-1",
			userId: "customer-1",
			type: ContactRequestType.QUESTION,
			message: "Ich habe eine Frage zu meiner Buchung.",
			isRead: false,
			createdAt: new Date("2026-06-20T10:00:00.000Z"),
		});
	});

	it("rejects unknown contact request types", async () => {
		await assert.rejects(
			() =>
				createContactRequestForCustomer(
					{
						userId: "customer-1",
						type: "OTHER",
						message: "Bitte melden.",
					},
					{
						createContactRequest: async () => {
							throw new Error("should not persist invalid type");
						},
					},
				),
			(error: unknown) => getStatusCode(error) === 400,
		);
	});

	it("rejects empty contact messages", async () => {
		await assert.rejects(
			() =>
				createContactRequestForCustomer(
					{
						userId: "customer-1",
						type: "FEEDBACK",
						message: "   ",
					},
					{
						createContactRequest: async () => {
							throw new Error("should not persist empty message");
						},
					},
				),
			(error: unknown) => getStatusCode(error) === 400,
		);
	});

	it("requires a signed-in customer at the route boundary", () => {
		assert.equal(getStatusCode(runAuthMiddleware()), 401);

		const adminReq = {
			header: (name: string) =>
				name.toLowerCase() === "cookie"
					? createAuthCookie("admin-1", "ADMIN")
					: undefined,
		} as Request;

		assert.equal(runAuthMiddleware(adminReq.header("cookie")), undefined);
		requireAuth(adminReq, {} as Response, () => undefined);

		assert.equal(getStatusCode(runCustomerRoleMiddleware(adminReq)), 403);
	});
});

describe("Admin Contact Inbox", () => {
	it("requires admin role at the route boundary", () => {
		const customerReq = {
			header: (name: string) =>
				name.toLowerCase() === "cookie"
					? createAuthCookie("customer-1", "CUSTOMER")
					: undefined,
		} as Request;

		requireAuth(customerReq, {} as Response, () => undefined);

		assert.equal(getStatusCode(runAdminRoleMiddleware(customerReq)), 403);
	});

	it("counts global unread contact requests for admin", async () => {
		const unreadCount = await getUnreadContactRequestCountForAdmin({
			countUnreadContactRequests: async () => 3,
		});

		assert.equal(unreadCount, 3);
	});

	it("lists contact requests with type, read state and received-time sorting", async () => {
		const contactRequests = await listContactRequestsForAdmin(
			{
				readState: "unread",
				sort: "received_asc",
				type: " feedback ",
			},
			{
				createContactRequest: async () => {
					throw new Error("not used");
				},
				listContactRequests: async (input) => {
					assert.deepEqual(input, {
						isRead: false,
						orderBy: { createdAt: "asc" },
						type: ContactRequestType.FEEDBACK,
					});

					return [
						{
							id: "contact-request-1",
							userId: "customer-1",
							type: ContactRequestType.FEEDBACK,
							message: "Die neue Seite ist hilfreich.",
							isRead: false,
							createdAt: new Date("2026-06-20T10:00:00.000Z"),
							user: {
								id: "customer-1",
								name: "Customer One",
								email: "customer@example.com",
							},
						},
					];
				},
				markContactRequestAsRead: async () => {
					throw new Error("not used");
				},
			},
		);

		assert.equal(contactRequests.length, 1);
		assert.equal(contactRequests[0]?.isRead, false);
		assert.equal(contactRequests[0]?.user.email, "customer@example.com");
	});

	it("rejects invalid admin inbox filters", async () => {
		await assert.rejects(
			() =>
				listContactRequestsForAdmin(
					{ readState: "archived" },
					{
						createContactRequest: async () => {
							throw new Error("not used");
						},
						listContactRequests: async () => {
							throw new Error("should not list invalid filters");
						},
						markContactRequestAsRead: async () => {
							throw new Error("not used");
						},
					},
				),
			(error: unknown) => getStatusCode(error) === 400,
		);
	});

	it("marks contact requests as read for admin", async () => {
		const contactRequest = await markContactRequestAsReadForAdmin(
			{ contactRequestId: " contact-request-1 " },
			{
				createContactRequest: async () => {
					throw new Error("not used");
				},
				listContactRequests: async () => {
					throw new Error("not used");
				},
				markContactRequestAsRead: async (input) => {
					assert.deepEqual(input, { contactRequestId: "contact-request-1" });

					return {
						id: "contact-request-1",
						userId: "customer-1",
						type: ContactRequestType.QUESTION,
						message: "Ich habe eine Frage.",
						isRead: true,
						createdAt: new Date("2026-06-20T10:00:00.000Z"),
						user: {
							id: "customer-1",
							name: "Customer One",
							email: "customer@example.com",
						},
					};
				},
			},
		);

		assert.equal(contactRequest.isRead, true);
	});
});
