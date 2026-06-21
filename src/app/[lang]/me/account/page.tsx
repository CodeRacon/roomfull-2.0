import { getDictionary, isLocale } from "@/shared/i18n";
import { AccountPageClient } from "./AccountPageClient";

type AccountPageProps = {
	params: Promise<{ lang: string }>;
};

export default async function AccountPage({ params }: AccountPageProps) {
	const { lang } = await params;
	const locale = isLocale(lang) ? lang : "de";
	const dictionary = await getDictionary(locale);
	const copy = dictionary.account;

	return (
		<main className="min-h-screen bg-background px-6 py-10 text-text">
			<div className="mx-auto w-full max-w-5xl">
				<h1 className="type-section-title text-text">{copy.page.title}</h1>
				<AccountPageClient copy={copy} locale={locale} />
			</div>
		</main>
	);
}
