"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listPublicSpacesController = listPublicSpacesController;
exports.getPublicSpaceByIdController = getPublicSpaceByIdController;
exports.getPublicSpaceAvailabilityController = getPublicSpaceAvailabilityController;
const app_error_js_1 = require("../lib/app-error.js");
const space_service_js_1 = require("../services/space.service.js");
function parseSpaceId(params) {
    const spaceId = typeof params.spaceId === "string" ? params.spaceId.trim() : "";
    return spaceId.length > 0 ? spaceId : null;
}
async function listPublicSpacesController(_req, res, next) {
    try {
        const spaces = await (0, space_service_js_1.getPublicSpaces)();
        res.status(200).json({ spaces });
    }
    catch (error) {
        next(error);
    }
}
async function getPublicSpaceByIdController(req, res, next) {
    const spaceId = parseSpaceId(req.params);
    if (!spaceId) {
        next(new app_error_js_1.AppError(400, "Ungültige Route-Parameter"));
        return;
    }
    try {
        const space = await (0, space_service_js_1.getPublicSpaceById)(spaceId);
        res.status(200).json({ space });
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
async function getPublicSpaceAvailabilityController(req, res, next) {
    const spaceId = parseSpaceId(req.params);
    if (!spaceId) {
        next(new app_error_js_1.AppError(400, "Ungültige Route-Parameter"));
        return;
    }
    const query = parseAvailabilityQuery(req.query);
    if (!query) {
        next(new app_error_js_1.AppError(400, "start und end Query-Parameter sind erforderlich"));
        return;
    }
    try {
        const availability = await (0, space_service_js_1.getPublicSpaceAvailability)({
            spaceId,
            start: query.start,
            end: query.end,
        });
        res.status(200).json({ availability });
    }
    catch (error) {
        next(error);
    }
}
