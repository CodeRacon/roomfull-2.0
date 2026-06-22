import { Router } from "express";
import {
	cancelBookingController,
	createBookingController,
	getAdminBookingOperationsController,
	getBookingAvailabilityController,
	getBookingContextController,
	getDirectBookingCalendarStateController,
	listMyBookingsController,
} from "../controllers/bookings.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

export const bookingsRouter = Router();

bookingsRouter.use(requireAuth);

bookingsRouter.route("/bookings/context").get(getBookingContextController);

bookingsRouter
	.route("/bookings/availability")
	.get(getBookingAvailabilityController);

bookingsRouter.route("/bookings").post(createBookingController);

bookingsRouter.route("/me/bookings").get(listMyBookingsController);

bookingsRouter
	.route("/units/:unitId/calendar-state")
	.get(getDirectBookingCalendarStateController);

bookingsRouter.route("/bookings/:bookingId").delete(cancelBookingController);

bookingsRouter
	.route("/admin/bookings")
	.get(requireRole("ADMIN"), getAdminBookingOperationsController);
