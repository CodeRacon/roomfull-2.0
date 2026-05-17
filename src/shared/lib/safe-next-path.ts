const DEFAULT_NEXT_PATH = "/";
const INTERNAL_URL_ORIGIN = "https://roomfull.local";

export function getSafeNextPath(
	value: string | null | undefined,
	fallback = DEFAULT_NEXT_PATH,
): string {
	const nextPath = value?.trim();

	if (!nextPath?.startsWith("/") || nextPath.startsWith("//")) {
		return fallback;
	}

	if (nextPath.includes("\\")) {
		return fallback;
	}

	try {
		const parsedUrl = new URL(nextPath, INTERNAL_URL_ORIGIN);

		if (parsedUrl.origin !== INTERNAL_URL_ORIGIN) {
			return fallback;
		}

		if (parsedUrl.pathname === "/login" || parsedUrl.pathname === "/register") {
			return fallback;
		}

		return `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
	} catch {
		return fallback;
	}
}
