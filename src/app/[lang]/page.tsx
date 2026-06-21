import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicBookingOptions } from "@/entities/booking-option";
import { getDictionary, isLocale } from "@/shared/i18n";
import { HomePageClient } from "../HomePageClient";

type HomePageProps = {
	params: Promise<{ lang: string }>;
};

async function getLocaleFromParams(params: HomePageProps["params"]) {
	const { lang } = await params;

	if (!isLocale(lang)) {
		notFound();
	}

	return lang;
}

export async function generateMetadata({
	params,
}: HomePageProps): Promise<Metadata> {
	const locale = await getLocaleFromParams(params);
	const dictionary = await getDictionary(locale);

	return dictionary.home.metadata;
}

export default async function HomePage({ params }: HomePageProps) {
	const locale = await getLocaleFromParams(params);
	const [dictionary, bookingOptions] = await Promise.all([
		getDictionary(locale),
		getPublicBookingOptions(),
	]);

	return (
		<HomePageClient
			bookingOptions={bookingOptions}
			copy={dictionary.home}
			locale={locale}
		/>
	);
}
