"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listActiveSpaces = listActiveSpaces;
exports.findSpaceById = findSpaceById;
exports.findActiveSpaceById = findActiveSpaceById;
exports.doesSpaceTypeExist = doesSpaceTypeExist;
exports.createSpace = createSpace;
exports.updateSpace = updateSpace;
exports.deactivateSpace = deactivateSpace;
const prisma_js_1 = require("./prisma.js");
async function listActiveSpaces() {
    return prisma_js_1.prisma.space.findMany({
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
    });
}
async function findSpaceById(id) {
    return prisma_js_1.prisma.space.findUnique({
        where: { id },
    });
}
async function findActiveSpaceById(id) {
    return prisma_js_1.prisma.space.findFirst({
        where: {
            id,
            isActive: true,
        },
    });
}
async function doesSpaceTypeExist(id) {
    const spaceType = await prisma_js_1.prisma.spaceType.findUnique({
        where: { id },
        select: { id: true },
    });
    return spaceType !== null;
}
async function createSpace(input) {
    return prisma_js_1.prisma.space.create({
        data: {
            name: input.name,
            description: input.description,
            capacity: input.capacity,
            isActive: input.isActive ?? true,
            spaceTypeId: input.spaceTypeId,
        },
    });
}
async function updateSpace(input) {
    const { id, ...data } = input;
    return prisma_js_1.prisma.space.update({
        where: { id },
        data,
    });
}
async function deactivateSpace(id) {
    return prisma_js_1.prisma.space.update({
        where: { id },
        data: { isActive: false },
    });
}
