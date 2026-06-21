import { getDictionary, isLocale } from "@/shared/i18n";
import { ContactPageClient } from "./ContactPageClient";

type ContactPageProps = {
	params: Promise<{ lang: string }>;
};

export default async function ContactPage({ params }: ContactPageProps) {
	const { lang } = await params;
	const locale = isLocale(lang) ? lang : "de";
	const dictionary = await getDictionary(locale);
	const copy = dictionary.contact;

	return (
		<main className="min-h-screen bg-background px-6 py-10 text-text">
			<div className="mx-auto w-full max-w-5xl">
				<h1 className="type-section-title text-text">{copy.page.title}</h1>
				<ContactPageClient copy={copy} />
			</div>
		</main>
	);
}
