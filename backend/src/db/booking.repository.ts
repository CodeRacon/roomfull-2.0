import type { Booking, Prisma } from "@prisma/client";
import { BookingStatus } from "@prisma/client";
import { prisma } from "./prisma.js";

type CreateBookingInput = {
	userId: string;
	unitId: string;
	startTime: Date;
	endTime: Date;
};

type ListUserBookingsInput = {
	userId: string;
};

type FindBookingByIdInput = {
	bookingId: string;
};

type CancelBookingInput = {
	bookingId: string;
};

type ListAllBookingsInput = {
	limit: number;
	orderBy: Prisma.BookingOrderByWithRelationInput;
	status?: BookingStatus;
	startBefore?: Date;
	endAfter?: Date;
	endBefore?: Date;
	updatedAtFrom?: Date;
	updatedAtTo?: Date;
};

export type BookedInterval = {
	startTime: Date;
	endTime: Date;
};

export type UserBookingRecord = Prisma.BookingGetPayload<{
	include: {
		unit: {
			select: {
				id: true;
				name: true;
				unitType: {
					select: {
						name: true;
					};
				};
			};
		};
	};
}>;

export type AdminBookingRecord = Prisma.BookingGetPayload<{
	include: {
		user: {
			select: {
				id: true;
				name: true;
				email: true;
				role: true;
			};
		};
		unit: {
			select: {
				id: true;
				name: true;
				unitType: {
					select: {
						name: true;
					};
				};
			};
		};
	};
}>;

export async function hasOverlappingActiveBookings(input: {
	unitId: string;
	startTime: Date;
	endTime: Date;
}): Promise<boolean> {
	const booking = await prisma.booking.findFirst({
		where: {
			unitId: input.unitId,
			status: BookingStatus.ACTIVE,
			startTime: { lt: input.endTime },
			endTime: { gt: input.startTime },
		},
		select: { id: true },
	});

	return booking !== null;
}

export async function listActiveBookingIntervalsForUnitInRange(input: {
	unitId: string;
	startTime: Date;
	endTime: Date;
}): Promise<BookedInterval[]> {
	return prisma.booking.findMany({
		where: {
			unitId: input.unitId,
			status: BookingStatus.ACTIVE,
			startTime: { lt: input.endTime },
			endTime: { gt: input.startTime },
		},
		select: {
			startTime: true,
			endTime: true,
		},
		orderBy: { startTime: "asc" },
	});
}

export async function createBooking(
	input: CreateBookingInput,
): Promise<Booking> {
	return prisma.booking.create({
		data: {
			userId: input.userId,
			unitId: input.unitId,
			startTime: input.startTime,
			endTime: input.endTime,
		},
	});
}

export async function listUserBookings(
	input: ListUserBookingsInput,
): Promise<UserBookingRecord[]> {
	return prisma.booking.findMany({
		where: { userId: input.userId },
		include: {
			unit: {
				select: {
					id: true,
					name: true,
					unitType: {
						select: {
							name: true,
						},
					},
				},
			},
		},
		orderBy: { createdAt: "desc" },
	});
}

export async function findBookingById(
	input: FindBookingByIdInput,
): Promise<null | Booking> {
	return prisma.booking.findUnique({
		where: { id: input.bookingId },
	});
}

export async function cancelBooking(
	input: CancelBookingInput,
): Promise<Booking> {
	return prisma.booking.update({
		where: { id: input.bookingId },
		data: {
			status: BookingStatus.CANCELLED,
		},
	});
}

export async function listAllBookings(
	input: ListAllBookingsInput,
): Promise<AdminBookingRecord[]> {
	const where: Prisma.BookingWhereInput = {
		status: input.status,
		startTime: input.startBefore ? { lt: input.startBefore } : undefined,
		endTime: {
			...(input.endAfter ? { gt: input.endAfter } : {}),
			...(input.endBefore ? { lt: input.endBefore } : {}),
		},
		updatedAt:
			input.updatedAtFrom || input.updatedAtTo
				? {
						...(input.updatedAtFrom ? { gte: input.updatedAtFrom } : {}),
						...(input.updatedAtTo ? { lt: input.updatedAtTo } : {}),
					}
				: undefined,
	};

	return prisma.booking.findMany({
		where,
		include: {
			user: {
				select: {
					id: true,
					name: true,
					email: true,
					role: true,
				},
			},
			unit: {
				select: {
					id: true,
					name: true,
					unitType: {
						select: {
							name: true,
						},
					},
				},
			},
		},
		orderBy: input.orderBy,
		take: input.limit,
	});
}
