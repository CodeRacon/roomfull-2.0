import { Router } from "express";
import { adminSpacesRouter } from "./admin-spaces.routes.js";
import { authRouter } from "./auth.routes.js";
import { publicSpacesRouter } from "./public-spaces.routes.js";

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/public", publicSpacesRouter);
apiRouter.use("/admin", adminSpacesRouter);
