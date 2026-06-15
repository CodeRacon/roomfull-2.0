"use client";

import BoothIcon from "@public/icons/booking-options/booth.svg";
import HotDeskIcon from "@public/icons/booking-options/hot-desk.svg";
import MeetingRoomIcon from "@public/icons/booking-options/meeting-room.svg";
import TeamRoomIcon from "@public/icons/booking-options/team-room.svg";
import Link from "next/link";
import {
	type BookingOption,
	getBookingOptionHref,
} from "@/entities/booking-option";
import { useSession } from "@/entities/session";
import { formatUnitTypeName } from "@/entities/unit";

type HomePageClientProps = {
	bookingOptions: BookingOption[];
};

const workModes = [
	{
		title: "Allein ankommen",
		text: "Ein Platz, ein klarer Kopf, ein paar gute Stunden ohne viel Planung.",
	},
	{
		title: "Zusammen weiterkommen",
		text: "Ein Raum für Gespräche, Entscheidungen und alles, was mit anderen besser geht.",
	},
	{
		title: "Spontan bleiben",
		text: "Heute Fokusplatz, morgen Teamraum. Du suchst nach dem, was dein Tag gerade braucht.",
	},
];

const workAreaCopy: Record<
	BookingOption["key"],
	{ teaser: string; variantHint: string }
> = {
	HOT_DESK: {
		teaser:
			"Ein freier Platz für Fokuszeit, kurze Stopps oder den ganzen Vormittag.",
		variantHint: "Open World oder Quiet Place",
	},
	BOOTH: {
		teaser: "Wenn du Ruhe brauchst, ohne gleich einen großen Raum zu blocken.",
		variantHint: "Kleine Räume für konzentrierte Arbeit",
	},
	TEAM_ROOM: {
		teaser:
			"Für Absprachen, Pairing, Planung und kleine Workshops mit deinem Team.",
		variantHint: "Räume für mehrere Personen",
	},
	MEETING_ROOM: {
		teaser:
			"Für Termine, Präsentationen und Gespräche, die etwas mehr Rahmen brauchen.",
		variantHint: "Mehr Platz für Meetings",
	},
};

function getWorkAreaIcon(key: BookingOption["key"]) {
	switch (key) {
		case "HOT_DESK":
			return HotDeskIcon;
		case "BOOTH":
			return BoothIcon;
		case "TEAM_ROOM":
			return TeamRoomIcon;
		case "MEETING_ROOM":
			return MeetingRoomIcon;
	}
}

function getWorkAreaClassName(key: BookingOption["key"]): string {
	switch (key) {
		case "HOT_DESK":
			return "border-room-desk bg-room-desk-muted text-room-desk";
		case "BOOTH":
			return "border-room-booth bg-room-booth-muted text-room-booth";
		case "TEAM_ROOM":
			return "border-room-team bg-room-team-muted text-room-team";
		case "MEETING_ROOM":
			return "border-room-meeting bg-room-meeting-muted text-room-meeting-strong";
	}
}

