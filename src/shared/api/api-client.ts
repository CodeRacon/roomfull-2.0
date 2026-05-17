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

export async function apiGet<TResponse>(
	path: string,
	init?: RequestInit,
): Promise<TResponse> {
	const response = await fetch(buildApiUrl(path), init);

	if (!response.ok) {
		throw new Error(`API request failed with status ${response.status}`);
	}

	const data = (await response.json()) as TResponse;
	return data;
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
		let message = `API request failed with status ${response.status}`;

		try {
			const data = (await response.json()) as { error?: { message?: string } };
			message = data.error?.message ?? message;
		} catch {
			// Keep generic fallback when the API does not return JSON.
		}

		throw new ApiRequestError(message, response.status);
	}

	const data = (await response.json()) as TResponse;
	return data;
}
