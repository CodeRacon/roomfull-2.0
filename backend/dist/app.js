"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const node_fs_1 = require("node:fs");
const node_path_1 = __importDefault(require("node:path"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const env_js_1 = require("./config/env.js");
const error_middleware_js_1 = require("./middleware/error.middleware.js");
const index_js_1 = require("./routes/index.js");
exports.app = (0, express_1.default)();
exports.app.use((0, helmet_1.default)());
exports.app.use((0, cors_1.default)({ origin: env_js_1.env.CORS_ORIGIN, credentials: true }));
exports.app.use(express_1.default.json());
exports.app.use((0, morgan_1.default)("dev"));
exports.app.get("/health", (_req, res) => res.json({ ok: true }));
exports.app.use("/docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(loadOpenApiDocument(), { explorer: true }));
exports.app.use("/api", index_js_1.apiRouter);
exports.app.use(error_middleware_js_1.errorMiddleware);
function loadOpenApiDocument() {
    const candidatePaths = [
        node_path_1.default.resolve(process.cwd(), "openapi.json"),
        node_path_1.default.resolve(process.cwd(), "backend/openapi.json"),
    ];
    for (const candidatePath of candidatePaths) {
        try {
            const raw = (0, node_fs_1.readFileSync)(candidatePath, "utf8");
            return JSON.parse(raw);
        }
        catch {
            // ignore and try next path
        }
    }
    throw new Error("openapi.json konnte nicht geladen werden");
}
