"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNewUnit = createNewUnit;
exports.getPublicUnits = getPublicUnits;
exports.getPublicUnitById = getPublicUnitById;
exports.getPublicUnitAvailability = getPublicUnitAvailability;
exports.updateExistingUnit = updateExistingUnit;
exports.deactivateExistingUnit = deactivateExistingUnit;
const booking_repository_js_1 = require("../db/booking.repository.js");
const area_repository_js_1 = require("../db/area.repository.js");
const unit_repository_js_1 = require("../db/unit.repository.js");
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
function assertNonNegativeInteger(value, message) {
    if (!Number.isInteger(value) || value < 0) {
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
    const trimmedAreaId = input.areaId?.trim();
    const areaId = trimmedAreaId && trimmedAreaId.length > 0 ? trimmedAreaId : undefined;
    return {
        ...input,
        name: input.name.trim(),
        description: input.description.trim(),
        unitTypeId: input.unitTypeId.trim(),
        areaId,
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
    if (input.unitTypeId !== undefined) {
        normalized.unitTypeId = input.unitTypeId.trim();
    }
    if (input.areaId !== undefined) {
        const trimmedAreaId = input.areaId.trim();
        normalized.areaId =
            trimmedAreaId.length > 0 ? trimmedAreaId : undefined;
    }
    if (input.capacity !== undefined) {
        normalized.capacity = input.capacity;
    }
    if (input.displayOrder !== undefined) {
        normalized.displayOrder = input.displayOrder;
    }
    if (input.isActive !== undefined) {
        normalized.isActive = input.isActive;
    }
    return normalized;
}
async function assertUnitExists(unitId) {
    const existingUnit = await (0, unit_repository_js_1.findUnitById)(unitId);
    if (!existingUnit) {
        throw new app_error_js_1.AppError(404, "Unit wurde nicht gefunden");
    }
    return existingUnit;
}
async function assertUnitTypeExists(unitTypeId) {
    const existingUnitType = await (0, unit_repository_js_1.doesUnitTypeExist)(unitTypeId);
    if (!existingUnitType) {
        throw new app_error_js_1.AppError(404, "UnitType wurde nicht gefunden");
    }
}
async function assertAreaExists(areaId) {
    const existingArea = await (0, area_repository_js_1.doesAreaExist)(areaId);
    if (!existingArea) {
        throw new app_error_js_1.AppError(404, "Area wurde nicht gefunden");
    }
}
function validateCreateInput(input) {
    assertNonEmpty(input.name, "Unit-Name darf nicht leer sein");
    assertNonEmpty(input.description, "Beschreibung darf nicht leer sein");
    assertNonEmpty(input.unitTypeId, "UnitType ist erforderlich");
    assertPositiveInteger(input.capacity, "Kapazität muss größer als 0 sein");
    if (input.displayOrder !== undefined) {
        assertNonNegativeInteger(input.displayOrder, "displayOrder muss >= 0 sein");
    }
    if (input.areaId !== undefined && input.areaId.length > 0) {
        assertNonEmpty(input.areaId, "areaId ist ungültig");
    }
}
function validateUpdateInput(input) {
    if (input.name !== undefined) {
        assertNonEmpty(input.name, "Unit-Name darf nicht leer sein");
    }
    if (input.description !== undefined) {
        assertNonEmpty(input.description, "Beschreibung darf nicht leer sein");
    }
    if (input.capacity !== undefined) {
        assertPositiveInteger(input.capacity, "Kapazität muss größer als 0 sein");
    }
    if (input.unitTypeId !== undefined) {
        assertNonEmpty(input.unitTypeId, "UnitType ist erforderlich");
    }
    if (input.displayOrder !== undefined) {
        assertNonNegativeInteger(input.displayOrder, "displayOrder muss >= 0 sein");
    }
    if (input.areaId !== undefined) {
        assertNonEmpty(input.areaId, "areaId ist ungültig");
    }
}
async function createNewUnit(input) {
    const normalizedInput = normalizeCreateInput(input);
    validateCreateInput(normalizedInput);
    await assertUnitTypeExists(normalizedInput.unitTypeId);
    if (normalizedInput.areaId) {
        await assertAreaExists(normalizedInput.areaId);
    }
    return (0, unit_repository_js_1.createUnit)(normalizedInput);
}
async function getPublicUnits() {
    return (0, unit_repository_js_1.listActiveUnits)();
}
async function getPublicUnitById(unitId) {
    const normalizedUnitId = unitId.trim();
    if (normalizedUnitId.length === 0) {
        throw new app_error_js_1.AppError(400, "Ungültige Route-Parameter");
    }
    const existingUnit = await (0, unit_repository_js_1.findActiveUnitById)(normalizedUnitId);
    if (!existingUnit) {
        throw new app_error_js_1.AppError(404, "Unit wurde nicht gefunden");
    }
    return existingUnit;
}
async function getPublicUnitAvailability(input) {
    const unitId = input.unitId.trim();
    const start = input.start.trim();
    const end = input.end.trim();
    if (unitId.length === 0) {
        throw new app_error_js_1.AppError(400, "Ungültige Route-Parameter");
    }
    if (start.length === 0 || end.length === 0) {
        throw new app_error_js_1.AppError(400, "start und end Query-Parameter sind erforderlich");
    }
    const startTime = parseDateTime(start, "start");
    const endTime = parseDateTime(end, "end");
    assertStartBeforeEnd(startTime, endTime);
    assertFutureRange(startTime);
    assertSameCalendarDay(startTime, endTime);
    assertWeekday(startTime);
    assertWithinOpeningHours(startTime, endTime);
    const existingUnit = await (0, unit_repository_js_1.findActiveUnitById)(unitId);
    if (!existingUnit) {
        throw new app_error_js_1.AppError(404, "Unit wurde nicht gefunden");
    }
    const hasOverlap = await (0, booking_repository_js_1.hasOverlappingActiveBookings)({
        unitId,
        startTime,
        endTime,
    });
    return {
        unitId,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        isAvailable: !hasOverlap,
    };
}
async function updateExistingUnit(input) {
    const normalizedInput = normalizeUpdateInput(input);
    await assertUnitExists(normalizedInput.id);
    validateUpdateInput(normalizedInput);
    if (normalizedInput.unitTypeId !== undefined) {
        await assertUnitTypeExists(normalizedInput.unitTypeId);
    }
    if (normalizedInput.areaId !== undefined) {
        await assertAreaExists(normalizedInput.areaId);
    }
    return (0, unit_repository_js_1.updateUnit)(normalizedInput);
}
async function deactivateExistingUnit(id) {
    const unitId = id.trim();
    await assertUnitExists(unitId);
    return (0, unit_repository_js_1.deactivateUnit)(unitId);
}
