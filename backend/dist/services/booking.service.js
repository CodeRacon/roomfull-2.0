"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseDateTime = parseDateTime;
exports.createBookingForUser = createBookingForUser;
exports.listUserBookings = listUserBookings;
exports.cancelBookingForUser = cancelBookingForUser;
exports.listAllBookingsForAdmin = listAllBookingsForAdmin;
const client_1 = require("@prisma/client");
const area_repository_js_1 = require("../db/area.repository.js");
const booking_repository_js_1 = require("../db/booking.repository.js");
const unit_repository_js_1 = require("../db/unit.repository.js");
const app_error_js_1 = require("../lib/app-error.js");
const OPENING_MINUTES = 8 * 60;
const CLOSING_MINUTES = 22 * 60;
function parseDateTime(value, fieldName) {
    const trimmed = value.trim();
    if (trimmed === "") {
        throw new app_error_js_1.AppError(400, `${fieldName} ist erforderlich`);
    }
    const date = new Date(trimmed);
    if (Number.isNaN(date.getTime())) {
        throw new app_error_js_1.AppError(400, `${fieldName} muss ein gültiges ISO-Datum sein`);
    }
    return date;
}
function assertFutureWorkingRange(startTime, endTime) {
    if (startTime.getTime() >= endTime.getTime()) {
        throw new app_error_js_1.AppError(400, "Startzeit muss vor Endzeit liegen");
    }
    if (startTime.getTime() <= Date.now()) {
        throw new app_error_js_1.AppError(400, "Nur zukünftige Zeiträume sind erlaubt");
    }
    const day = startTime.getDay();
    if (day < 1 || day > 5) {
        throw new app_error_js_1.AppError(400, "Zeitraum muss an einem Werktag liegen (Mo-Fr)");
    }
    const startMinutes = startTime.getHours() * 60 + startTime.getMinutes();
    const endMinutes = endTime.getHours() * 60 + endTime.getMinutes();
    if (startMinutes < OPENING_MINUTES || endMinutes > CLOSING_MINUTES) {
        throw new app_error_js_1.AppError(400, "Zeitraum muss innerhalb der Öffnungszeiten liegen (Mo-Fr 08:00-22:00)");
    }
}
function parseUnitType(value) {
    const normalized = value.trim().toUpperCase();
    switch (normalized) {
        case client_1.UnitTypeName.HOT_DESK:
            return client_1.UnitTypeName.HOT_DESK;
        case client_1.UnitTypeName.BOOTH:
            return client_1.UnitTypeName.BOOTH;
        case client_1.UnitTypeName.TEAM_ROOM:
            return client_1.UnitTypeName.TEAM_ROOM;
        default:
            throw new app_error_js_1.AppError(400, "unitType ist ungültig");
    }
}
function resolveBookingMode(input) {
    const unitId = input.unitId?.trim() ?? "";
    const areaId = input.areaId?.trim() ?? "";
    const unitTypeRaw = input.unitType?.trim() ?? "";
    const directSelected = unitId.length > 0;
    const autoSelected = areaId.length > 0 || unitTypeRaw.length > 0;
    if (directSelected && autoSelected) {
        throw new app_error_js_1.AppError(400, "Entweder unitId ODER areaId+unitType senden, nicht beides");
    }
    if (!directSelected && !autoSelected) {
        throw new app_error_js_1.AppError(400, "Entweder unitId oder areaId+unitType ist erforderlich");
    }
    if (directSelected) {
        return { mode: "DIRECT", unitId };
    }
    if (areaId.length === 0 || unitTypeRaw.length === 0) {
        throw new app_error_js_1.AppError(400, "Für Auto-Assign sind areaId und unitType erforderlich");
    }
    const unitType = parseUnitType(unitTypeRaw);
    if (unitType !== client_1.UnitTypeName.HOT_DESK) {
        throw new app_error_js_1.AppError(400, "Auto-Assign ist in V1 nur für HOT_DESK erlaubt");
    }
    return { mode: "AUTO", areaId, unitType };
}
function assertDurationForType(startTime, endTime, minDurationMinutes, maxDurationMinutes) {
    const durationMs = endTime.getTime() - startTime.getTime();
    const minDurationMs = minDurationMinutes * 60 * 1000;
    const maxDurationMs = maxDurationMinutes * 60 * 1000;
    if (durationMs < minDurationMs || durationMs > maxDurationMs) {
        throw new app_error_js_1.AppError(400, `Buchungsdauer muss zwischen ${minDurationMinutes} und ${maxDurationMinutes} Minuten liegen`);
    }
}
async function createDirectBooking(input) {
    const unit = await (0, unit_repository_js_1.findActiveUnitByIdWithRelations)(input.unitId);
    if (!unit) {
        throw new app_error_js_1.AppError(404, "Unit wurde nicht gefunden");
    }
    assertDurationForType(input.startTime, input.endTime, unit.unitType.minDurationMinutes, unit.unitType.maxDurationMinutes);
    const booking = await (0, unit_repository_js_1.createBookingWithTransaction)({
        userId: input.userId,
        unitId: unit.id,
        startTime: input.startTime,
        endTime: input.endTime,
    });
    if (!booking) {
        throw new app_error_js_1.AppError(409, "Zeitraum kollidiert mit bestehender Buchung");
    }
    return booking;
}
async function createAutoAssignedHotDeskBooking(input) {
    const area = await (0, area_repository_js_1.findActiveAreaById)(input.areaId);
    if (!area) {
        throw new app_error_js_1.AppError(404, "Area wurde nicht gefunden");
    }
    const unitType = await (0, unit_repository_js_1.findUnitTypeByName)(input.unitType);
    if (!unitType) {
        throw new app_error_js_1.AppError(404, "UnitType wurde nicht gefunden");
    }
    assertDurationForType(input.startTime, input.endTime, unitType.minDurationMinutes, unitType.maxDurationMinutes);
    for (let attempt = 0; attempt < 3; attempt += 1) {
        const candidates = await (0, unit_repository_js_1.listAvailableUnitsForAllocation)({
            areaId: area.id,
            unitTypeId: unitType.id,
            startTime: input.startTime,
            endTime: input.endTime,
        });
        for (const candidate of candidates) {
            const booking = await (0, unit_repository_js_1.createBookingWithTransaction)({
                userId: input.userId,
                unitId: candidate.id,
                startTime: input.startTime,
                endTime: input.endTime,
            });
            if (booking) {
                return booking;
            }
        }
    }
    throw new app_error_js_1.AppError(409, "Kein freier Hot Desk für den Zeitraum verfügbar");
}
async function createBookingForUser(input) {
    const startTime = parseDateTime(input.start, "start");
    const endTime = parseDateTime(input.end, "end");
    assertFutureWorkingRange(startTime, endTime);
    const userId = input.userId.trim();
    if (userId === "") {
        throw new app_error_js_1.AppError(400, "userId ist erforderlich");
    }
    const mode = resolveBookingMode(input);
    if (mode.mode === "DIRECT") {
        return createDirectBooking({
            userId,
            unitId: mode.unitId,
            startTime,
            endTime,
        });
    }
    return createAutoAssignedHotDeskBooking({
        userId,
        areaId: mode.areaId,
        unitType: mode.unitType,
        startTime,
        endTime,
    });
}
async function listUserBookings(input) {
    const userId = input.userId.trim();
    if (userId === "") {
        throw new app_error_js_1.AppError(400, "userId ist erforderlich");
    }
    return (0, booking_repository_js_1.listUserBookings)({ userId });
}
async function cancelBookingForUser(input) {
    const bookingId = input.bookingId.trim();
    if (bookingId === "") {
        throw new app_error_js_1.AppError(400, "bookingId ist erforderlich");
    }
    const userId = input.userId.trim();
    if (userId === "") {
        throw new app_error_js_1.AppError(400, "userId ist erforderlich");
    }
    const booking = await (0, booking_repository_js_1.findBookingById)({ bookingId });
    if (!booking) {
        throw new app_error_js_1.AppError(404, "Buchung wurde nicht gefunden");
    }
    if (booking.status !== client_1.BookingStatus.ACTIVE) {
        throw new app_error_js_1.AppError(409, "Buchung ist bereits storniert");
    }
    if (booking.userId !== userId) {
        throw new app_error_js_1.AppError(403, "Buchung gehört nicht zum Benutzer");
    }
    if (booking.startTime.getTime() <= Date.now()) {
        throw new app_error_js_1.AppError(409, "Nur zukünftige Buchungen können storniert werden");
    }
    return (0, booking_repository_js_1.cancelBooking)({ bookingId });
}
async function listAllBookingsForAdmin() {
    return (0, booking_repository_js_1.listAllBookings)();
}
