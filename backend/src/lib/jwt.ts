import type { UserRole } from "@prisma/client";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

type AccessTokenPayload = {
	role: UserRole;
};

export type AuthContext = {
	userId: string;
	role: UserRole;
};

export function signAccessToken(context: AuthContext): string {
	const expiresIn = env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"];

	return jwt.sign(
		{ role: context.role } satisfies AccessTokenPayload,
		env.JWT_SECRET,
		{
			subject: context.userId,
			expiresIn,
		},
	);
}

export function verifyAccessToken(token: string): AuthContext {
	const decoded = jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload &
		AccessTokenPayload;

	if (!decoded.sub || !decoded.role) {
		throw new Error("Invalid access token payload");
	}

	return {
		userId: decoded.sub,
		role: decoded.role,
	};
}
