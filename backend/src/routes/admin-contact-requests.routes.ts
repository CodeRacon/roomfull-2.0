import { Router } from "express";
import {
	getAdminContactRequestUnreadCountController,
	listAdminContactRequestsController,
	markAdminContactRequestAsReadController,
} from "../controllers/admin-contact-requests.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

export const adminContactRequestsRouter = Router();

adminContactRequestsRouter.use(requireAuth, requireRole("ADMIN"));

adminContactRequestsRouter
	.route("/contact-requests")
	.get(listAdminContactRequestsController);

adminContactRequestsRouter
	.route("/contact-requests/unread-count")
	.get(getAdminContactRequestUnreadCountController);

adminContactRequestsRouter
	.route("/contact-requests/:contactRequestId/read")
	.patch(markAdminContactRequestAsReadController);
