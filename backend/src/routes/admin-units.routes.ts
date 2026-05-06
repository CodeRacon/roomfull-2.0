import { Router } from "express";
import {
	createAdminUnitController,
	deactivateAdminUnitController,
	updateAdminUnitController,
} from "../controllers/admin-units.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

export const adminUnitsRouter = Router();

adminUnitsRouter.use(requireAuth, requireRole("ADMIN"));

adminUnitsRouter.route("/units").post(createAdminUnitController);
adminUnitsRouter.route("/units/:unitId").put(updateAdminUnitController);
adminUnitsRouter
	.route("/units/:unitId/deactivate")
	.patch(deactivateAdminUnitController);
