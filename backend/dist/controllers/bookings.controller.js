"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBookingController = createBookingController;
exports.listMyBookingsController = listMyBookingsController;
exports.cancelBookingController = cancelBookingController;
exports.listAdminBookingsController = listAdminBookingsController;
const app_error_js_1 = require("../lib/app-error.js");
const booking_service_js_1 = require("../services/booking.service.js");
function isRecord(value) {
    return typeof value === "object" && value !== null;
}
function parseAuthUserId(auth) {
    const userId = auth?.userId?.trim() ?? "";
    return userId.length > 0 ? userId : null;
}
function parseCreateBookingBody(body) {
    if (!isRecord(body)) {
        return null;
    }
    const start = typeof body.start === "string" ? body.start.trim() : "";
    const end = typeof body.end === "string" ? body.end.trim() : "";
    const unitId = typeof body.unitId === "string" ? body.unitId.trim() : undefined;
    const areaId = typeof body.areaId === "string" ? body.areaId.trim() : undefined;
    const unitType = typeof body.unitType === "string" ? body.unitType.trim() : undefined;
    if (start.length === 0 || end.length === 0) {
        return null;
    }
    return {
        start,
        end,
        unitId,
        areaId,
        unitType,
    };
}
function fail(next, statusCode, message) {
    next(new app_error_js_1.AppError(statusCode, message));
}
async function createBookingController(req, res, next) {
    const userId = parseAuthUserId(req.auth);
    if (!userId) {
        fail(next, 401, "Nicht eingeloggt");
        return;
    }
    const input = parseCreateBookingBody(req.body);
    if (!input) {
        fail(next, 400, "Ungültiger Request Body");
        return;
    }
    try {
        const booking = await (0, booking_service_js_1.createBookingForUser)({
            userId,
            start: input.start,
            end: input.end,
            unitId: input.unitId,
            areaId: input.areaId,
            unitType: input.unitType,
        });
        res.status(201).json({ booking });
    }
    catch (error) {
        next(error);
    }
}
async function listMyBookingsController(req, res, next) {
    const userId = parseAuthUserId(req.auth);
    if (!userId) {
        fail(next, 401, "Nicht eingeloggt");
        return;
    }
    try {
        const bookings = await (0, booking_service_js_1.listUserBookings)({
            userId,
        });
        res.status(200).json({ bookings });
    }
    catch (error) {
        next(error);
    }
}
function parseBookingId(params) {
    const bookingId = typeof params.bookingId === "string" ? params.bookingId.trim() : "";
    return bookingId.length > 0 ? bookingId : null;
}
async function cancelBookingController(req, res, next) {
    const userId = parseAuthUserId(req.auth);
    if (!userId) {
        fail(next, 401, "Nicht eingeloggt");
        return;
    }
    const bookingId = parseBookingId(req.params);
    if (!bookingId) {
        fail(next, 400, "Ungültige Route-Parameter");
        return;
    }
    try {
        const booking = await (0, booking_service_js_1.cancelBookingForUser)({ userId, bookingId });
        res.status(200).json({ booking });
    }
    catch (error) {
        next(error);
    }
}
async function listAdminBookingsController(_req, res, next) {
    try {
        const bookings = await (0, booking_service_js_1.listAllBookingsForAdmin)();
        res.status(200).json({ bookings });
    }
    catch (error) {
        next(error);
    }
}
