import { getDictionary, isLocale } from "@/shared/i18n";
import { AdminNavigation } from "@/widgets/admin-navigation";
import { AdminDashboardPageClient } from "./AdminDashboardPageClient";

type AdminPageProps = {
	params: Promise<{ lang: string }>;
};

export default async function AdminPage({ params }: AdminPageProps) {
	const { lang } = await params;
	const locale = isLocale(lang) ? lang : "de";
	const dictionary = await getDictionary(locale);
	const copy = dictionary.adminShell;

	return (
		<main className="min-h-screen bg-background px-5 py-8 text-text sm:px-6 lg:py-12">
			<div className="mx-auto w-full max-w-5xl">
				<header className="border-b-2 border-primary pb-6">
					<p className="text-xs font-bold uppercase text-primary">
						{copy.page.eyebrow}
					</p>
					<h1 className="mt-3 max-w-3xl text-5xl font-black leading-none text-pretty text-text sm:text-6xl">
						{copy.page.title}
					</h1>
					<p className="mt-4 max-w-2xl text-base leading-7 text-muted">
						{copy.page.description}
					</p>
				</header>
				<AdminNavigation copy={copy.navigation} locale={locale} />
				<AdminDashboardPageClient copy={copy.analytics} />
			</div>
		</main>
	);
}
