import { readFileSync } from "node:fs";
import path from "node:path";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env.js";
import { errorMiddleware } from "./middleware/error.middleware.js";
import { apiRouter } from "./routes/index.js";

export const app = express();

app.set("trust proxy", env.NODE_ENV === "production" ? 1 : false);
app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (_req, res) => res.json({ ok: true }));
app.use(
	"/docs",
	swaggerUi.serve,
	swaggerUi.setup(loadOpenApiDocument(), { explorer: true }),
);
app.use("/api", apiRouter);
app.use(errorMiddleware);

function loadOpenApiDocument(): Record<string, unknown> {
	const candidatePaths = [
		path.resolve(process.cwd(), "openapi.json"),
		path.resolve(process.cwd(), "backend/openapi.json"),
	];

	for (const candidatePath of candidatePaths) {
		try {
			const raw = readFileSync(candidatePath, "utf8");
			return JSON.parse(raw) as Record<string, unknown>;
		} catch {
			// ignore and try next path
		}
	}

	throw new Error("openapi.json konnte nicht geladen werden");
}
