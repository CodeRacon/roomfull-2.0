const DEFAULT_API_BASE_URL = "http://localhost:4000/api";

export function getApiBaseUrl(): string {
	const configuredApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
	return configuredApiBaseUrl || DEFAULT_API_BASE_URL;
}

export function buildApiUrl(path: string): string {
	const baseUrl = getApiBaseUrl();

	const normalizedBaseUrl = baseUrl.endsWith("/")
		? baseUrl.slice(0, -1)
		: baseUrl;

	const normalizedPath = path.startsWith("/") ? path : `/${path}`;

	return `${normalizedBaseUrl}${normalizedPath}`;
}

export class ApiRequestError extends Error {
	constructor(
		message: string,
		public readonly status: number,
	) {
		super(message);
		this.name = "ApiRequestError";
	}
}

type AuthTokenResolver = () => string | null;

let authTokenResolver: AuthTokenResolver | null = null;

export function setApiAuthTokenResolver(resolver: AuthTokenResolver): void {
	authTokenResolver = resolver;
}

function getAuthHeaders(): HeadersInit {
	const token = authTokenResolver?.() ?? null;

	if (!token) {
		throw new ApiRequestError("Bitte melde dich erneut an.", 401);
	}

	return {
		Authorization: `Bearer ${token}`,
	};
}

async function readApiErrorMessage(
	response: Response,
	fallback: string,
): Promise<string> {
	try {
		const data = (await response.json()) as { error?: { message?: string } };
		return data.error?.message ?? fallback;
	} catch {
		return fallback;
	}
}

export async function apiGet<TResponse>(
	path: string,
	init?: RequestInit,
): Promise<TResponse> {
	const response = await fetch(buildApiUrl(path), init);

	if (!response.ok) {
		const message = await readApiErrorMessage(
			response,
			`API request failed with status ${response.status}`,
		);

		throw new ApiRequestError(message, response.status);
	}

	const data = (await response.json()) as TResponse;
	return data;
}

export async function apiGetAuthenticated<TResponse>(
	path: string,
	init?: RequestInit,
): Promise<TResponse> {
	return apiGet<TResponse>(path, {
		...init,
		headers: {
			...getAuthHeaders(),
			...init?.headers,
		},
	});
}

export async function apiPost<TResponse>(
	path: string,
	body: unknown,
	init?: RequestInit,
): Promise<TResponse> {
	const response = await fetch(buildApiUrl(path), {
		...init,
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			...init?.headers,
		},
		body: JSON.stringify(body),
	});

	if (!response.ok) {
		const message = await readApiErrorMessage(
			response,
			`API request failed with status ${response.status}`,
		);

		throw new ApiRequestError(message, response.status);
	}

	const data = (await response.json()) as TResponse;
	return data;
}

export async function apiPostAuthenticated<TResponse>(
	path: string,
	body: unknown,
	init?: RequestInit,
): Promise<TResponse> {
	return apiPost<TResponse>(path, body, {
		...init,
		headers: {
			...getAuthHeaders(),
			...init?.headers,
		},
	});
}

export async function apiDelete<TResponse>(
	path: string,
	init?: RequestInit,
): Promise<TResponse> {
	const response = await fetch(buildApiUrl(path), {
		...init,
		method: "DELETE",
	});

	if (!response.ok) {
		const message = await readApiErrorMessage(
			response,
			`API request failed with status ${response.status}`,
		);

		throw new ApiRequestError(message, response.status);
	}

	const data = (await response.json()) as TResponse;
	return data;
}

export async function apiDeleteAuthenticated<TResponse>(
	path: string,
	init?: RequestInit,
): Promise<TResponse> {
	return apiDelete<TResponse>(path, {
		...init,
		headers: {
			...getAuthHeaders(),
			...init?.headers,
		},
	});
}
