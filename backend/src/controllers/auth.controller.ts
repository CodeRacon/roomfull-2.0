import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { AppError } from "../lib/app-error.js";
import {
  getCurrentUser,
  loginUser,
  registerUser,
} from "../services/auth.service.js";

const registerSchema = z.object({
  name: z.string().trim().min(1, "name is required"),
  email: z.string().trim().toLowerCase().email("email must be valid"),
  password: z.string().min(8, "password must have at least 8 characters"),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("email must be valid"),
  password: z.string().min(1, "password is required"),
});

export async function registerController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const parsed = registerSchema.safeParse(req.body);

  if (!parsed.success) {
    next(new AppError(400, "Ungültiger Request Body", parsed.error.flatten()));
    return;
  }

  try {
    const authResponse = await registerUser(parsed.data);
    res.status(201).json(authResponse);
  } catch (error) {
    next(error);
  }
}

export async function loginController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    next(new AppError(400, "Ungültiger Request Body", parsed.error.flatten()));
    return;
  }

  try {
    const authResponse = await loginUser(parsed.data);
    res.status(200).json(authResponse);
  } catch (error) {
    next(error);
  }
}

export async function meController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  if (!req.auth?.userId) {
    next(new AppError(401, "Nicht eingeloggt"));
    return;
  }

  try {
    const user = await getCurrentUser(req.auth.userId);
    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
}
