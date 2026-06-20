import type { BookingStatus, UnitTypeName } from "@prisma/client";
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

export async function listBookingDemandRecordsInRange(
	input: ListBookingDemandRecordsInput,
): Promise<BookingDemandRecord[]> {
	return prisma.booking.findMany({
		where: {
			startTime: {
				gte: input.fromStart,
				lt: input.toEnd,
			},
		},
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
