"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listPublicUnitsController = listPublicUnitsController;
exports.getPublicUnitByIdController = getPublicUnitByIdController;
exports.getPublicUnitAvailabilityController = getPublicUnitAvailabilityController;
const app_error_js_1 = require("../lib/app-error.js");
const unit_service_js_1 = require("../services/unit.service.js");
function parseUnitId(params) {
    const unitId = typeof params.unitId === "string" ? params.unitId.trim() : "";
    return unitId.length > 0 ? unitId : null;
}
async function listPublicUnitsController(_req, res, next) {
    try {
        const units = await (0, unit_service_js_1.getPublicUnits)();
        res.status(200).json({ units });
    }
    catch (error) {
        next(error);
    }
}
async function getPublicUnitByIdController(req, res, next) {
    const unitId = parseUnitId(req.params);
    if (!unitId) {
        next(new app_error_js_1.AppError(400, "Ungültige Route-Parameter"));
        return;
    }
    try {
        const unit = await (0, unit_service_js_1.getPublicUnitById)(unitId);
        res.status(200).json({ unit });
    }
    catch (error) {
        next(error);
    }
}
function parseAvailabilityQuery(query) {
    const start = typeof query.start === "string" ? query.start.trim() : "";
    const end = typeof query.end === "string" ? query.end.trim() : "";
    if (start.length === 0 || end.length === 0) {
        return null;
    }
    return { start, end };
}
async function getPublicUnitAvailabilityController(req, res, next) {
    const unitId = parseUnitId(req.params);
    if (!unitId) {
        next(new app_error_js_1.AppError(400, "Ungültige Route-Parameter"));
        return;
    }
    const query = parseAvailabilityQuery(req.query);
    if (!query) {
        next(new app_error_js_1.AppError(400, "start und end Query-Parameter sind erforderlich"));
        return;
    }
    try {
        const availability = await (0, unit_service_js_1.getPublicUnitAvailability)({
            unitId,
            start: query.start,
            end: query.end,
        });
        res.status(200).json({ availability });
    }
    catch (error) {
        next(error);
    }
}
