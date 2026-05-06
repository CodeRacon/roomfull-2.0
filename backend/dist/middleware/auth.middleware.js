"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
exports.requireRole = requireRole;
const app_error_js_1 = require("../lib/app-error.js");
const jwt_js_1 = require("../lib/jwt.js");
function requireAuth(req, _res, next) {
    const authorizationHeader = req.header("authorization");
    if (!authorizationHeader?.startsWith("Bearer ")) {
        next(new app_error_js_1.AppError(401, "Authorization Header fehlt oder ist ungültig"));
        return;
    }
    const token = authorizationHeader.replace("Bearer ", "").trim();
    try {
        req.auth = (0, jwt_js_1.verifyAccessToken)(token);
        next();
    }
    catch {
        next(new app_error_js_1.AppError(401, "Access Token ist ungültig oder abgelaufen"));
    }
}
function requireRole(role) {
    return (req, _res, next) => {
        if (!req.auth) {
            next(new app_error_js_1.AppError(401, "Nicht authentifiziert"));
            return;
        }
        if (req.auth.role !== role) {
            next(new app_error_js_1.AppError(403, "Zugriff verweigert"));
            return;
        }
        next();
    };
}
