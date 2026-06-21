import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicUnitById } from "@/entities/unit";
import { isLocale } from "@/shared/i18n";
import { Button } from "@/shared/ui";

type UnitDetailsPageProps = {
	params: Promise<{ lang: string; unitId: string }>;
};

export default async function UnitDetailsPage({
	params,
}: UnitDetailsPageProps) {
	const { lang, unitId } = await params;

	if (!isLocale(lang)) {
		notFound();
	}

	const { name, description, capacity } = await getPublicUnitById(unitId, lang);

	return (
		<main className="min-h-screen bg-background px-6 py-10 text-text">
			<div className="mx-auto w-full max-w-5xl">
				<h1 className="text-3xl font-semibold tracking-tight text-text">
					{name}
				</h1>

				<p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
					{description}
				</p>
				<p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
					Kapazität: {capacity}
				</p>
				<Button className="mt-8">
					<Link href="/">Zurück zur Übersicht</Link>
				</Button>
			</div>
		</main>
	);
}
