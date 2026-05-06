"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
const globalWithPrisma = globalThis;
exports.prisma = globalWithPrisma.__prisma ?? new client_1.PrismaClient();
if (process.env.NODE_ENV !== "production") {
    globalWithPrisma.__prisma = exports.prisma;
}
