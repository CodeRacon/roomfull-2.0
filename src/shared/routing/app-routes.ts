import { defaultLocale, isLocale, type Locale } from "@/shared/i18n";

const internalUrlOrigin = "https://roomfull.local";

type QueryValue = string | number | boolean | null | undefined;

function isSpecialPath(path: string): boolean {
	return (
		path.startsWith("http://") ||
		path.startsWith("https://") ||
		path.startsWith("mailto:") ||
		path.startsWith("tel:") ||
		path.startsWith("#") ||
		path.startsWith("/api") ||
		path.startsWith("/_next") ||
		path.startsWith("/logo") ||
		path.startsWith("/images") ||
		path.startsWith("/favicon")
	);
}

function normalizeAppPath(path: string): string {
	const trimmedPath = path.trim();

	if (trimmedPath === "") {
		return "/";
	}

	return trimmedPath.startsWith("/") ? trimmedPath : `/${trimmedPath}`;
}

function stripLocaleSegment(pathname: string): string {
	const [, firstSegment, ...restSegments] = pathname.split("/");

	if (!isLocale(firstSegment)) {
		return pathname;
	}

	if (restSegments.length === 0) {
		return "/";
	}

	return `/${restSegments.join("/")}`;
}

function appendQuery(path: string, query?: URLSearchParams): string {
	const queryString = query?.toString();

	return queryString ? `${path}?${queryString}` : path;
}

function createQuery(values: Record<string, QueryValue>): URLSearchParams {
	const query = new URLSearchParams();

	for (const [key, value] of Object.entries(values)) {
		if (value === null || value === undefined) {
			continue;
		}

		query.set(key, String(value));
	}

	return query;
}

export function localizedPath(locale: Locale, path = "/"): string {
	if (isSpecialPath(path)) {
		return path;
	}

	const appPath = normalizeAppPath(path);
	const parsedUrl = new URL(appPath, internalUrlOrigin);
	const pathnameWithoutLocale = stripLocaleSegment(parsedUrl.pathname);
	const localizedPathname =
		pathnameWithoutLocale === "/"
			? `/${locale}`
			: `/${locale}${pathnameWithoutLocale}`;

	return `${localizedPathname}${parsedUrl.search}${parsedUrl.hash}`;
}

export function switchLocalePath(locale: Locale, path: string): string {
	return localizedPath(locale, path);
}

export function isLocalizedPath(path: string | null | undefined): boolean {
	const nextPath = path?.trim();

	if (!nextPath?.startsWith("/") || nextPath.startsWith("//")) {
		return false;
	}

	if (nextPath.includes("\\")) {
		return false;
	}

	try {
		const parsedUrl = new URL(nextPath, internalUrlOrigin);

		if (parsedUrl.origin !== internalUrlOrigin) {
			return false;
		}

		const firstSegment = parsedUrl.pathname.split("/")[1];

		return isLocale(firstSegment);
	} catch {
		return false;
	}
}

export function getSafeLocalizedNextPath(
	value: string | null | undefined,
	locale: Locale = defaultLocale,
	fallback = appRoutes.home(locale),
): string {
	const nextPath = value?.trim();

	if (!nextPath || !isLocalizedPath(nextPath)) {
		return fallback;
	}

	const parsedUrl = new URL(nextPath, internalUrlOrigin);
	const pathnameWithoutLocale = stripLocaleSegment(parsedUrl.pathname);

	if (
		pathnameWithoutLocale === "/login" ||
		pathnameWithoutLocale === "/register" ||
		pathnameWithoutLocale.startsWith("/api")
	) {
		return fallback;
	}

	return `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
}

export const appRoutes = {
	home(locale: Locale): string {
		return localizedPath(locale, "/");
	},
	bookingOptions(locale: Locale): string {
		return localizedPath(locale, "/booking-options");
	},
	bookingOptionDetail(locale: Locale, slug: string): string {
		return localizedPath(locale, `/booking-options/${slug}`);
	},
	createBooking(
		locale: Locale,
		queryValues: Record<string, QueryValue> = {},
	): string {
		return appendQuery(
			localizedPath(locale, "/bookings/new"),
			createQuery(queryValues),
		);
	},
	login(locale: Locale, nextPath?: string): string {
		return appendQuery(
			localizedPath(locale, "/login"),
			createQuery({ next: nextPath }),
		);
	},
	register(locale: Locale, nextPath?: string): string {
		return appendQuery(
			localizedPath(locale, "/register"),
			createQuery({ next: nextPath }),
		);
	},
	admin(locale: Locale): string {
		return localizedPath(locale, "/admin");
	},
	adminBookings(locale: Locale): string {
		return localizedPath(locale, "/admin/bookings");
	},
	adminContactRequests(locale: Locale): string {
		return localizedPath(locale, "/admin/contact-requests");
	},
	adminUnits(locale: Locale): string {
		return localizedPath(locale, "/admin/units");
	},
	myBookings(locale: Locale): string {
		return localizedPath(locale, "/me/bookings");
	},
	account(locale: Locale): string {
		return localizedPath(locale, "/me/account");
	},
	contact(locale: Locale): string {
		return localizedPath(locale, "/me/contact");
	},
	faq(locale: Locale): string {
		return localizedPath(locale, "/faq");
	},
	privacy(locale: Locale): string {
		return localizedPath(locale, "/privacy");
	},
	unitDetail(locale: Locale, unitId: string): string {
		return localizedPath(locale, `/units/${unitId}`);
	},
} as const;
