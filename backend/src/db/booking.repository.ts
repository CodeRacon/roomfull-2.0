import type { Booking, Prisma, UnitTypeName } from "@prisma/client";
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

export type AdminBookingRecordQuery = {
	limit: number;
	orderBy: Prisma.BookingOrderByWithRelationInput;
	search?: string;
	status?: BookingStatus;
	startBefore?: Date;
	endAfter?: Date;
	endAtOrAfter?: Date;
	endBefore?: Date;
	updatedAtFrom?: Date;
	updatedAtTo?: Date;
};

export type AdminBookingScopeQuery = Omit<
	AdminBookingRecordQuery,
	"limit" | "orderBy"
>;

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

function buildAdminBookingWhere(
	input: AdminBookingScopeQuery,
): Prisma.BookingWhereInput {
	const where: Prisma.BookingWhereInput = {
		status: input.status,
		startTime: input.startBefore ? { lt: input.startBefore } : undefined,
		endTime: {
			...(input.endAfter ? { gt: input.endAfter } : {}),
			...(input.endAtOrAfter ? { gte: input.endAtOrAfter } : {}),
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
	const search = input.search?.trim();

	if (search) {
		where.user = {
			OR: [
				{ name: { contains: search, mode: "insensitive" } },
				{ email: { contains: search, mode: "insensitive" } },
			],
		};
	}

	return where;
}

export async function listAllBookings(
	input: AdminBookingRecordQuery,
): Promise<AdminBookingRecord[]> {
	const where = buildAdminBookingWhere(input);

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

export async function countAdminBookings(
	input: AdminBookingScopeQuery,
): Promise<number> {
	return prisma.booking.count({ where: buildAdminBookingWhere(input) });
}

export async function findTopBookedAdminUnit(
	input: AdminBookingScopeQuery,
): Promise<
	| {
			id: string;
			name: string;
			unitType: UnitTypeName;
			bookingCount: number;
	  }
	| undefined
> {
	const topGroup = await prisma.booking.groupBy({
		by: ["unitId"],
		where: buildAdminBookingWhere(input),
		_count: { _all: true },
		orderBy: [{ _count: { unitId: "desc" } }, { unitId: "asc" }],
		take: 1,
	});
	const top = topGroup[0];

	if (!top) {
		return undefined;
	}

	const unit = await prisma.bookableUnit.findUnique({
		where: { id: top.unitId },
		select: { id: true, name: true, unitType: { select: { name: true } } },
	});

	return unit
		? {
				id: unit.id,
				name: unit.name,
				unitType: unit.unitType.name,
				bookingCount: top._count._all,
			}
		: undefined;
}
