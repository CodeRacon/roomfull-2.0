import { getPublicUnits } from "@/entities/unit";
import { UnitsList } from "@/widgets/units-list";

export default async function HomePage() {
	const units = await getPublicUnits();

	return (
		<main className="min-h-screen bg-background px-6 py-10 text-text">
			<div className="mx-auto w-full max-w-5xl">
				<h1 className="text-3xl font-semibold tracking-tight text-text">
					RoomFull 2.0
				</h1>

				<p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
					Aktive Arbeitsplätze und Räume, die aktuell im System buchbar sind.
				</p>

				<UnitsList units={units} />
			</div>
		</main>
	);
}
