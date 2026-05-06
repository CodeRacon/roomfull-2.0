"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findAreaById = findAreaById;
exports.findActiveAreaById = findActiveAreaById;
exports.doesAreaExist = doesAreaExist;
const prisma_js_1 = require("./prisma.js");
async function findAreaById(id) {
    return prisma_js_1.prisma.area.findUnique({
        where: { id },
    });
}
async function findActiveAreaById(id) {
    return prisma_js_1.prisma.area.findFirst({
        where: {
            id,
            isActive: true,
        },
    });
}
async function doesAreaExist(id) {
    const area = await prisma_js_1.prisma.area.findUnique({
        where: { id },
        select: { id: true },
    });
    return area !== null;
}
