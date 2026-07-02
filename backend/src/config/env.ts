type Env = {
	NODE_ENV: "development" | "production" | "test";
	PORT: number;
	CORS_ORIGIN: string;
	DATABASE_URL: string;
	JWT_SECRET: string;
	JWT_EXPIRES_IN: string;
};

const DEVELOPMENT_DATABASE_URL =
	"postgresql://postgres:postgres@localhost:5432/roomfull?schema=public";
const DEVELOPMENT_JWT_SECRET = "roomfull-dev-secret-change-me";

function parsePort(value: string | undefined, fallback: number): number {
	if (!value) {
		return fallback;
	}

	const parsed = Number(value);
	if (!Number.isInteger(parsed) || parsed <= 0) {
		throw new Error("Ungültige Umgebungsvariable PORT");
	}

	return parsed;
}

function requireString(value: string | undefined, envName: string): string {
	const candidate = value?.trim();
	if (!candidate) {
		throw new Error(`Umgebungsvariable ${envName} fehlt`);
	}

	return candidate;
}

function parseUrl(
	value: string | undefined,
	envName: string,
	fallback?: string,
): string {
	const candidate = fallback
		? value?.trim() || fallback
		: requireString(value, envName);

	try {
		// eslint-disable-next-line no-new
		new URL(candidate);
		return candidate;
	} catch {
		throw new Error(`Ungültige Umgebungsvariable ${envName}`);
	}
}

function parseString(
	value: string | undefined,
	envName: string,
	minLength = 1,
	fallback?: string,
): string {
	const candidate = fallback
		? value?.trim() || fallback
		: requireString(value, envName);
	if (candidate.length < minLength) {
		throw new Error(`Ungültige Umgebungsvariable ${envName}`);
	}

	return candidate;
}

export function loadEnv(source: NodeJS.ProcessEnv): Env {
	const nodeEnv =
		source.NODE_ENV === "production" || source.NODE_ENV === "test"
			? source.NODE_ENV
			: "development";
	const isProduction = nodeEnv === "production";

	return {
		NODE_ENV: nodeEnv,
		PORT: parsePort(source.PORT, 4000),
		CORS_ORIGIN: parseUrl(
			source.CORS_ORIGIN,
			"CORS_ORIGIN",
			isProduction ? undefined : "http://localhost:3000",
		),
		DATABASE_URL: parseString(
			source.DATABASE_URL,
			"DATABASE_URL",
			1,
			isProduction ? undefined : DEVELOPMENT_DATABASE_URL,
		),
		JWT_SECRET: parseString(
			source.JWT_SECRET,
			"JWT_SECRET",
			16,
			isProduction ? undefined : DEVELOPMENT_JWT_SECRET,
		),
		JWT_EXPIRES_IN: parseString(
			source.JWT_EXPIRES_IN,
			"JWT_EXPIRES_IN",
			1,
			"1h",
		),
	};
}

export const env: Env = loadEnv(process.env);