export function HomePageClient({ bookingOptions }: HomePageClientProps) {
	const { status } = useSession();
	const isAuthenticated = status === "authenticated";
	const isAnonymous = status === "anonymous";

	return (
		<main className="min-h-screen bg-background text-text">
			<section className="bg-primary px-6 py-14 text-primary-soft md:py-18">
				<div className="mx-auto grid w-full max-w-5xl gap-10 md:grid-cols-[1.15fr_0.85fr] md:items-center">
					<div>
						<p className="text-sm font-semibold uppercase tracking-normal text-accent-two-soft">
							Coworking, das zu deinem Tag passt
						</p>
						<h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight md:text-6xl">
							Finde den richtigen Platz für das, was heute ansteht.
						</h1>
						<p className="mt-5 max-w-2xl text-base leading-7 text-primary-soft md:text-lg">
							Ob ruhige Fokuszeit, kurze Abstimmung oder größeres Meeting:
							RoomFull zeigt dir passende Plätze und Räume, die du direkt buchen
							kannst.
						</p>

						<div className="mt-8 flex flex-wrap gap-3">
							<Link
								href="/booking-options"
								className="inline-flex min-h-11 items-center justify-center rounded-md bg-accent-two px-5 py-3 text-sm font-semibold text-text transition-colors hover:bg-accent-two-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
							>
								Jetzt buchen
							</Link>
							{isAuthenticated && (
								<Link
									href="/me/bookings"
									className="inline-flex min-h-11 items-center justify-center rounded-md border border-primary-soft px-5 py-3 text-sm font-semibold text-primary-soft transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
								>
									Meine Buchungen
								</Link>
							)}
							{isAnonymous && (
								<>
									<Link
										href="/register"
										className="inline-flex min-h-11 items-center justify-center rounded-md border border-primary-soft px-5 py-3 text-sm font-semibold text-primary-soft transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
									>
										Registrieren
									</Link>
									<Link
										href="/login"
										className="inline-flex min-h-11 items-center justify-center rounded-md px-5 py-3 text-sm font-semibold text-primary-soft transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
									>
										Einloggen
									</Link>
								</>
							)}
						</div>
					</div>

					<div className="grid grid-cols-2 gap-3" aria-hidden="true">
						<div className="rounded-md bg-room-desk-soft p-5 text-room-desk">
							<HotDeskIcon className="h-20 w-full" />
						</div>
						<div className="rounded-md bg-room-booth-soft p-5 text-room-booth">
							<BoothIcon className="h-20 w-full" />
						</div>
						<div className="rounded-md bg-room-team-soft p-5 text-room-team">
							<TeamRoomIcon className="h-20 w-full" />
						</div>
						<div className="rounded-md bg-room-meeting-soft p-5 text-room-meeting-strong">
							<MeetingRoomIcon className="h-20 w-full" />
						</div>
					</div>
				</div>
			</section>

			<section className=" bg-tertiary-soft px-6 py-12">
				<div className="mx-auto w-full max-w-5xl">
					<div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
						<div className="max-w-2xl">
							<h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
								Was brauchst du heute?
							</h2>
							<p className="mt-3 text-sm leading-6 text-muted md:text-base">
								Wähle erst die Art von Ort. Danach siehst du, welche Plätze oder
								Räume verfügbar sind.
							</p>
						</div>
						<Link
							href="/booking-options"
							className="inline-flex min-h-10 w-fit items-center justify-center rounded-md bg-secondary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
						>
							Alle ansehen
						</Link>
					</div>

					<div className="mt-8 grid gap-4 sm:grid-cols-2">
						{bookingOptions.map((option) => {
							const WorkAreaIcon = getWorkAreaIcon(option.key);
							const copy = workAreaCopy[option.key];

							return (
								<Link
									key={option.key}
									href={getBookingOptionHref(option.key)}
									className="block rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
								>
									<article
										className={`h-full rounded-md border p-5 shadow-xs transition-transform hover:-translate-y-0.5 ${getWorkAreaClassName(
											option.key,
										)}`}
									>
										<div className="flex items-start gap-4">
											<div className="flex size-20 shrink-0 items-center justify-center rounded-md bg-surface">
												<WorkAreaIcon
													className="h-14 w-14"
													aria-hidden="true"
												/>
											</div>
											<div>
												<h3 className="text-lg font-semibold">
													{formatUnitTypeName(option.key)}
												</h3>
												<p className="mt-2 text-sm leading-6 text-text">
													{copy.teaser}
												</p>
											</div>
										</div>
										<div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold">
											<span className="rounded-md bg-surface px-3 py-2">
												{copy.variantHint}
											</span>
											<span className="rounded-md bg-surface px-3 py-2">
												ab {option.unitType.minDurationMinutes} Min.
											</span>
											<span className="rounded-md bg-surface px-3 py-2">
												{option.key === "HOT_DESK"
													? `${option.totalActiveUnits} Plätze`
													: `bis ${option.maxCapacity} Personen`}
											</span>
										</div>
									</article>
								</Link>
							);
						})}
					</div>
				</div>
			</section>

			<section className="px-6 py-12 bg-room-meeting-muted">
				<div className="mx-auto w-full max-w-5xl">
					<div className="max-w-2xl">
						<h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
							Ein guter Arbeitstag beginnt mit dem passenden Ort.
						</h2>
						<p className="mt-3 text-sm leading-6 text-muted md:text-base">
							Manchmal reicht ein Schreibtisch. Manchmal braucht es Ruhe,
							Whiteboard oder Platz für mehrere Menschen. RoomFull hilft dir,
							diese Entscheidung schnell zu treffen.
						</p>
					</div>

					<div className="mt-8 grid gap-4 md:grid-cols-3 ">
						{workModes.map((mode) => (
							<div
								key={mode.title}
								className="rounded-md border border-border bg-accent-two-soft p-5 shadow-xs"
							>
								<h3 className="text-lg font-semibold">{mode.title}</h3>
								<p className="mt-2 text-sm leading-6 text-muted">{mode.text}</p>
							</div>
						))}
					</div>
				</div>
			</section>
		</main>
	);
}
