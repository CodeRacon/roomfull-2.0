import { getPublicUnits } from "@/entities/unit";
import { UnitsList } from "@/widgets/units-list";

export default async function HomePage() {
	const units = await getPublicUnits();

	return (
		<main className="page">
			<div className="card">
				<h1>RoomFull 2.0</h1>
				<UnitsList units={units} />
			</div>
		</main>
	);
}
