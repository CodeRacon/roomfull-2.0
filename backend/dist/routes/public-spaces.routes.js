"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publicSpacesRouter = void 0;
const express_1 = require("express");
const public_spaces_controller_js_1 = require("../controllers/public-spaces.controller.js");
exports.publicSpacesRouter = (0, express_1.Router)();
exports.publicSpacesRouter.route("/spaces").get(public_spaces_controller_js_1.listPublicSpacesController);
exports.publicSpacesRouter
    .route("/spaces/:spaceId/availability")
    .get(public_spaces_controller_js_1.getPublicSpaceAvailabilityController);
exports.publicSpacesRouter.route("/spaces/:spaceId").get(public_spaces_controller_js_1.getPublicSpaceByIdController);
