"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminSpacesRouter = void 0;
const express_1 = require("express");
const admin_spaces_controller_js_1 = require("../controllers/admin-spaces.controller.js");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
exports.adminSpacesRouter = (0, express_1.Router)();
exports.adminSpacesRouter.use(auth_middleware_js_1.requireAuth, (0, auth_middleware_js_1.requireRole)("ADMIN"));
exports.adminSpacesRouter.route("/spaces").post(admin_spaces_controller_js_1.createAdminSpaceController);
exports.adminSpacesRouter.route("/spaces/:spaceId").put(admin_spaces_controller_js_1.updateAdminSpaceController);
exports.adminSpacesRouter
    .route("/spaces/:spaceId/deactivate")
    .patch(admin_spaces_controller_js_1.deactivateAdminSpaceController);
