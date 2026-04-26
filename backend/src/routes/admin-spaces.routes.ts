import { Router } from "express";
import {
	createAdminSpaceController,
	deactivateAdminSpaceController,
	updateAdminSpaceController,
} from "../controllers/admin-spaces.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

export const adminSpacesRouter = Router();

adminSpacesRouter.use(requireAuth, requireRole("ADMIN"));

adminSpacesRouter.route("/spaces").post(createAdminSpaceController);
adminSpacesRouter.route("/spaces/:spaceId").put(updateAdminSpaceController);
adminSpacesRouter
	.route("/spaces/:spaceId/deactivate")
	.patch(deactivateAdminSpaceController);
