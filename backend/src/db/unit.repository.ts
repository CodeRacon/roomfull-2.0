import {
	type BookableUnit,
	BookingStatus,
	Prisma,
	type UnitTypeName,
} from "@prisma/client";
import { prisma } from "./prisma.js";

export type CreateUnitInput = {
	name: string;
	description: string;
	capacity: number;
	isActive?: boolean;
	unitTypeId: string;
	areaId?: string;
	displayOrder?: number;
};

export type UpdateUnitInput = { id: string } & Partial<CreateUnitInput>;

export type UnitWithRelations = Prisma.BookableUnitGetPayload<{
	include: { unitType: true; area: true };
}>;

export async function listActiveUnits(): Promise<BookableUnit[]> {
	return prisma.bookableUnit.findMany({
		where: { isActive: true },
		orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
	});
}

export async function listActiveUnitsWithRelations(): Promise<
	UnitWithRelations[]
> {
	return prisma.bookableUnit.findMany({
		where: { isActive: true },
		orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
		include: { unitType: true, area: true },
	});
}

export async function findUnitById(id: string): Promise<BookableUnit | null> {
	return prisma.bookableUnit.findUnique({
		where: { id },
	});
}

export async function findUnitByIdWithRelations(
	id: string,
): Promise<UnitWithRelations | null> {
	return prisma.bookableUnit.findUnique({
		where: { id },
		include: { unitType: true, area: true },
	});
}

export async function findActiveUnitById(
	id: string,
): Promise<BookableUnit | null> {
	return prisma.bookableUnit.findFirst({
		where: {
			id,
			isActive: true,
		},
	});
}

export async function findActiveUnitByIdWithRelations(
	id: string,
): Promise<UnitWithRelations | null> {
	return prisma.bookableUnit.findFirst({
		where: {
			id,
			isActive: true,
		},
		include: { unitType: true, area: true },
	});
}

export async function doesUnitTypeExist(id: string): Promise<boolean> {
	const unitType = await prisma.unitType.findUnique({
		where: { id },
		select: { id: true },
	});

	return unitType !== null;
}

export async function findUnitTypeByName(name: UnitTypeName) {
	return prisma.unitType.findUnique({
		where: { name },
	});
}

export async function createUnit(
	input: CreateUnitInput,
): Promise<BookableUnit> {
	return prisma.bookableUnit.create({
		data: {
			name: input.name,
			description: input.description,
			capacity: input.capacity,
			isActive: input.isActive ?? true,
			unitTypeId: input.unitTypeId,
			areaId: input.areaId,
			displayOrder: input.displayOrder ?? 0,
		},
	});
}

export async function updateUnit(
	input: UpdateUnitInput,
): Promise<BookableUnit> {
	const { id, ...data } = input;
	return prisma.bookableUnit.update({
		where: { id },
		data,
	});
}

export async function deactivateUnit(id: string): Promise<BookableUnit> {
	return prisma.bookableUnit.update({
		where: { id },
		data: { isActive: false },
	});
}

export async function listAvailableUnitsForAllocation(input: {
	areaId: string;
	unitTypeId: string;
	startTime: Date;
	endTime: Date;
}): Promise<BookableUnit[]> {
	return prisma.bookableUnit.findMany({
		where: {
			isActive: true,
			areaId: input.areaId,
			unitTypeId: input.unitTypeId,
			bookings: {
				none: {
					status: BookingStatus.ACTIVE,
					startTime: { lt: input.endTime },
					endTime: { gt: input.startTime },
				},
			},
		},
		orderBy: [{ displayOrder: "asc" }, { id: "asc" }],
	});
}

export async function createBookingWithTransaction(input: {
	userId: string;
	unitId: string;
	startTime: Date;
	endTime: Date;
}) {
	return prisma.$transaction(async (tx) => {
		const overlap = await tx.booking.findFirst({
			where: {
				unitId: input.unitId,
				status: BookingStatus.ACTIVE,
				startTime: { lt: input.endTime },
				endTime: { gt: input.startTime },
			},
			select: { id: true },
		});

		if (overlap) {
			return null;
		}

		try {
			return await tx.booking.create({
				data: {
					userId: input.userId,
					unitId: input.unitId,
					startTime: input.startTime,
					endTime: input.endTime,
				},
			});
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				return null;
			}

			throw error;
		}
	});
}
