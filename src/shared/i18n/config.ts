export const locales = ["de", "en"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "de";

export const localeCookieName = "roomfull_locale";

const localeSet = new Set<string>(locales);

export function isLocale(value: string | null | undefined): value is Locale {
	return typeof value === "string" && localeSet.has(value);
}

export function parseLocale(value: string | null | undefined): Locale | null {
	return isLocale(value) ? value : null;
}
