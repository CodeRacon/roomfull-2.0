import type { Booking } from "@prisma/client";
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

export type BookedInterval = {
	startTime: Date;
	endTime: Date;
};

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
): Promise<Booking[]> {
	return prisma.booking.findMany({
		where: { userId: input.userId },
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

export async function listAllBookings(): Promise<Booking[]> {
	return prisma.booking.findMany({
		orderBy: { createdAt: "desc" },
	});
}
