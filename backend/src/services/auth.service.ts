import bcrypt from "bcryptjs";
import { User } from "@prisma/client";
import {
  createUser,
  findUserByEmail,
  findUserById,
  isUniqueEmailViolation,
} from "../db/user.repository.js";
import { AppError } from "../lib/app-error.js";
import { signAccessToken } from "../lib/jwt.js";

type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

type LoginInput = {
  email: string;
  password: string;
};

type PublicUser = {
  id: string;
  name: string;
  email: string;
  role: User["role"];
  createdAt: Date;
};

type AuthResponse = {
  token: string;
  user: PublicUser;
};

export async function registerUser(input: RegisterInput): Promise<AuthResponse> {
  const existingUser = await findUserByEmail(input.email);

  if (existingUser) {
    throw new AppError(409, "E-Mail ist bereits registriert");
  }

  const passwordHash = await bcrypt.hash(input.password, 12);

  let createdUser: User;

  try {
    createdUser = await createUser({
      name: input.name,
      email: input.email,
      passwordHash,
    });
  } catch (error) {
    if (isUniqueEmailViolation(error)) {
      throw new AppError(409, "E-Mail ist bereits registriert");
    }

    throw error;
  }

  return buildAuthResponse(createdUser);
}

export async function loginUser(input: LoginInput): Promise<AuthResponse> {
  const existingUser = await findUserByEmail(input.email);

  if (!existingUser) {
    throw new AppError(401, "Ungültige Login-Daten");
  }

  const isPasswordValid = await bcrypt.compare(
    input.password,
    existingUser.passwordHash,
  );

  if (!isPasswordValid) {
    throw new AppError(401, "Ungültige Login-Daten");
  }

  return buildAuthResponse(existingUser);
}

export async function getCurrentUser(userId: string): Promise<PublicUser> {
  const user = await findUserById(userId);

  if (!user) {
    throw new AppError(404, "User wurde nicht gefunden");
  }

  return toPublicUser(user);
}

function buildAuthResponse(user: User): AuthResponse {
  return {
    token: signAccessToken({
      userId: user.id,
      role: user.role,
    }),
    user: toPublicUser(user),
  };
}

function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}
