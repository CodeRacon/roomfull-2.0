import { Router } from "express";
import {
	cancelBookingController,
	createBookingController,
	getAdminBookingOperationsController,
	getBookingAvailabilityController,
	getBookingContextController,
	getBookingShareContextController,
	getDirectBookingCalendarStateController,
	listMyBookingsController,
} from "../controllers/bookings.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";
import { bookingMutationRateLimit } from "../middleware/rate-limit.middleware.js";

export const bookingsRouter = Router();

bookingsRouter.use(requireAuth);

bookingsRouter.route("/bookings/context").get(getBookingContextController);

bookingsRouter
	.route("/bookings/availability")
	.get(getBookingAvailabilityController);

bookingsRouter
	.route("/bookings")
	.post(bookingMutationRateLimit, createBookingController);

bookingsRouter.route("/me/bookings").get(listMyBookingsController);

bookingsRouter
	.route("/me/bookings/:bookingId/share-context")
	.get(requireRole("CUSTOMER"), getBookingShareContextController);

bookingsRouter
	.route("/units/:unitId/calendar-state")
	.get(getDirectBookingCalendarStateController);

bookingsRouter
	.route("/bookings/:bookingId")
	.delete(bookingMutationRateLimit, cancelBookingController);

bookingsRouter
	.route("/admin/bookings")
	.get(requireRole("ADMIN"), getAdminBookingOperationsController);
