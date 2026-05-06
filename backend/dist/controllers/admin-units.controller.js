"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAdminUnitController = createAdminUnitController;
exports.updateAdminUnitController = updateAdminUnitController;
exports.deactivateAdminUnitController = deactivateAdminUnitController;
const app_error_js_1 = require("../lib/app-error.js");
const unit_service_js_1 = require("../services/unit.service.js");
const INVALID_BODY_MESSAGE = "Ungültiger Request Body";
const INVALID_ROUTE_PARAMS_MESSAGE = "Ungültige Route-Parameter";
function isRecord(value) {
    return typeof value === "object" && value !== null;
}
function fail(next, statusCode, message) {
    next(new app_error_js_1.AppError(statusCode, message));
}
function parseCreateUnitBody(body) {
    if (!isRecord(body)) {
        return null;
    }
    if (typeof body.name !== "string" ||
        typeof body.description !== "string" ||
        typeof body.unitTypeId !== "string" ||
        typeof body.capacity !== "number" ||
        ("isActive" in body && typeof body.isActive !== "boolean") ||
        ("areaId" in body && typeof body.areaId !== "string") ||
        ("displayOrder" in body && typeof body.displayOrder !== "number")) {
        return null;
    }
    const isActive = typeof body.isActive === "boolean" ? body.isActive : undefined;
    const areaId = typeof body.areaId === "string" ? body.areaId.trim() : undefined;
    const displayOrder = typeof body.displayOrder === "number" ? body.displayOrder : undefined;
    return {
        name: body.name.trim(),
        description: body.description.trim(),
        capacity: body.capacity,
        isActive,
        unitTypeId: body.unitTypeId.trim(),
        areaId,
        displayOrder,
    };
}
function parseUpdateUnitBody(body) {
    if (!isRecord(body)) {
        return null;
    }
    const parsed = {};
    if ("name" in body) {
        if (typeof body.name !== "string") {
            return null;
        }
        parsed.name = body.name.trim();
    }
    if ("description" in body) {
        if (typeof body.description !== "string") {
            return null;
        }
        parsed.description = body.description.trim();
    }
    if ("capacity" in body) {
        if (typeof body.capacity !== "number") {
            return null;
        }
        parsed.capacity = body.capacity;
    }
    if ("isActive" in body) {
        if (typeof body.isActive !== "boolean") {
            return null;
        }
        parsed.isActive = body.isActive;
    }
    if ("unitTypeId" in body) {
        if (typeof body.unitTypeId !== "string") {
            return null;
        }
        parsed.unitTypeId = body.unitTypeId.trim();
    }
    if ("areaId" in body) {
        if (typeof body.areaId !== "string") {
            return null;
        }
        parsed.areaId = body.areaId.trim();
    }
    if ("displayOrder" in body) {
        if (typeof body.displayOrder !== "number") {
            return null;
        }
        parsed.displayOrder = body.displayOrder;
    }
    if (Object.keys(parsed).length === 0) {
        return null;
    }
    return parsed;
}
function parseUnitId(params) {
    const unitId = typeof params.unitId === "string" ? params.unitId.trim() : "";
    return unitId.length > 0 ? unitId : null;
}
async function createAdminUnitController(req, res, next) {
    const input = parseCreateUnitBody(req.body);
    if (!input) {
        fail(next, 400, INVALID_BODY_MESSAGE);
        return;
    }
    try {
        const newUnit = await (0, unit_service_js_1.createNewUnit)(input);
        res.status(201).json({ unit: newUnit });
    }
    catch (error) {
        next(error);
    }
}
async function updateAdminUnitController(req, res, next) {
    const unitId = parseUnitId(req.params);
    if (!unitId) {
        fail(next, 400, INVALID_ROUTE_PARAMS_MESSAGE);
        return;
    }
    const input = parseUpdateUnitBody(req.body);
    if (!input) {
        fail(next, 400, INVALID_BODY_MESSAGE);
        return;
    }
    try {
        const updatedUnit = await (0, unit_service_js_1.updateExistingUnit)({ id: unitId, ...input });
        res.status(200).json({ unit: updatedUnit });
    }
    catch (error) {
        next(error);
    }
}
async function deactivateAdminUnitController(req, res, next) {
    const unitId = parseUnitId(req.params);
    if (!unitId) {
        fail(next, 400, INVALID_ROUTE_PARAMS_MESSAGE);
        return;
    }
    try {
        const deactivatedUnit = await (0, unit_service_js_1.deactivateExistingUnit)(unitId);
        res.status(200).json({ unit: deactivatedUnit });
    }
    catch (error) {
        next(error);
    }
}
