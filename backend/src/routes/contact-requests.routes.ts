import { Router } from "express";
import { createContactRequestController } from "../controllers/contact-requests.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

export const contactRequestsRouter = Router();

contactRequestsRouter.use(requireAuth, requireRole("CUSTOMER"));

contactRequestsRouter.route("/").post(createContactRequestController);
