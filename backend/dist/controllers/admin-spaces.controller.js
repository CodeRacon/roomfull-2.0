"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAdminSpaceController = createAdminSpaceController;
exports.updateAdminSpaceController = updateAdminSpaceController;
exports.deactivateAdminSpaceController = deactivateAdminSpaceController;
const app_error_js_1 = require("../lib/app-error.js");
const space_service_js_1 = require("../services/space.service.js");
const INVALID_BODY_MESSAGE = "Ungültiger Request Body";
const INVALID_ROUTE_PARAMS_MESSAGE = "Ungültige Route-Parameter";
function isRecord(value) {
    return typeof value === "object" && value !== null;
}
function fail(next, statusCode, message) {
    next(new app_error_js_1.AppError(statusCode, message));
}
function parseCreateSpaceBody(body) {
    if (!isRecord(body)) {
        return null;
    }
    if (typeof body.name !== "string" ||
        typeof body.description !== "string" ||
        typeof body.spaceTypeId !== "string" ||
        typeof body.capacity !== "number" ||
        ("isActive" in body && typeof body.isActive !== "boolean")) {
        return null;
    }
    const isActive = typeof body.isActive === "boolean" ? body.isActive : undefined;
    return {
        name: body.name.trim(),
        description: body.description.trim(),
        capacity: body.capacity,
        isActive,
        spaceTypeId: body.spaceTypeId.trim(),
    };
}
function parseUpdateSpaceBody(body) {
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
    if ("spaceTypeId" in body) {
        if (typeof body.spaceTypeId !== "string") {
            return null;
        }
        parsed.spaceTypeId = body.spaceTypeId.trim();
    }
    if (Object.keys(parsed).length === 0) {
        return null;
    }
    return parsed;
}
function parseSpaceId(params) {
    const spaceId = typeof params.spaceId === "string" ? params.spaceId.trim() : "";
    return spaceId.length > 0 ? spaceId : null;
}
async function createAdminSpaceController(req, res, next) {
    const input = parseCreateSpaceBody(req.body);
    if (!input) {
        fail(next, 400, INVALID_BODY_MESSAGE);
        return;
    }
    try {
        const newSpace = await (0, space_service_js_1.createNewSpace)(input);
        res.status(201).json({ space: newSpace });
    }
    catch (error) {
        next(error);
    }
}
async function updateAdminSpaceController(req, res, next) {
    const spaceId = parseSpaceId(req.params);
    if (!spaceId) {
        fail(next, 400, INVALID_ROUTE_PARAMS_MESSAGE);
        return;
    }
    const input = parseUpdateSpaceBody(req.body);
    if (!input) {
        fail(next, 400, INVALID_BODY_MESSAGE);
        return;
    }
    try {
        const updatedSpace = await (0, space_service_js_1.updateExistingSpace)({ id: spaceId, ...input });
        res.status(200).json({ space: updatedSpace });
    }
    catch (error) {
        next(error);
    }
}
async function deactivateAdminSpaceController(req, res, next) {
    const spaceId = parseSpaceId(req.params);
    if (!spaceId) {
        fail(next, 400, INVALID_ROUTE_PARAMS_MESSAGE);
        return;
    }
    try {
        const deactivatedSpace = await (0, space_service_js_1.deactivateExistingSpace)(spaceId);
        res.status(200).json({ space: deactivatedSpace });
    }
    catch (error) {
        next(error);
    }
}
