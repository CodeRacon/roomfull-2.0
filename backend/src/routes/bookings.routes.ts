import { Router } from "express";
import {
	cancelBookingController,
	createBookingController,
	listAdminBookingsController,
	listMyBookingsController,
} from "../controllers/bookings.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

export const bookingsRouter = Router();

bookingsRouter.use(requireAuth);
bookingsRouter.route("/bookings").post(createBookingController);
bookingsRouter.route("/me/bookings").get(listMyBookingsController);
bookingsRouter.route("/bookings/:bookingId").delete(cancelBookingController);
bookingsRouter
	.route("/admin/bookings")
	.get(requireRole("ADMIN"), listAdminBookingsController);
