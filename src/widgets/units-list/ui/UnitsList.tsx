import type { Unit } from "@/entities/unit";

type UnitsListProps = {
	units: Unit[];
};

export function UnitsList({ units }: UnitsListProps) {
	if (units.length === 0) {
		return (
			<p className="mt-8 rounded-md border border-dashed border-slate-300 bg-white px-4 py-6 text-sm text-slate-600">
				Keine Units verfügbar.
			</p>
		);
	}

	return (
		<section className="mt-8 grid gap-4 sm:grid-cols-2">
			{units.map((unit) => (
				<article
					key={unit.id}
					className="rounded-md border border-slate-200 bg-white p-5 shadow-xs"
				>
					<h2 className="text-lg font-medium text-slate-950">{unit.name}</h2>
					<p className="mt-2 text-sm leading-6 text-slate-600">
						{unit.description}
					</p>
					<p className="mt-4 text-sm font-medium text-slate-700">
						Kapazität: {unit.capacity}
					</p>
				</article>
			))}
		</section>
	);
}
