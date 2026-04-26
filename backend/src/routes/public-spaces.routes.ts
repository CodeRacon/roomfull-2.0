import { Router } from "express";
import {
	getPublicSpaceByIdController,
	listPublicSpacesController,
} from "../controllers/public-spaces.controller.js";

export const publicSpacesRouter = Router();

publicSpacesRouter.route("/spaces").get(listPublicSpacesController);
publicSpacesRouter.route("/spaces/:spaceId").get(getPublicSpaceByIdController);
