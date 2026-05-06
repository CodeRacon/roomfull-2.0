"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUser = registerUser;
exports.loginUser = loginUser;
exports.getCurrentUser = getCurrentUser;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const user_repository_js_1 = require("../db/user.repository.js");
const app_error_js_1 = require("../lib/app-error.js");
const jwt_js_1 = require("../lib/jwt.js");
const PASSWORD_HASH_ROUNDS = 12;
const INVALID_LOGIN_MESSAGE = "Ungültige Login-Daten";
const EMAIL_ALREADY_REGISTERED_MESSAGE = "E-Mail ist bereits registriert";
function normalizeEmail(email) {
    return email.trim().toLowerCase();
}
async function registerUser(input) {
    const name = input.name.trim();
    const email = normalizeEmail(input.email);
    if (name.length === 0) {
        throw new app_error_js_1.AppError(400, "Name darf nicht leer sein");
    }
    if (input.password.length < 8) {
        throw new app_error_js_1.AppError(400, "Passwort muss mindestens 8 Zeichen lang sein");
    }
    const existingUser = await (0, user_repository_js_1.findUserByEmail)(email);
    if (existingUser) {
        throw new app_error_js_1.AppError(409, EMAIL_ALREADY_REGISTERED_MESSAGE);
    }
    const passwordHash = await bcryptjs_1.default.hash(input.password, PASSWORD_HASH_ROUNDS);
    let createdUser;
    try {
        createdUser = await (0, user_repository_js_1.createUser)({
            name,
            email,
            passwordHash,
        });
    }
    catch (error) {
        if ((0, user_repository_js_1.isUniqueEmailViolation)(error)) {
            throw new app_error_js_1.AppError(409, EMAIL_ALREADY_REGISTERED_MESSAGE);
        }
        throw error;
    }
    return buildAuthResponse(createdUser);
}
async function loginUser(input) {
    const email = normalizeEmail(input.email);
    const existingUser = await (0, user_repository_js_1.findUserByEmail)(email);
    if (!existingUser) {
        throw new app_error_js_1.AppError(401, INVALID_LOGIN_MESSAGE);
    }
    const isPasswordValid = await bcryptjs_1.default.compare(input.password, existingUser.passwordHash);
    if (!isPasswordValid) {
        throw new app_error_js_1.AppError(401, INVALID_LOGIN_MESSAGE);
    }
    return buildAuthResponse(existingUser);
}
async function getCurrentUser(userId) {
    const user = await (0, user_repository_js_1.findUserById)(userId);
    if (!user) {
        throw new app_error_js_1.AppError(404, "User wurde nicht gefunden");
    }
    return toPublicUser(user);
}
function buildAuthResponse(user) {
    return {
        token: (0, jwt_js_1.signAccessToken)({
            userId: user.id,
            role: user.role,
        }),
        user: toPublicUser(user),
    };
}
function toPublicUser(user) {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
    };
}
