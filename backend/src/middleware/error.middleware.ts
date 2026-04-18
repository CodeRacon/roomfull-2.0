import { NextFunction, Request, Response } from "express";
import { AppError } from "../lib/app-error.js";

export function errorMiddleware(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (error instanceof AppError) {
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
