import type { Locale } from "./config";
import type { Dictionary } from "./dictionaries/de";

const dictionaries = {
	de: () => import("./dictionaries/de").then((module) => module.de),
	en: () => import("./dictionaries/en").then((module) => module.en),
} satisfies Record<Locale, () => Promise<Dictionary>>;

export async function getDictionary(locale: Locale): Promise<Dictionary> {
	return dictionaries[locale]();
}

export type { Dictionary };
