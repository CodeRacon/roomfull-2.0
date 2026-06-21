import { type NextRequest, NextResponse } from "next/server";
import { getPreferredLocale, isLocale, localeCookieName } from "@/shared/i18n";
import { localizedPath } from "@/shared/routing";

function shouldSkipLocaleRedirect(pathname: string): boolean {
	return (
		pathname.startsWith("/_next") ||
		pathname.startsWith("/api") ||
		pathname.startsWith("/logo") ||
		pathname.startsWith("/images") ||
		pathname === "/favicon.ico" ||
		pathname.includes(".")
	);
}

export function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl;
	const firstSegment = pathname.split("/")[1];

	if (shouldSkipLocaleRedirect(pathname) || isLocale(firstSegment)) {
		return NextResponse.next();
	}

	const locale = getPreferredLocale({
		acceptLanguage: request.headers.get("accept-language"),
		cookieLocale: request.cookies.get(localeCookieName)?.value,
	});
	const redirectUrl = request.nextUrl.clone();
	redirectUrl.pathname = localizedPath(locale, pathname);

	return NextResponse.redirect(redirectUrl);
}
