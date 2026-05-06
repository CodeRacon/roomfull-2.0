import type { Unit } from "@/entities/unit";

type UnitsListProps = {
	units: Unit[];
};

export function UnitsList({ units }: UnitsListProps) {
	if (units.length === 0) {
		return <p>Keine Units verfügbar.</p>;
	}

	return (
		<section>
			{units.map((unit) => (
				<article key={unit.id}>
					<h2>{unit.name}</h2>
					<p>{unit.description}</p>
					<p>Kapazität: {unit.capacity}</p>
				</article>
			))}
		</section>
	);
}
