import { Router } from "express";
import { getBookingDemandAnalyticsController } from "../controllers/admin-analytics.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

export const adminAnalyticsRouter = Router();

adminAnalyticsRouter.use(requireAuth, requireRole("ADMIN"));

adminAnalyticsRouter
	.route("/analytics/booking-demand")
	.get(getBookingDemandAnalyticsController);
