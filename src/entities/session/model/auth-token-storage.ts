const AUTH_TOKEN_STORAGE_KEY = "roomfull.authToken";

export function saveAuthToken(token: string): void {
	window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
}

export function getAuthToken(): string | null {
	return window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
}

export function clearAuthToken(): void {
	window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
}
