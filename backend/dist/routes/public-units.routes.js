"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publicUnitsRouter = void 0;
const express_1 = require("express");
const public_units_controller_js_1 = require("../controllers/public-units.controller.js");
exports.publicUnitsRouter = (0, express_1.Router)();
exports.publicUnitsRouter.route("/units").get(public_units_controller_js_1.listPublicUnitsController);
exports.publicUnitsRouter
    .route("/units/:unitId/availability")
    .get(public_units_controller_js_1.getPublicUnitAvailabilityController);
exports.publicUnitsRouter.route("/units/:unitId").get(public_units_controller_js_1.getPublicUnitByIdController);
