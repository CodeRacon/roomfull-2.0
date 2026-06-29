import { getDictionary, isLocale } from "@/shared/i18n";
import { TeamDetailPageClient } from "./TeamDetailPageClient";

type TeamDetailPageProps = {
	params: Promise<{ lang: string; teamId: string }>;
};

export default async function TeamDetailPage({ params }: TeamDetailPageProps) {
	const { lang, teamId } = await params;
	const locale = isLocale(lang) ? lang : "de";
	const dictionary = await getDictionary(locale);
	const copy = dictionary.myTeams.detail;

	return (
		<main className="min-h-[calc(100svh-4.5rem)] bg-background px-4 py-6 text-text md:px-6">
			<div className="mx-auto w-full max-w-7xl">
				<h1 className="type-display-page max-w-4xl">{copy.page.title}</h1>
				<p className="type-body-lead mt-5 max-w-3xl text-muted">
					{copy.page.intro}
				</p>
				<TeamDetailPageClient copy={copy} locale={locale} teamId={teamId} />
			</div>
		</main>
	);
}
