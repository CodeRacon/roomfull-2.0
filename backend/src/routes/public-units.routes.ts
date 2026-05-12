import { Router } from "express";
import {
	getPublicUnitAvailabilityController,
	getPublicUnitByIdController,
	listPublicBookingOptionsController,
	listPublicUnitsController,
} from "../controllers/public-units.controller.js";

export const publicUnitsRouter = Router();

publicUnitsRouter.route("/units").get(listPublicUnitsController);

publicUnitsRouter
	.route("/booking-options")
	.get(listPublicBookingOptionsController);

publicUnitsRouter
	.route("/units/:unitId/availability")
	.get(getPublicUnitAvailabilityController);

publicUnitsRouter.route("/units/:unitId").get(getPublicUnitByIdController);
