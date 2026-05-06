"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findUserByEmail = findUserByEmail;
exports.findUserById = findUserById;
exports.createUser = createUser;
exports.isUniqueEmailViolation = isUniqueEmailViolation;
const client_1 = require("@prisma/client");
const prisma_js_1 = require("./prisma.js");
async function findUserByEmail(email) {
    return prisma_js_1.prisma.user.findUnique({ where: { email } });
}
async function findUserById(id) {
    return prisma_js_1.prisma.user.findUnique({ where: { id } });
}
async function createUser(input) {
    return prisma_js_1.prisma.user.create({
        data: {
            name: input.name,
            email: input.email,
            passwordHash: input.passwordHash,
            role: input.role ?? client_1.UserRole.CUSTOMER,
        },
    });
}
function isUniqueEmailViolation(error) {
    if (!(error instanceof client_1.Prisma.PrismaClientKnownRequestError) ||
        error.code !== "P2002") {
        return false;
    }
    const target = error.meta?.target;
    if (Array.isArray(target)) {
        return target.some((value) => String(value).includes("email"));
    }
    if (typeof target === "string") {
        return target.includes("email");
    }
    return true;
}
