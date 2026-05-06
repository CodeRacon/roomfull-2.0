"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingsRouter = void 0;
const express_1 = require("express");
const bookings_controller_js_1 = require("../controllers/bookings.controller.js");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
exports.bookingsRouter = (0, express_1.Router)();
exports.bookingsRouter.use(auth_middleware_js_1.requireAuth);
exports.bookingsRouter.route("/bookings").post(bookings_controller_js_1.createBookingController);
exports.bookingsRouter.route("/me/bookings").get(bookings_controller_js_1.listMyBookingsController);
exports.bookingsRouter.route("/bookings/:bookingId").delete(bookings_controller_js_1.cancelBookingController);
exports.bookingsRouter
    .route("/admin/bookings")
    .get((0, auth_middleware_js_1.requireRole)("ADMIN"), bookings_controller_js_1.listAdminBookingsController);
