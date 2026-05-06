"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = errorMiddleware;
const app_error_js_1 = require("../lib/app-error.js");
function errorMiddleware(error, _req, res, _next) {
    if (error instanceof app_error_js_1.AppError) {
        res.status(error.statusCode).json({
            error: {
                message: error.message,
                details: error.details ?? null,
            },
        });
        return;
    }
    console.error(error);
    res.status(500).json({
        error: {
            message: "Internal Server Error",
        },
    });
}
