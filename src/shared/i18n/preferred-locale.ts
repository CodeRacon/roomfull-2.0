import { defaultLocale, isLocale, type Locale, parseLocale } from "./config";

type PreferredLocaleInput = {
	acceptLanguage: string | null | undefined;
	cookieLocale: string | null | undefined;
};

type AcceptedLanguage = {
	locale: Locale;
	quality: number;
};

function parseAcceptedLanguage(value: string): AcceptedLanguage | null {
	const [rawLanguage, ...rawParameters] = value.trim().split(";");
	const locale = parseLocale(rawLanguage.toLowerCase().split("-")[0]);

	if (!locale) {
		return null;
	}

	const qualityParameter = rawParameters
		.map((parameter) => parameter.trim())
		.find((parameter) => parameter.startsWith("q="));
	const quality = qualityParameter
		? Number.parseFloat(qualityParameter.slice(2))
		: 1;

	if (!Number.isFinite(quality) || quality <= 0) {
		return null;
	}

	return { locale, quality };
}

export function getPreferredLocale({
	acceptLanguage,
	cookieLocale,
}: PreferredLocaleInput): Locale {
	if (isLocale(cookieLocale)) {
		return cookieLocale;
	}

	const acceptedLanguages =
		acceptLanguage
			?.split(",")
			.map(parseAcceptedLanguage)
			.filter((language): language is AcceptedLanguage => language !== null) ??
		[];

	const preferredLanguage = acceptedLanguages.toSorted(
		(firstLanguage, secondLanguage) =>
			secondLanguage.quality - firstLanguage.quality,
	)[0];

	return preferredLanguage?.locale ?? defaultLocale;
}
