import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { getDictionary, isLocale, locales } from "@/shared/i18n";
import { Footer } from "@/widgets/footer";
import { Header } from "@/widgets/header";

type LocaleLayoutProps = {
	children: ReactNode;
	params: Promise<unknown>;
};

export function generateStaticParams() {
	return locales.map((lang) => ({ lang }));
}

export default async function LocaleLayout({
	children,
	params,
}: LocaleLayoutProps) {
	const resolvedParams = await params;
	const lang =
		typeof resolvedParams === "object" &&
		resolvedParams !== null &&
		"lang" in resolvedParams &&
		typeof resolvedParams.lang === "string"
			? resolvedParams.lang
			: null;

	if (!isLocale(lang)) {
		notFound();
	}

	const dictionary = await getDictionary(lang);

	return (
		<>
			<Header
				copy={dictionary.navigation}
				languageSwitcherCopy={dictionary.languageSwitcher}
				locale={lang}
			/>
			{children}
			<Footer copy={dictionary.navigation} locale={lang} />
		</>
	);
}
