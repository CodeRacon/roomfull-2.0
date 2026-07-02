import type { BookingStatus, Prisma, UnitTypeName } from "@prisma/client";
import { prisma } from "./prisma.js";

type ListBookingDemandRecordsInput = {
	fromStart: Date;
	toEnd: Date;
};

export type BookingDemandRecord = {
	startTime: Date;
	status: BookingStatus;
	unit: {
		unitType: {
			name: UnitTypeName;
		};
	};
};

export function buildBookingDemandRecordsWhere(
	input: ListBookingDemandRecordsInput,
): Prisma.BookingWhereInput {
	return {
		startTime: {
			gte: input.fromStart,
			lt: input.toEnd,
		},
		user: {
			isDemo: false,
		},
	};
}

export async function listBookingDemandRecordsInRange(
	input: ListBookingDemandRecordsInput,
): Promise<BookingDemandRecord[]> {
	return prisma.booking.findMany({
		where: buildBookingDemandRecordsWhere(input),
		select: {
			startTime: true,
			status: true,
			unit: {
				select: {
					unitType: {
						select: {
							name: true,
						},
					},
				},
			},
		},
		orderBy: {
			startTime: "asc",
		},
	});
}
