import { type Locale, localeCookieName } from "@/shared/i18n";

const localeCookieMaxAgeSeconds = 60 * 60 * 24 * 365;

export function setLocaleCookie(locale: Locale): void {
	// biome-ignore lint/suspicious/noDocumentCookie: Language choice must be written synchronously before client navigation.
	document.cookie = `${localeCookieName}=${locale}; Path=/; Max-Age=${localeCookieMaxAgeSeconds}; SameSite=Lax`;
}
