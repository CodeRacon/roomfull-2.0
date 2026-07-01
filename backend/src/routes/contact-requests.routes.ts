import { Router } from "express";
import { createContactRequestController } from "../controllers/contact-requests.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";
import { contactRequestRateLimit } from "../middleware/rate-limit.middleware.js";

export const contactRequestsRouter = Router();

contactRequestsRouter.use(requireAuth, requireRole("CUSTOMER"));

contactRequestsRouter
	.route("/")
	.post(contactRequestRateLimit, createContactRequestController);
