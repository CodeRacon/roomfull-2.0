import { NextFunction, Request, Response } from "express";
import { AppError } from "../lib/app-error.js";
import { verifyAccessToken } from "../lib/jwt.js";

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const authorizationHeader = req.header("authorization");

  if (!authorizationHeader?.startsWith("Bearer ")) {
    next(new AppError(401, "Authorization Header fehlt oder ist ungültig"));
    return;
  }

  const token = authorizationHeader.replace("Bearer ", "").trim();

  try {
    req.auth = verifyAccessToken(token);
    next();
  } catch {
    next(new AppError(401, "Access Token ist ungültig oder abgelaufen"));
  }
}
