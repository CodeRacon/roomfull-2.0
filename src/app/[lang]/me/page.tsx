import { redirect } from "next/navigation";
import { isLocale } from "@/shared/i18n";
import { appRoutes } from "@/shared/routing";

type MePageProps = {
	params: Promise<{ lang: string }>;
};

export default async function MePage({ params }: MePageProps) {
	const { lang } = await params;

	if (!isLocale(lang)) {
		redirect(appRoutes.myBookings("de"));
	}

	redirect(appRoutes.myBookings(lang));
}
