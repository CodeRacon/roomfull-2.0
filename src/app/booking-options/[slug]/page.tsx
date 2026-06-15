import { notFound } from "next/navigation";
import "@/widgets/booking-options-list/ui/BookingOptionsList.css";
import type { BookingOptionKey } from "@/entities/booking-option";
import { parseBookingOptionSlug } from "@/entities/booking-option";
import { formatUnitTypeName, getPublicUnits } from "@/entities/unit";
import { Anchor, Badge, FeedbackBox, Panel } from "@/shared/ui";

type BookingOptionPageProps = {
	params: Promise<{ slug: string }>;
};

type HotDeskAreaCard = {
	id: string;
	name: string;
	description: string | null;
	seatCount: number;
};

function getBookingOptionCardClassName(key: BookingOptionKey) {
	switch (key) {
		case "HOT_DESK":
			return "room-card--desk";
		case "BOOTH":
			return "room-card--booth";
		case "TEAM_ROOM":
			return "room-card--team";
		case "MEETING_ROOM":
			return "room-card--meeting";
	}
}

function getBookingCtaLabel(key: BookingOptionKey) {
	switch (key) {
		case "HOT_DESK":
			return "Hot Desk buchen";
		case "BOOTH":
			return "Booth buchen";
		case "TEAM_ROOM":
			return "Team Room buchen";
		case "MEETING_ROOM":
			return "Meeting Room buchen";
	}
}

export default async function BookingOptionPage({
	params,
}: BookingOptionPageProps) {
	const { slug } = await params;
	const bookingOptionKey = parseBookingOptionSlug(slug);

	if (!bookingOptionKey) {
		notFound();
	}

	const units = await getPublicUnits({ unitType: bookingOptionKey });

	const showsAreaCards = bookingOptionKey === "HOT_DESK";
	const roomCardClassName = `room-card ${getBookingOptionCardClassName(
		bookingOptionKey,
	)} p-5`;

	const hotDeskAreasById = new Map<string, HotDeskAreaCard>();

	for (const unit of units) {
		if (!unit.area) {
			continue;
		}
		const existingArea = hotDeskAreasById.get(unit.area.id);

		if (existingArea) {
			existingArea.seatCount += unit.capacity;
			continue;
		}

		hotDeskAreasById.set(unit.area.id, {
			id: unit.area.id,
			name: unit.area.name,
			description: unit.area.description,
			seatCount: unit.capacity,
		});
	}

	const hotDeskAreas = Array.from(hotDeskAreasById.values());
	const hotDeskSeatCount = hotDeskAreas.reduce(
		(sum, area) => sum + area.seatCount,
		0,
	);

	return (
		<main className="min-h-screen bg-background px-6 py-10 text-text">
			<div className="mx-auto w-full max-w-5xl">
				<h1 className="text-3xl font-semibold tracking-tight text-text">
					{formatUnitTypeName(bookingOptionKey)}
				</h1>
				<p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
					{showsAreaCards
						? `${hotDeskSeatCount} Plätze an ${hotDeskAreas.length} Orten.`
						: `${units.length} passende Räume verfügbar.`}
				</p>

				{units.length > 0 && !showsAreaCards && (
					<section className="mt-8 grid gap-4 sm:grid-cols-2">
						{units.map((unit) => (
							<Panel key={unit.id} className={roomCardClassName}>
								<h2 className="room-card__title text-lg font-semibold">
									{unit.name}
								</h2>
								<p className="room-card__text mt-2 text-sm leading-6">
									{unit.description}
								</p>
								<div className="mt-4 flex flex-wrap items-center gap-3">
									<Badge className="room-card__badge">{`Kapazität: ${unit.capacity} Personen`}</Badge>
									<Anchor href={`/bookings/new?unitId=${unit.id}`}>
										{getBookingCtaLabel(bookingOptionKey)}
									</Anchor>
								</div>
							</Panel>
						))}
					</section>
				)}

				{units.length > 0 && showsAreaCards && (
					<section className="mt-8 grid gap-4 sm:grid-cols-2">
						{hotDeskAreas.map((area) => (
							<Panel key={area.id} className={roomCardClassName}>
								<h2 className="room-card__title text-lg font-semibold">
									{area.name}
								</h2>
								<p className="room-card__text mt-2 text-sm leading-6">
									{area.description ??
										"Ein Bereich mit buchbaren Einzelplätzen."}
								</p>
								<div className="mt-4 flex flex-wrap items-center gap-3">
									<Badge className="room-card__badge">{`${area.seatCount} Einzelplätze`}</Badge>
									<Anchor
										href={`/bookings/new?unitType=HOT_DESK&areaId=${area.id}`}
									>
										{getBookingCtaLabel(bookingOptionKey)}
									</Anchor>
								</div>
							</Panel>
						))}
					</section>
				)}

				{units.length === 0 && (
					<FeedbackBox title="Gerade nichts verfügbar" className="mt-8">
						Für diese Auswahl gibt es aktuell keine buchbaren Plätze oder Räume.
					</FeedbackBox>
				)}
			</div>
		</main>
	);
}
