export type ContentLocale = "de" | "en";

export const defaultContentLocale: ContentLocale = "de";

export function parseContentLocale(
	value: string | null | undefined,
): ContentLocale {
	return value === "en" || value === "de" ? value : defaultContentLocale;
}

export function resolveLocalizedDescription(
	input: {
		description: string | null;
		descriptionDe?: string | null;
		descriptionEn?: string | null;
	},
	locale: ContentLocale,
): string | null {
	const localizedDescription =
		locale === "en" ? input.descriptionEn : input.descriptionDe;

	return localizedDescription ?? input.description;
}
