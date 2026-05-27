import Link from "next/link";
import { formatUnitTypeName, type Unit } from "@/entities/unit";
import { Badge, FeedbackBox, Panel } from "@/shared/ui";

type UnitsListProps = {
	units: Unit[];
};

export function UnitsList({ units }: UnitsListProps) {
	if (units.length === 0) {
		return (
			<FeedbackBox variant="empty" className="mt-8">
				Keine Units verfügbar.
			</FeedbackBox>
		);
	}

	return (
		<section className="mt-8 grid gap-4 sm:grid-cols-2">
			{units.map((unit) => (
				<Panel
					padding="compact"
					key={unit.id}
					className="rounded-md border border-border bg-surface p-5 shadow-xs"
				>
					<div className="flex justify-between">
						<h1 className="text-lg font-bold">
							<Link
								href={`/units/${unit.id}`}
								className="text-text underline-offset-4 hover:text-primary-hover hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
							>
								{unit.name}
							</Link>
						</h1>
						<FeedbackBox className="w-fit!">
							{formatUnitTypeName(unit.unitType.name)}
						</FeedbackBox>
					</div>
					<p className="mt-2 text-sm leading-6 text-muted">
						{unit.description}
					</p>
					<Badge className="mt-4 text-sm font-medium text-text">
						Kapazität: {unit.capacity}
					</Badge>
				</Panel>
			))}
		</section>
	);
}
