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
