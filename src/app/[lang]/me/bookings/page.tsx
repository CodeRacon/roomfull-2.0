import { Suspense } from "react";
import { getDictionary, isLocale } from "@/shared/i18n";
import { MyBookingsPageClient } from "./MyBookingsPageClient";

type MyBookingsPageProps = {
	params: Promise<{ lang: string }>;
};

export default async function MyBookingsPage({ params }: MyBookingsPageProps) {
	const { lang } = await params;
	const locale = isLocale(lang) ? lang : "de";
	const dictionary = await getDictionary(locale);
	const copy = dictionary.myBookings;

	return (
		<main className="min-h-[calc(100svh-4.5rem)] bg-background px-4 py-6 text-text md:px-6">
			<div className="mx-auto w-full max-w-7xl">
				<h1 className="type-display-page max-w-4xl">{copy.page.title}</h1>
				<p className="type-body-lead mt-5 max-w-2xl text-muted">
					{copy.page.intro}
				</p>
				<Suspense
					fallback={
						<p className="mt-8 bg-primary/10 px-3 py-2 text-sm font-semibold text-muted">
							{copy.page.preparing}
						</p>
					}
				>
					<MyBookingsPageClient copy={copy} locale={locale} />
				</Suspense>
			</div>
		</main>
	);
}
