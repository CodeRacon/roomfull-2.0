"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasOverlappingActiveBookings = hasOverlappingActiveBookings;
exports.createBooking = createBooking;
exports.listUserBookings = listUserBookings;
exports.findBookingById = findBookingById;
exports.cancelBooking = cancelBooking;
exports.listAllBookings = listAllBookings;
const client_1 = require("@prisma/client");
const prisma_js_1 = require("./prisma.js");
async function hasOverlappingActiveBookings(input) {
    const booking = await prisma_js_1.prisma.booking.findFirst({
        where: {
            unitId: input.unitId,
            status: client_1.BookingStatus.ACTIVE,
            startTime: { lt: input.endTime },
            endTime: { gt: input.startTime },
        },
        select: { id: true },
    });
    return booking !== null;
}
async function createBooking(input) {
    return prisma_js_1.prisma.booking.create({
        data: {
            userId: input.userId,
            unitId: input.unitId,
            startTime: input.startTime,
            endTime: input.endTime,
        },
    });
}
async function listUserBookings(input) {
    return prisma_js_1.prisma.booking.findMany({
        where: { userId: input.userId },
        orderBy: { createdAt: "desc" },
    });
}
async function findBookingById(input) {
    return prisma_js_1.prisma.booking.findUnique({
        where: { id: input.bookingId },
    });
}
async function cancelBooking(input) {
    return prisma_js_1.prisma.booking.update({
        where: { id: input.bookingId },
        data: {
            status: client_1.BookingStatus.CANCELLED,
        },
    });
}
async function listAllBookings() {
    return prisma_js_1.prisma.booking.findMany({
        orderBy: { createdAt: "desc" },
    });
}
