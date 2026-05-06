"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listActiveUnits = listActiveUnits;
exports.findUnitById = findUnitById;
exports.findUnitByIdWithRelations = findUnitByIdWithRelations;
exports.findActiveUnitById = findActiveUnitById;
exports.findActiveUnitByIdWithRelations = findActiveUnitByIdWithRelations;
exports.doesUnitTypeExist = doesUnitTypeExist;
exports.findUnitTypeByName = findUnitTypeByName;
exports.createUnit = createUnit;
exports.updateUnit = updateUnit;
exports.deactivateUnit = deactivateUnit;
exports.listAvailableUnitsForAllocation = listAvailableUnitsForAllocation;
exports.createBookingWithTransaction = createBookingWithTransaction;
const client_1 = require("@prisma/client");
const prisma_js_1 = require("./prisma.js");
async function listActiveUnits() {
    return prisma_js_1.prisma.bookableUnit.findMany({
        where: { isActive: true },
        orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
    });
}
async function findUnitById(id) {
    return prisma_js_1.prisma.bookableUnit.findUnique({
        where: { id },
    });
}
async function findUnitByIdWithRelations(id) {
    return prisma_js_1.prisma.bookableUnit.findUnique({
        where: { id },
        include: { unitType: true, area: true },
    });
}
async function findActiveUnitById(id) {
    return prisma_js_1.prisma.bookableUnit.findFirst({
        where: {
            id,
            isActive: true,
        },
    });
}
async function findActiveUnitByIdWithRelations(id) {
    return prisma_js_1.prisma.bookableUnit.findFirst({
        where: {
            id,
            isActive: true,
        },
        include: { unitType: true, area: true },
    });
}
async function doesUnitTypeExist(id) {
    const unitType = await prisma_js_1.prisma.unitType.findUnique({
        where: { id },
        select: { id: true },
    });
    return unitType !== null;
}
async function findUnitTypeByName(name) {
    return prisma_js_1.prisma.unitType.findUnique({
        where: { name },
    });
}
async function createUnit(input) {
    return prisma_js_1.prisma.bookableUnit.create({
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
async function updateUnit(input) {
    const { id, ...data } = input;
    return prisma_js_1.prisma.bookableUnit.update({
        where: { id },
        data,
    });
}
async function deactivateUnit(id) {
    return prisma_js_1.prisma.bookableUnit.update({
        where: { id },
        data: { isActive: false },
    });
}
async function listAvailableUnitsForAllocation(input) {
    return prisma_js_1.prisma.bookableUnit.findMany({
        where: {
            isActive: true,
            areaId: input.areaId,
            unitTypeId: input.unitTypeId,
            bookings: {
                none: {
                    status: client_1.BookingStatus.ACTIVE,
                    startTime: { lt: input.endTime },
                    endTime: { gt: input.startTime },
                },
            },
        },
        orderBy: [{ displayOrder: "asc" }, { id: "asc" }],
    });
}
async function createBookingWithTransaction(input) {
    return prisma_js_1.prisma.$transaction(async (tx) => {
        const overlap = await tx.booking.findFirst({
            where: {
                unitId: input.unitId,
                status: client_1.BookingStatus.ACTIVE,
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
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
                return null;
            }
            throw error;
        }
    });
}
