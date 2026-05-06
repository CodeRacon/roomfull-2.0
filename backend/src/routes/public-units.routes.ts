import { Router } from "express";
import {
	getPublicUnitAvailabilityController,
	getPublicUnitByIdController,
	listPublicUnitsController,
} from "../controllers/public-units.controller.js";

export const publicUnitsRouter = Router();

publicUnitsRouter.route("/units").get(listPublicUnitsController);
publicUnitsRouter
	.route("/units/:unitId/availability")
	.get(getPublicUnitAvailabilityController);
publicUnitsRouter.route("/units/:unitId").get(getPublicUnitByIdController);
