import { Router } from "express";
import {
	demoLoginController,
	loginController,
	logoutController,
	meController,
	registerController,
} from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { authRateLimit } from "../middleware/rate-limit.middleware.js";

export const authRouter = Router();

authRouter.route("/register").post(authRateLimit, registerController);
authRouter.route("/login").post(authRateLimit, loginController);
authRouter.route("/demo-login").post(authRateLimit, demoLoginController);
authRouter.route("/logout").post(logoutController);
authRouter.route("/me").get(requireAuth, meController);
