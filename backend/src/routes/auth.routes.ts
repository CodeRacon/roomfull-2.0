import { Router } from "express";
import {
	loginController,
	meController,
	registerController,
} from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

export const authRouter = Router();

authRouter.route("/register").post(registerController);
authRouter.route("/login").post(loginController);
authRouter.route("/me").get(requireAuth, meController);
