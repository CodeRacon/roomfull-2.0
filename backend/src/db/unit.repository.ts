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

export type UpdateUnitInput = { id: string } & Partial<
	Omit<CreateUnitInput, "areaId">
> & {
		areaId?: string | null;
	};

export type UnitTypeIdentity = {
	id: string;
	name: UnitTypeName;
};

export type AdminUnitStatusFilter = "active" | "deactivated" | "all";

export type ListAdminUnitsInput = {
	status: AdminUnitStatusFilter;
	unitType?: UnitTypeName;
	search?: string;
};

export type UnitWithRelations = Prisma.BookableUnitGetPayload<{
	include: { unitType: true; area: true };
}>;

export type UnitForAvailability = Prisma.BookableUnitGetPayload<{
	include: {
		bookings: {
			select: {
				startTime: true;
				endTime: true;
			};
		};
		unitType: true;
	};
}>;

export type UnitTypeForBookingOption = Prisma.UnitTypeGetPayload<{
	include: {
		units: {
			where: { isActive: true };
			include: { area: true };
			orderBy: [{ displayOrder: "asc" }, { id: "asc" }];
		};
	};
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

export async function listActiveUnitsWithRelationsByUnitType(
	unitType: UnitTypeName,
): Promise<UnitWithRelations[]> {
	return prisma.bookableUnit.findMany({
		where: {
			isActive: true,
			unitType: { name: unitType },
		},
		orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
		include: { unitType: true, area: true },
	});
}

export async function listAdminUnitsWithRelations(
	input: ListAdminUnitsInput,
): Promise<UnitWithRelations[]> {
	const where: Prisma.BookableUnitWhereInput = {};

	if (input.status === "active") {
		where.isActive = true;
	}

	if (input.status === "deactivated") {
		where.isActive = false;
	}

	if (input.unitType) {
		where.unitType = { name: input.unitType };
	}

	if (input.search) {
		where.name = { contains: input.search, mode: "insensitive" };
	}

	return prisma.bookableUnit.findMany({
		where,
		orderBy: [{ displayOrder: "asc" }, { name: "asc" }, { id: "asc" }],
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

export async function findUnitTypeByName(name: UnitTypeName) {
	return prisma.unitType.findUnique({
		where: { name },
	});
}

export async function findUnitTypeById(
	id: string,
): Promise<UnitTypeIdentity | null> {
	return prisma.unitType.findUnique({
		where: { id },
		select: { id: true, name: true },
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

export async function listActiveUnitsForAvailability(input: {
	areaId: string;
	unitTypeId: string;
	startTime: Date;
	endTime: Date;
}): Promise<UnitForAvailability[]> {
	return prisma.bookableUnit.findMany({
		where: {
			isActive: true,
			areaId: input.areaId,
			unitTypeId: input.unitTypeId,
		},
		include: {
			unitType: true,
			bookings: {
				where: {
					status: BookingStatus.ACTIVE,
					startTime: { lt: input.endTime },
					endTime: { gt: input.startTime },
				},
				select: {
					startTime: true,
					endTime: true,
				},
				orderBy: { startTime: "asc" },
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

export async function listUnitTypesForBookingOptions(
	unitTypeNames: UnitTypeName[],
): Promise<UnitTypeForBookingOption[]> {
	return prisma.unitType.findMany({
		where: { name: { in: unitTypeNames } },
		orderBy: { name: "asc" },
		include: {
			units: {
				where: { isActive: true },
				include: { area: true },
				orderBy: [{ displayOrder: "asc" }, { id: "asc" }],
			},
		},
	});
}

export async function listUnitTypesForAdminContext(): Promise<
	UnitTypeIdentity[]
> {
	return prisma.unitType.findMany({
		orderBy: { name: "asc" },
		select: { id: true, name: true },
	});
}

export async function countActiveUnitCapacityByAreaAndUnitType(input: {
	areaId: string;
	unitTypeId: string;
}): Promise<number> {
	const result = await prisma.bookableUnit.aggregate({
		where: {
			isActive: true,
			areaId: input.areaId,
			unitTypeId: input.unitTypeId,
		},
		_sum: { capacity: true },
	});

	return result._sum.capacity ?? 0;
}
