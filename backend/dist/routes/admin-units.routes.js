"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminUnitsRouter = void 0;
const express_1 = require("express");
const admin_units_controller_js_1 = require("../controllers/admin-units.controller.js");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
exports.adminUnitsRouter = (0, express_1.Router)();
exports.adminUnitsRouter.use(auth_middleware_js_1.requireAuth, (0, auth_middleware_js_1.requireRole)("ADMIN"));
exports.adminUnitsRouter.route("/units").post(admin_units_controller_js_1.createAdminUnitController);
exports.adminUnitsRouter.route("/units/:unitId").put(admin_units_controller_js_1.updateAdminUnitController);
exports.adminUnitsRouter
    .route("/units/:unitId/deactivate")
    .patch(admin_units_controller_js_1.deactivateAdminUnitController);
