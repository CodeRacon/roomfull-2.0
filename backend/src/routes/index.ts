import { Router } from "express";
import { adminUnitsRouter } from "./admin-units.routes.js";
import { authRouter } from "./auth.routes.js";
import { bookingsRouter } from "./bookings.routes.js";
import { publicUnitsRouter } from "./public-units.routes.js";

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/public", publicUnitsRouter);
apiRouter.use("/admin", adminUnitsRouter);
apiRouter.use("/", bookingsRouter);
