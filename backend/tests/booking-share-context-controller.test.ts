import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { UnitTypeName } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import { createGetBookingShareContextController } from "../src/controllers/bookings.controller.js";
import { AppError } from "../src/lib/app-error.js";
import type { BookingShareContext } from "../src/services/booking-share-context.js";

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

describe("Booking Share Context Controller", () => {
	it("loads share context for the authenticated Customer", async () => {
		const shareContext: BookingShareContext = {
			booking: {
				id: "booking-1",
				startTime: new Date("2099-01-10T11:00:00.000Z"),
				endTime: new Date("2099-01-10T13:00:00.000Z"),
			},
			unit: {
				id: "unit-1",
				name: "Focus Booth 1",
				capacity: 4,
				unitType: { name: UnitTypeName.BOOTH },
			},
		};
		const calls: unknown[] = [];
		const result = createJsonResponse();
		const next: NextFunction = (error?: unknown) => {
			if (error) {
				throw error;
			}
		};
		const controller = createGetBookingShareContextController({
			service: {
				get: async (input) => {
					calls.push(input);
					return shareContext;
				},
			},
		});

		await controller(
			{
				auth: { userId: "customer-1", role: "CUSTOMER" },
				params: { bookingId: " booking-1 " },
			} as unknown as Request,
			result.response,
			next,
		);

		assert.deepEqual(calls, [
			{ customerId: "customer-1", bookingId: "booking-1" },
		]);
		assert.equal(result.statusCode, 200);
		assert.deepEqual(result.body, { shareContext });
	});

	it("rejects unauthenticated and invalid route input", async () => {
		const result = createJsonResponse();
		const errors: unknown[] = [];
		const next: NextFunction = (error?: unknown) => {
			if (error) {
				errors.push(error);
			}
		};
		const controller = createGetBookingShareContextController({
			service: {
				get: async () => {
					throw new Error("not used");
				},
			},
		});

		await controller(
			{ params: { bookingId: "booking-1" } } as unknown as Request,
			result.response,
			next,
		);
		await controller(
			{
				auth: { userId: "customer-1", role: "CUSTOMER" },
				params: { bookingId: "   " },
			} as unknown as Request,
			result.response,
			next,
		);

		assert.equal(errors.length, 2);
		assert.equal(errors[0] instanceof AppError && errors[0].statusCode, 401);
		assert.equal(errors[1] instanceof AppError && errors[1].statusCode, 400);
	});
});
