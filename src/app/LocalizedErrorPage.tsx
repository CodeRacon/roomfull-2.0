"use client";

import { usePathname } from "next/navigation";
import { defaultLocale, type Locale, parseLocale } from "@/shared/i18n";
import { de } from "@/shared/i18n/dictionaries/de";
import { en } from "@/shared/i18n/dictionaries/en";
import { appRoutes } from "@/shared/routing";
import { ErrorPage } from "@/shared/ui";

const dictionaries = {
	de,
	en,
} satisfies Record<Locale, typeof de>;

type ErrorPageKind = "notFound" | "internal";

type LocalizedErrorPageProps = {
	kind: ErrorPageKind;
};

export function LocalizedErrorPage({ kind }: LocalizedErrorPageProps) {
	const pathname = usePathname();
	const locale = parseLocale(pathname.split("/")[1]) ?? defaultLocale;
	const copy = dictionaries[locale].errorPages[kind];
	const statusCode = kind === "notFound" ? 404 : 500;

	return (
		<ErrorPage
			statusCode={statusCode}
			title={copy.title}
			description={copy.description}
			actionLabel={copy.actionLabel}
			actionHref={appRoutes.home(locale)}
		/>
	);
}
