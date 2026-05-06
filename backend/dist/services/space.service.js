"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNewSpace = createNewSpace;
exports.getPublicSpaces = getPublicSpaces;
exports.getPublicSpaceById = getPublicSpaceById;
exports.getPublicSpaceAvailability = getPublicSpaceAvailability;
exports.updateExistingSpace = updateExistingSpace;
exports.deactivateExistingSpace = deactivateExistingSpace;
const booking_repository_js_1 = require("../db/booking.repository.js");
const space_repository_js_1 = require("../db/space.repository.js");
const app_error_js_1 = require("../lib/app-error.js");
const WEEKDAY_START = 1;
const WEEKDAY_END = 5;
const OPENING_MINUTES = 8 * 60;
const CLOSING_MINUTES = 22 * 60;
function assertNonEmpty(value, message) {
    if (value.trim().length === 0) {
        throw new app_error_js_1.AppError(400, message);
    }
}
function assertPositiveInteger(value, message) {
    if (!Number.isInteger(value) || value <= 0) {
        throw new app_error_js_1.AppError(400, message);
    }
}
function assertStartBeforeEnd(startTime, endTime) {
    if (startTime.getTime() >= endTime.getTime()) {
        throw new app_error_js_1.AppError(400, "Startzeit muss vor Endzeit liegen");
    }
}
function assertFutureRange(startTime) {
    if (startTime.getTime() <= Date.now()) {
        throw new app_error_js_1.AppError(400, "Nur zukünftige Zeiträume sind erlaubt");
    }
}
function assertSameCalendarDay(startTime, endTime) {
    const isSameDate = startTime.getFullYear() === endTime.getFullYear() &&
        startTime.getMonth() === endTime.getMonth() &&
        startTime.getDate() === endTime.getDate();
    if (!isSameDate) {
        throw new app_error_js_1.AppError(400, "Start und Ende müssen am selben Kalendertag liegen");
    }
}
function assertWeekday(date) {
    const day = date.getDay();
    if (day < WEEKDAY_START || day > WEEKDAY_END) {
        throw new app_error_js_1.AppError(400, "Zeitraum muss an einem Werktag liegen (Mo-Fr)");
    }
}
function toMinutesOfDay(date) {
    return date.getHours() * 60 + date.getMinutes();
}
function assertWithinOpeningHours(startTime, endTime) {
    const startMinutes = toMinutesOfDay(startTime);
    const endMinutes = toMinutesOfDay(endTime);
    if (startMinutes < OPENING_MINUTES || endMinutes > CLOSING_MINUTES) {
        throw new app_error_js_1.AppError(400, "Zeitraum muss innerhalb der Öffnungszeiten (08:00-22:00) liegen");
    }
}
function parseDateTime(value, fieldName) {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        throw new app_error_js_1.AppError(400, `Ungültiger ${fieldName}-Zeitpunkt`);
    }
    return parsed;
}
function normalizeCreateInput(input) {
    return {
        ...input,
        name: input.name.trim(),
        description: input.description.trim(),
        spaceTypeId: input.spaceTypeId.trim(),
    };
}
function normalizeUpdateInput(input) {
    const normalized = {
        id: input.id.trim(),
    };
    if (input.name !== undefined) {
        normalized.name = input.name.trim();
    }
    if (input.description !== undefined) {
        normalized.description = input.description.trim();
    }
    if (input.spaceTypeId !== undefined) {
        normalized.spaceTypeId = input.spaceTypeId.trim();
    }
    if (input.capacity !== undefined) {
        normalized.capacity = input.capacity;
    }
    if (input.isActive !== undefined) {
        normalized.isActive = input.isActive;
    }
    return normalized;
}
async function assertSpaceExists(spaceId) {
    const existingSpace = await (0, space_repository_js_1.findSpaceById)(spaceId);
    if (!existingSpace) {
        throw new app_error_js_1.AppError(404, "Space wurde nicht gefunden");
    }
    return existingSpace;
}
async function assertSpaceTypeExists(spaceTypeId) {
    const existingSpaceType = await (0, space_repository_js_1.doesSpaceTypeExist)(spaceTypeId);
    if (!existingSpaceType) {
        throw new app_error_js_1.AppError(404, "Space-Typ wurde nicht gefunden");
    }
}
function validateCreateInput(input) {
    assertNonEmpty(input.name, "Space-Name darf nicht leer sein");
    assertNonEmpty(input.description, "Beschreibung darf nicht leer sein");
    assertNonEmpty(input.spaceTypeId, "Space-Typ ist erforderlich");
    assertPositiveInteger(input.capacity, "Kapazität muss größer als 0 sein");
}
function validateUpdateInput(input) {
    if (input.name !== undefined) {
        assertNonEmpty(input.name, "Space-Name darf nicht leer sein");
    }
    if (input.description !== undefined) {
        assertNonEmpty(input.description, "Beschreibung darf nicht leer sein");
    }
    if (input.capacity !== undefined) {
        assertPositiveInteger(input.capacity, "Kapazität muss größer als 0 sein");
    }
    if (input.spaceTypeId !== undefined) {
        assertNonEmpty(input.spaceTypeId, "Space-Typ ist erforderlich");
    }
}
async function createNewSpace(input) {
    const normalizedInput = normalizeCreateInput(input);
    validateCreateInput(normalizedInput);
    await assertSpaceTypeExists(normalizedInput.spaceTypeId);
    return (0, space_repository_js_1.createSpace)(normalizedInput);
}
async function getPublicSpaces() {
    return (0, space_repository_js_1.listActiveSpaces)();
}
async function getPublicSpaceById(spaceId) {
    const normalizedSpaceId = spaceId.trim();
    if (normalizedSpaceId.length === 0) {
        throw new app_error_js_1.AppError(400, "Ungültige Route-Parameter");
    }
    const existingSpace = await (0, space_repository_js_1.findActiveSpaceById)(normalizedSpaceId);
    if (!existingSpace) {
        throw new app_error_js_1.AppError(404, "Space wurde nicht gefunden");
    }
    return existingSpace;
}
async function getPublicSpaceAvailability(input) {
    const spaceId = input.spaceId.trim();
    const start = input.start.trim();
    const end = input.end.trim();
    // validate input
    if (spaceId.length === 0) {
        throw new app_error_js_1.AppError(400, "Ungültige Route-Parameter");
    }
    if (start.length === 0 || end.length === 0) {
        throw new app_error_js_1.AppError(400, "start und end Query-Parameter sind erforderlich");
    }
    const startTime = parseDateTime(start, "start");
    const endTime = parseDateTime(end, "end");
    // load space and check existence before validating
    assertStartBeforeEnd(startTime, endTime);
    assertFutureRange(startTime);
    assertSameCalendarDay(startTime, endTime);
    assertWeekday(startTime);
    assertWithinOpeningHours(startTime, endTime);
    const existingSpace = await (0, space_repository_js_1.findActiveSpaceById)(spaceId);
    if (!existingSpace) {
        throw new app_error_js_1.AppError(404, "Space wurde nicht gefunden");
    }
    // check for overlapping bookings
    const hasOverlap = await (0, booking_repository_js_1.hasOverlappingActiveBookings)({
        spaceId,
        startTime,
        endTime,
    });
    // return availability result
    return {
        spaceId,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        isAvailable: !hasOverlap,
    };
}
async function updateExistingSpace(input) {
    const normalizedInput = normalizeUpdateInput(input);
    await assertSpaceExists(normalizedInput.id);
    validateUpdateInput(normalizedInput);
    if (normalizedInput.spaceTypeId !== undefined) {
        await assertSpaceTypeExists(normalizedInput.spaceTypeId);
    }
    return (0, space_repository_js_1.updateSpace)(normalizedInput);
}
async function deactivateExistingSpace(id) {
    const spaceId = id.trim();
    await assertSpaceExists(spaceId);
    return (0, space_repository_js_1.deactivateSpace)(spaceId);
}
