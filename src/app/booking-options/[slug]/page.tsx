import { clsx } from "clsx";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { BookingOptionKey } from "@/entities/booking-option";
import {
	getBookingOptionDescription,
	parseBookingOptionSlug,
} from "@/entities/booking-option";
import { formatUnitTypeName, getPublicUnits } from "@/entities/unit";

type BookingOptionPageProps = {
	params: Promise<{ slug: string }>;
};

type HotDeskAreaCard = {
	id: string;
	name: string;
	description: string | null;
	seatCount: number;
};

type SelectionItem = {
	id: string;
	name: string;
	description: string;
	capacityLabel: string;
	href: string;
};

type BookingOptionTheme = {
	backgroundClassName: string;
	sideLabel: string;
	selectionLabel: string;
};

function getBookingOptionTheme(key: BookingOptionKey): BookingOptionTheme {
	switch (key) {
		case "HOT_DESK":
			return {
				backgroundClassName: "bg-unit-hot-desk",
				sideLabel: "Areas",
				selectionLabel: "Area-Auswahl",
			};
		case "BOOTH":
			return {
				backgroundClassName: "bg-unit-booth",
				sideLabel: "Fokus",
				selectionLabel: "BookableUnit-Auswahl",
			};
		case "TEAM_ROOM":
			return {
				backgroundClassName: "bg-unit-team-room",
				sideLabel: "Team",
				selectionLabel: "BookableUnit-Auswahl",
			};
		case "MEETING_ROOM":
			return {
				backgroundClassName: "bg-unit-meeting-room",
				sideLabel: "Meet",
				selectionLabel: "BookableUnit-Auswahl",
			};
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

function getSelectionHeading(key: BookingOptionKey) {
	if (key === "HOT_DESK") {
		return "Wähle deine Area";
	}

	return `Wähle deine ${formatUnitTypeName(key)}`;
}

function getUnitCapacityLabel(capacity: number) {
	if (capacity === 1) {
		return "1 Person";
	}

	return `${capacity} Personen`;
}

function formatCountLabel(count: number, singular: string, plural: string) {
	if (count === 1) {
		return `1 ${singular}`;
	}

	return `${count} ${plural}`;
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
	const theme = getBookingOptionTheme(bookingOptionKey);
	const bookingOptionName = formatUnitTypeName(bookingOptionKey);
	const unitType = units[0]?.unitType;

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
	const selectionItems: SelectionItem[] = showsAreaCards
		? hotDeskAreas.map((area) => ({
				id: area.id,
				name: area.name,
				description:
					area.description ?? "Ein Bereich mit buchbaren Einzelplätzen.",
				capacityLabel: formatCountLabel(
					area.seatCount,
					"Einzelplatz",
					"Einzelplätze",
				),
				href: `/bookings/new?unitType=HOT_DESK&areaId=${area.id}`,
			}))
		: units.map((unit) => ({
				id: unit.id,
				name: unit.name,
				description: unit.description,
				capacityLabel: getUnitCapacityLabel(unit.capacity),
				href: `/bookings/new?unitId=${unit.id}`,
			}));
	const availabilityLabel = showsAreaCards
		? `${formatCountLabel(hotDeskSeatCount, "Platz", "Plätze")} / ${formatCountLabel(
				hotDeskAreas.length,
				"Area",
				"Areas",
			)}`
		: formatCountLabel(units.length, "Raum", "Räume");
	const durationLabel = unitType
		? `${unitType.minDurationMinutes}-${unitType.maxDurationMinutes} Min.`
		: "Zeitraum im Booking";

	return (
		<main className="min-h-[calc(100svh-4.5rem)] bg-background px-4 py-6 text-text md:px-6">
			<div className="mx-auto w-full max-w-7xl">
				<Link
					href="/booking-options"
					className="inline-flex min-h-10 items-center bg-primary px-3 py-2 text-sm font-black text-on-primary transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
				>
					BookingOptions
				</Link>

				<section
					className={clsx(
						"mt-6 grid min-h-[28rem] content-between p-5 text-primary md:p-6 lg:grid-cols-[1.1fr_0.9fr] lg:p-8",
						theme.backgroundClassName,
					)}
					aria-labelledby="booking-option-title"
				>
					<div className="flex items-start justify-between gap-5 lg:col-span-2">
						<span className="rotate-180 text-3xl font-black leading-none text-white/70 [writing-mode:vertical-rl] md:text-4xl">
							{theme.sideLabel}
						</span>
						<span className="bg-primary/10 px-3 py-1.5 text-xs font-black md:text-sm">
							{availabilityLabel}
						</span>
					</div>

					<div className="mt-14 self-end lg:mt-20">
						<p className="text-sm font-black uppercase tracking-[0.18em]">
							BookingOption
						</p>
						<h1 id="booking-option-title" className="type-display-page mt-3">
							{bookingOptionName}
						</h1>
						<p className="mt-5 max-w-2xl text-base font-semibold leading-7 md:text-lg">
							{getBookingOptionDescription(bookingOptionKey)}
						</p>
					</div>

					<dl className="mt-10 grid self-end text-sm font-black sm:grid-cols-3 lg:mt-0">
						<div className="bg-primary px-4 py-3 text-on-primary">
							<dt className="text-on-primary/70">Auswahl</dt>
							<dd>{theme.selectionLabel}</dd>
						</div>
						<div className="bg-primary/10 px-4 py-3">
							<dt className="text-primary/55">Dauer</dt>
							<dd>{durationLabel}</dd>
						</div>
						<div className="bg-primary/10 px-4 py-3">
							<dt className="text-primary/55">Verfügbar</dt>
							<dd>{availabilityLabel}</dd>
						</div>
					</dl>
				</section>

				<section className="mt-10" aria-labelledby="selection-title">
					<div className="grid border-y-4 border-primary lg:grid-cols-[18rem_1fr]">
						<div className="bg-primary p-5 text-on-primary md:p-6">
							<p className="text-sm font-black uppercase tracking-[0.18em]">
								Konkrete Auswahl
							</p>
							<h2 id="selection-title" className="type-section-title mt-5">
								{getSelectionHeading(bookingOptionKey)}
							</h2>
						</div>

						{selectionItems.length > 0 ? (
							<div className="divide-y-4 divide-primary">
								{selectionItems.map((item, index) => (
									<Link
										key={item.id}
										href={item.href}
										className="group grid min-h-[13rem] gap-5 bg-background p-5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-focus md:grid-cols-[4.5rem_minmax(0,1fr)_12rem] md:p-6 md:hover:bg-primary md:hover:text-on-primary"
									>
										<span className="text-5xl font-black leading-none tabular-nums md:text-6xl">
											{String(index + 1).padStart(2, "0")}
										</span>
										<span className="min-w-0">
											<span className="block text-2xl font-black leading-none md:text-4xl">
												{item.name}
											</span>
											<span className="mt-4 block max-w-2xl text-sm font-semibold leading-6 text-muted md:text-base md:group-hover:text-on-primary/80">
												{item.description}
											</span>
										</span>
										<span className="flex flex-col items-start justify-between gap-5 md:items-end">
											<span className="bg-primary/10 px-3 py-2 text-xs font-black md:group-hover:bg-on-primary/15">
												{item.capacityLabel}
											</span>
											<span className="inline-flex min-h-11 items-center bg-primary px-4 py-2 text-sm font-black text-on-primary transition-transform motion-reduce:transition-none md:group-hover:translate-x-1 md:group-hover:bg-on-primary md:group-hover:text-primary">
												{getBookingCtaLabel(bookingOptionKey)}
											</span>
										</span>
									</Link>
								))}
							</div>
						) : (
							<div className="bg-background p-5 md:p-6">
								<p className="max-w-xl text-base font-semibold leading-7 text-muted">
									Für diese Auswahl gibt es aktuell keine buchbaren Plätze oder
									Räume.
								</p>
							</div>
						)}
					</div>
				</section>
			</div>
		</main>
	);
}
