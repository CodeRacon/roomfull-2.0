import Link from "next/link";
import { getPublicUnitById } from "@/entities/unit";

type UnitDetailsPageProps = {
	params: Promise<{ unitId: string }>;
};

export default async function UnitDetailsPage({
	params,
}: UnitDetailsPageProps) {
	const { unitId } = await params;
	const { name, description, capacity } = await getPublicUnitById(unitId);

	return (
		<main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-950">
			<div className="mx-auto w-full max-w-5xl">
				<h1 className="text-3xl font-semibold tracking-tight text-slate-950">
					{name}
				</h1>

				<p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
					{description}
				</p>
				<p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
					Kapazität: {capacity}
				</p>
				<Link
					href="/"
					className="inline-block mt-8 text-sm font-medium text-slate-600 hover:text-slate-950 hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
				>
					Zurück zur Übersicht
				</Link>
			</div>
		</main>
	);
}
