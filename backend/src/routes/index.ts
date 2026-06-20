import { Router } from "express";
import { adminAnalyticsRouter } from "./admin-analytics.routes.js";
import { adminContactRequestsRouter } from "./admin-contact-requests.routes.js";
import { adminUnitsRouter } from "./admin-units.routes.js";
import { authRouter } from "./auth.routes.js";
import { bookingsRouter } from "./bookings.routes.js";
import { contactRequestsRouter } from "./contact-requests.routes.js";
import { publicUnitsRouter } from "./public-units.routes.js";

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/public", publicUnitsRouter);
apiRouter.use("/contact-requests", contactRequestsRouter);
apiRouter.use("/admin", adminAnalyticsRouter);
apiRouter.use("/admin", adminContactRequestsRouter);
apiRouter.use("/admin", adminUnitsRouter);
apiRouter.use("/", bookingsRouter);
