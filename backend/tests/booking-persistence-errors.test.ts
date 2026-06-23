import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { Prisma } from "@prisma/client";
import { isBookingOverlapConstraintViolation } from "../src/db/booking.repository.js";

function createKnownRequestError(input: {
	code: string;
	message?: string;
	meta?: Record<string, unknown>;
}): Prisma.PrismaClientKnownRequestError {
	return new Prisma.PrismaClientKnownRequestError(
		input.message ?? "Constraint failed",
		{
			code: input.code,
			clientVersion: "6.17.1",
			meta: input.meta,
		},
	);
}

describe("Booking persistence errors", () => {
	it("recognizes the active Booking overlap constraint", () => {
		const error = createKnownRequestError({
			code: "P2004",
			meta: {
				database_error:
					'conflicting key value violates exclusion constraint "bookings_no_active_overlap_excl"',
			},
		});

		assert.equal(isBookingOverlapConstraintViolation(error), true);
	});

	it("recognizes the overlap constraint in the Prisma error message", () => {
		const error = createKnownRequestError({
			code: "P2004",
			message:
				'conflicting key value violates exclusion constraint "bookings_no_active_overlap_excl"',
		});

		assert.equal(isBookingOverlapConstraintViolation(error), true);
	});

	it("does not hide unrelated known Prisma errors as Booking overlaps", () => {
		const otherConstraint = createKnownRequestError({
			code: "P2004",
			meta: {
				database_error:
					'new row violates check constraint "some_other_constraint"',
			},
		});
		const foreignKeyViolation = createKnownRequestError({ code: "P2003" });

		assert.equal(isBookingOverlapConstraintViolation(otherConstraint), false);
		assert.equal(
			isBookingOverlapConstraintViolation(foreignKeyViolation),
			false,
		);
	});
});
