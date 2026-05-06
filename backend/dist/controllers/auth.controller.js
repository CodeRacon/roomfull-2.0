"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerController = registerController;
exports.loginController = loginController;
exports.meController = meController;
const app_error_js_1 = require("../lib/app-error.js");
const auth_service_js_1 = require("../services/auth.service.js");
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INVALID_BODY_MESSAGE = "Ungültiger Request Body";
const UNAUTHORIZED_MESSAGE = "Nicht eingeloggt";
function isRecord(value) {
    return typeof value === "object" && value !== null;
}
function fail(next, statusCode, message) {
    next(new app_error_js_1.AppError(statusCode, message));
}
function parseAuthUserId(auth) {
    const userId = auth?.userId?.trim() ?? "";
    return userId.length > 0 ? userId : null;
}
function parseRegisterBody(body) {
    if (!isRecord(body)) {
        return null;
    }
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (name.length === 0 || !EMAIL_REGEX.test(email) || password.length < 8) {
        return null;
    }
    return { name, email, password };
}
function parseLoginBody(body) {
    if (!isRecord(body)) {
        return null;
    }
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (!EMAIL_REGEX.test(email) || password.length === 0) {
        return null;
    }
    return { email, password };
}
async function registerController(req, res, next) {
    const input = parseRegisterBody(req.body);
    if (!input) {
        fail(next, 400, INVALID_BODY_MESSAGE);
        return;
    }
    try {
        const authResponse = await (0, auth_service_js_1.registerUser)(input);
        res.status(201).json(authResponse);
    }
    catch (error) {
        next(error);
    }
}
async function loginController(req, res, next) {
    const input = parseLoginBody(req.body);
    if (!input) {
        fail(next, 400, INVALID_BODY_MESSAGE);
        return;
    }
    try {
        const authResponse = await (0, auth_service_js_1.loginUser)(input);
        res.status(200).json(authResponse);
    }
    catch (error) {
        next(error);
    }
}
async function meController(req, res, next) {
    const userId = parseAuthUserId(req.auth);
    if (!userId) {
        fail(next, 401, UNAUTHORIZED_MESSAGE);
        return;
    }
    try {
        const user = await (0, auth_service_js_1.getCurrentUser)(userId);
        res.status(200).json({ user });
    }
    catch (error) {
        next(error);
    }
}
