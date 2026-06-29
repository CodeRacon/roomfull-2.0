import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { BookingStatus, UnitTypeName } from "@prisma/client";
import { AppError } from "../src/lib/app-error.js";
import {
	type BookingShareContextSource,
	createBookingShareContextService,
} from "../src/services/booking-share-context.js";

const now = new Date("2099-01-10T12:00:00.000Z");

function createHarness() {
	const bookings: Array<
		NonNullable<
			Awaited<ReturnType<BookingShareContextSource["findBookingShareContext"]>>
		>
	> = [];

	const source = {
		findBookingShareContext: async (input) =>
			bookings.find((booking) => booking.id === input.bookingId) ?? null,
	} satisfies BookingShareContextSource;

	return {
		bookings,
		service: createBookingShareContextService({
			source,
			clock: { now: () => now },
		}),
	};
}

function assertAppError(
	action: () => Promise<unknown>,
	statusCode: number,
): Promise<void> {
	return assert.rejects(
		action,
		(error: unknown) =>
			error instanceof AppError && error.statusCode === statusCode,
	);
}

describe("Booking Share Context", () => {
	it("loads share context for an owned active Booking ending now or later", async () => {
		const { bookings, service } = createHarness();
		bookings.push({
			id: "booking-1",
			userId: "customer-1",
			status: BookingStatus.ACTIVE,
			startTime: new Date("2099-01-10T11:00:00.000Z"),
			endTime: now,
			unit: {
				id: "unit-1",
				name: "Focus Booth 1",
				capacity: 4,
				unitType: { name: UnitTypeName.BOOTH },
			},
		});

		const context = await service.get({
			customerId: " customer-1 ",
			bookingId: " booking-1 ",
		});

		assert.deepEqual(context, {
			booking: {
				id: "booking-1",
				startTime: new Date("2099-01-10T11:00:00.000Z"),
				endTime: now,
			},
			unit: {
				id: "unit-1",
				name: "Focus Booth 1",
				capacity: 4,
				unitType: { name: UnitTypeName.BOOTH },
			},
		});
	});

	it("hides missing and foreign Bookings", async () => {
		const { bookings, service } = createHarness();
		bookings.push({
			id: "booking-1",
			userId: "customer-2",
			status: BookingStatus.ACTIVE,
			startTime: new Date("2099-01-10T11:00:00.000Z"),
			endTime: new Date("2099-01-10T13:00:00.000Z"),
			unit: {
				id: "unit-1",
				name: "Focus Booth 1",
				capacity: 4,
				unitType: { name: UnitTypeName.BOOTH },
			},
		});

		await assertAppError(
			() => service.get({ customerId: "customer-1", bookingId: "missing" }),
			404,
		);
		await assertAppError(
			() => service.get({ customerId: "customer-1", bookingId: "booking-1" }),
			404,
		);
	});

	it("rejects cancelled and past Bookings for share context", async () => {
		const { bookings, service } = createHarness();
		bookings.push(
			{
				id: "booking-cancelled",
				userId: "customer-1",
				status: BookingStatus.CANCELLED,
				startTime: new Date("2099-01-10T11:00:00.000Z"),
				endTime: new Date("2099-01-10T13:00:00.000Z"),
				unit: {
					id: "unit-1",
					name: "Focus Booth 1",
					capacity: 4,
					unitType: { name: UnitTypeName.BOOTH },
				},
			},
			{
				id: "booking-past",
				userId: "customer-1",
				status: BookingStatus.ACTIVE,
				startTime: new Date("2099-01-10T09:00:00.000Z"),
				endTime: new Date("2099-01-10T11:59:59.999Z"),
				unit: {
					id: "unit-2",
					name: "Focus Booth 2",
					capacity: 4,
					unitType: { name: UnitTypeName.BOOTH },
				},
			},
		);

		await assertAppError(
			() =>
				service.get({
					customerId: "customer-1",
					bookingId: "booking-cancelled",
				}),
			409,
		);
		await assertAppError(
			() =>
				service.get({ customerId: "customer-1", bookingId: "booking-past" }),
			409,
		);
	});
});
