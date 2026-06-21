import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicBookingOptions } from "@/entities/booking-option";
import { getDictionary, isLocale } from "@/shared/i18n";
import { BookingOptionsList } from "@/widgets/booking-options-list";

type BookingOptionsPageProps = {
	params: Promise<{ lang: string }>;
};

async function getLocaleFromParams(params: BookingOptionsPageProps["params"]) {
	const { lang } = await params;

	if (!isLocale(lang)) {
		notFound();
	}

	return lang;
}

export async function generateMetadata({
	params,
}: BookingOptionsPageProps): Promise<Metadata> {
	const locale = await getLocaleFromParams(params);
	const dictionary = await getDictionary(locale);

	return dictionary.bookingOptionsPage.metadata;
}

export default async function BookingOptionsPage({
	params,
}: BookingOptionsPageProps) {
	const locale = await getLocaleFromParams(params);
	const [dictionary, bookingOptions] = await Promise.all([
		getDictionary(locale),
		getPublicBookingOptions(),
	]);

	return (
		<main className="min-h-[calc(100svh-4.5rem)] bg-background px-4 py-6 text-text md:px-6">
			<div className="mx-auto w-full max-w-7xl">
				<h1 className="type-display-page max-w-4xl">
					{dictionary.bookingOptionsPage.title}
				</h1>

				<p className="type-body-lead mt-5 max-w-2xl text-muted">
					{dictionary.bookingOptionsPage.intro}
				</p>

				<BookingOptionsList
					bookingOptions={bookingOptions}
					copy={dictionary.bookingOptionsPage}
					locale={locale}
				/>
			</div>
		</main>
	);
}
