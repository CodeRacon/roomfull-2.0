type Env = {
	NODE_ENV: "development" | "production" | "test";
	PORT: number;
	CORS_ORIGIN: string;
	DATABASE_URL: string;
	JWT_SECRET: string;
	JWT_EXPIRES_IN: string;
};

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

function parseUrl(
	value: string | undefined,
	fallback: string,
	envName: string,
): string {
	const candidate = value?.trim() || fallback;

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
	fallback: string,
	envName: string,
	minLength = 1,
): string {
	const candidate = value?.trim() || fallback;
	if (candidate.length < minLength) {
		throw new Error(`Ungültige Umgebungsvariable ${envName}`);
	}

	return candidate;
}

export const env: Env = {
	NODE_ENV:
		process.env.NODE_ENV === "production" || process.env.NODE_ENV === "test"
			? process.env.NODE_ENV
			: "development",
	PORT: parsePort(process.env.PORT, 4000),
	CORS_ORIGIN: parseUrl(
		process.env.CORS_ORIGIN,
		"http://localhost:3000",
		"CORS_ORIGIN",
	),
	DATABASE_URL: parseString(
		process.env.DATABASE_URL,
		"postgresql://postgres:postgres@localhost:5432/roomfull?schema=public",
		"DATABASE_URL",
	),
	JWT_SECRET: parseString(
		process.env.JWT_SECRET,
		"roomfull-dev-secret-change-me",
		"JWT_SECRET",
		16,
	),
	JWT_EXPIRES_IN: parseString(
		process.env.JWT_EXPIRES_IN,
		"1h",
		"JWT_EXPIRES_IN",
	),
};
