"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signAccessToken = signAccessToken;
exports.verifyAccessToken = verifyAccessToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_js_1 = require("../config/env.js");
function signAccessToken(context) {
    const expiresIn = env_js_1.env.JWT_EXPIRES_IN;
    return jsonwebtoken_1.default.sign({ role: context.role }, env_js_1.env.JWT_SECRET, {
        subject: context.userId,
        expiresIn,
    });
}
function verifyAccessToken(token) {
    const decoded = jsonwebtoken_1.default.verify(token, env_js_1.env.JWT_SECRET);
    if (!decoded.sub || !decoded.role) {
        throw new Error("Invalid access token payload");
    }
    return {
        userId: decoded.sub,
        role: decoded.role,
    };
}
