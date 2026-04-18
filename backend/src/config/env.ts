import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(4000),
  CORS_ORIGIN: z.string().url().default("http://localhost:3000"),
  DATABASE_URL: z
    .string()
    .min(1)
    .default("postgresql://postgres:postgres@localhost:5432/roomfull?schema=public"),
  JWT_SECRET: z.string().min(16).default("roomfull-dev-secret-change-me"),
  JWT_EXPIRES_IN: z.string().min(1).default("1h"),
});

export const env = envSchema.parse(process.env);
