import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { loadEnv } from "../src/config/env.js";

describe("Environment configuration", () => {
	it("keeps local development defaults for non-production runs", () => {
		const env = loadEnv({});

		assert.equal(env.NODE_ENV, "development");
		assert.equal(env.PORT, 4000);
		assert.equal(env.CORS_ORIGIN, "http://localhost:3000");
		assert.equal(
			env.DATABASE_URL,
			"postgresql://postgres:postgres@localhost:5432/roomfull?schema=public",
		);
		assert.equal(env.JWT_SECRET, "roomfull-dev-secret-change-me");
		assert.equal(env.JWT_EXPIRES_IN, "1h");
	});

	it("requires deployment secrets and origins in production", () => {
		assert.throws(
			() => loadEnv({ NODE_ENV: "production" }),
			/Umgebungsvariable CORS_ORIGIN fehlt/,
		);

		assert.throws(
			() =>
				loadEnv({
					NODE_ENV: "production",
					CORS_ORIGIN: "https://roomfull.michael-buschmann.dev",
				}),
			/Umgebungsvariable DATABASE_URL fehlt/,
		);

		assert.throws(
			() =>
				loadEnv({
					NODE_ENV: "production",
					CORS_ORIGIN: "https://roomfull.michael-buschmann.dev",
					DATABASE_URL: "postgresql://user:password@example.com:5432/db",
				}),
			/Umgebungsvariable JWT_SECRET fehlt/,
		);
	});
});
