"use client";

import { clsx } from "clsx";
import Link from "next/link";
import {
	type CSSProperties,
	type MouseEvent,
	type TransitionEvent,
	useEffect,
	useRef,
	useState,
} from "react";
import {
	type BookingOption,
	getBookingOptionHref,
} from "@/entities/booking-option";
import { useSession } from "@/entities/session";
import {
	getPageTransitionOrigin,
	type PageTransitionOrigin,
	usePageTransition,
} from "./page-transition";

type HomePageClientProps = {
	bookingOptions: BookingOption[];
};

const bookingOptionOrder: BookingOption["key"][] = [
	"HOT_DESK",
	"BOOTH",
	"TEAM_ROOM",
	"MEETING_ROOM",
];

const stripeCopy: Record<
	BookingOption["key"],
	{ label: string; titleLines: string[] }
> = {
	HOT_DESK: {
		label: "Work",
		titleLines: ["Hot", "Desk"],
	},
	BOOTH: {
		label: "Focus",
		titleLines: ["Booth"],
	},
	TEAM_ROOM: {
		label: "Team",
		titleLines: ["Team", "Room"],
	},
	MEETING_ROOM: {
		label: "Meet",
		titleLines: ["Meeting", "Room"],
	},
};

const stripeTransitionMs = 1000;
const stripeTransitionFallbackMs = stripeTransitionMs + 80;
const activeStripeFlexGrow = 2.8;
const inactiveStripeFlexGrow = 0.45;
const activeStripeMaxWidthPx = 34 * 16;
const inactiveStripeMinWidthPx = 5 * 16;
const activeStripeWidthShare =
	activeStripeFlexGrow / (activeStripeFlexGrow + inactiveStripeFlexGrow * 3);

type StripeLinkStyle = CSSProperties & {
	"--stripe-flex-grow": string;
};

function getStripeClassName(key: BookingOption["key"]): string {
	switch (key) {
		case "HOT_DESK":
			return "bg-feed-teal text-primary";
		case "BOOTH":
			return "bg-feed-pink text-primary";
		case "TEAM_ROOM":
			return "bg-feed-coral text-primary";
		case "MEETING_ROOM":
			return "bg-feed-amber text-primary";
	}
}

function getCapacityLabel(option: BookingOption): string {
	if (option.key === "HOT_DESK") {
		return "Einzelplatz";
	}

	return `bis zu ${option.maxCapacity} Personen`;
}

function getAvailableUnitsLabel(option: BookingOption): string {
	if (option.key === "HOT_DESK") {
		return `${option.totalActiveUnits} Plätze verfügbar`;
	}

	return option.totalActiveUnits === 1
		? "1 Raum verfügbar"
		: `${option.totalActiveUnits} Räume verfügbar`;
}

function getStripeTitle(
	copy: (typeof stripeCopy)[BookingOption["key"]],
): string {
	return copy.titleLines.join(" ");
}

function formatFlexGrow(value: number): string {
	return Number(value.toFixed(4)).toString();
}

function getStripeFlexGrowTargets(stripeNavWidth: number): {
	active: string;
	inactive: string;
} {
	if (stripeNavWidth <= 0) {
		return {
			active: formatFlexGrow(activeStripeFlexGrow),
			inactive: formatFlexGrow(inactiveStripeFlexGrow),
		};
	}

	const maxActiveWidth = Math.max(
		inactiveStripeMinWidthPx,
		stripeNavWidth - inactiveStripeMinWidthPx * 3,
	);
	const activeWidth = Math.min(
		stripeNavWidth * activeStripeWidthShare,
		activeStripeMaxWidthPx,
		maxActiveWidth,
	);
	const inactiveWidth = Math.max(
		inactiveStripeMinWidthPx,
		(stripeNavWidth - activeWidth) / 3,
	);

	return {
		active: formatFlexGrow(activeWidth / inactiveWidth),
		inactive: "1",
	};
}

function getStripeLinkStyle(
	key: BookingOption["key"],
	activeKey: BookingOption["key"] | null,
	stripeNavWidth: number,
): StripeLinkStyle {
	const flexGrowTargets = getStripeFlexGrowTargets(stripeNavWidth);

	return {
		"--stripe-flex-grow":
			activeKey === null
				? "1"
				: key === activeKey
					? flexGrowTargets.active
					: flexGrowTargets.inactive,
	};
}

export function HomePageClient({ bookingOptions }: HomePageClientProps) {
	const { status } = useSession();
	const { startPageTransition } = usePageTransition();
	const isAuthenticated = status === "authenticated";
	const isAnonymous = status === "anonymous";
	const [activeBookingOptionKey, setActiveBookingOptionKey] = useState<
		BookingOption["key"] | null
	>(null);
	const [stripeNavWidth, setStripeNavWidth] = useState(0);
	const stripeNavRef = useRef<HTMLElement | null>(null);
	const stripeTransitionOriginRef = useRef<PageTransitionOrigin | null>(null);
	const bookingOptionsTransitionOriginRef = useRef<PageTransitionOrigin | null>(
		null,
	);
	const isStripeTransitionLockedRef = useRef(false);
	const stripeTransitionFallbackTimeoutRef = useRef<ReturnType<
		typeof setTimeout
	> | null>(null);

	useEffect(() => {
		const stripeNav = stripeNavRef.current;

		if (!stripeNav) {
			return;
		}

		const observedStripeNav = stripeNav;

		function updateStripeNavWidth() {
			setStripeNavWidth(observedStripeNav.getBoundingClientRect().width);
		}

		updateStripeNavWidth();

		const resizeObserver = new ResizeObserver(updateStripeNavWidth);
		resizeObserver.observe(observedStripeNav);

		return () => {
			resizeObserver.disconnect();
		};
	}, []);

	useEffect(() => {
		return () => {
			if (stripeTransitionFallbackTimeoutRef.current) {
				clearTimeout(stripeTransitionFallbackTimeoutRef.current);
			}
		};
	}, []);

	function clearStripeTransitionLock() {
		isStripeTransitionLockedRef.current = false;

		if (stripeTransitionFallbackTimeoutRef.current) {
			clearTimeout(stripeTransitionFallbackTimeoutRef.current);
			stripeTransitionFallbackTimeoutRef.current = null;
		}
	}

	function prefersReducedMotion() {
		return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	}

	function startStripeTransitionLock() {
		clearStripeTransitionLock();

		if (prefersReducedMotion()) {
			return;
		}

		isStripeTransitionLockedRef.current = true;
		stripeTransitionFallbackTimeoutRef.current = setTimeout(
			clearStripeTransitionLock,
			stripeTransitionFallbackMs,
		);
	}

	function activateBookingOption(
		key: BookingOption["key"],
		options: { force?: boolean } = {},
	) {
		if (activeBookingOptionKey === key) {
			return;
		}

		if (!options.force && isStripeTransitionLockedRef.current) {
			return;
		}

		startStripeTransitionLock();
		setActiveBookingOptionKey(key);
	}

	function deactivateBookingOption() {
		clearStripeTransitionLock();
		setActiveBookingOptionKey(null);
	}

	function handleStripeTransitionEnd(event: TransitionEvent<HTMLElement>) {
		if (event.propertyName !== "flex-grow") {
			return;
		}

		clearStripeTransitionLock();
	}

	function captureStripeTransitionOrigin(event: MouseEvent<HTMLAnchorElement>) {
		stripeTransitionOriginRef.current = getPageTransitionOrigin(
			event.currentTarget,
		);
	}

	function captureBookingOptionsTransitionOrigin(
		event: MouseEvent<HTMLAnchorElement>,
	) {
		bookingOptionsTransitionOriginRef.current = getPageTransitionOrigin(
			event.currentTarget,
		);
	}

	const orderedBookingOptions = bookingOptionOrder
		.map((key) => bookingOptions.find((option) => option.key === key))
		.filter((option): option is BookingOption => Boolean(option));
	const bookingOptionsHref = "/booking-options";

	return (
		<main className="min-h-[calc(100svh-6.5rem)] bg-background text-text">
			<section className="flex min-h-[calc(100svh-6.5rem)] items-center px-4 py-5 md:px-6">
				<div className="mx-auto grid w-full max-w-7xl gap-8 min-[1328px]:grid-cols-[minmax(0,1fr)_minmax(24rem,34rem)] min-[1328px]:items-center">
					<div className="flex flex-col justify-center gap-10 min-[1328px]:h-136 min-[1328px]:max-h-[calc(100svh-9rem)] min-[1328px]:min-h-112 min-[1328px]:justify-between min-[1328px]:gap-0">
						<div>
							<h1 className="type-display-hero mt-0 max-w-5xl">
								<span className="block min-[530px]:inline">Coworking</span>{" "}
								<span className="block min-[530px]:inline">Spaces</span>{" "}
								<span className="block min-[530px]:inline">buchen</span>
							</h1>
							<p className="type-body-lead mt-8 mb-0 max-w-2xl text-muted">
								Finde schnell den passenden Platz für Fokus, Gespräche oder
								Teamarbeit. Wähle eine Buchungsart, prüfe die Verfügbarkeit und
								sichere dir deinen Zeitraum.
							</p>
						</div>

						<div className="flex flex-wrap gap-3 mt-8">
							<Link
								href={bookingOptionsHref}
								onClick={captureBookingOptionsTransitionOrigin}
								onNavigate={(event) => {
									event.preventDefault();
									startPageTransition({
										href: bookingOptionsHref,
										origin: bookingOptionsTransitionOriginRef.current,
										variant: "stripe-board",
									});
								}}
								className="inline-flex min-h-12 items-center justify-center border-2 border-primary bg-primary px-5 py-3 text-sm font-black text-primary-soft transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
							>
								Jetzt buchen
							</Link>
							{isAuthenticated && (
								<Link
									href="/me/bookings"
									className="inline-flex min-h-12 items-center justify-center border-2 border-primary bg-background px-5 py-3 text-sm font-black text-primary transition-colors hover:bg-primary hover:text-primary-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
								>
									Meine Buchungen
								</Link>
							)}
							{isAnonymous && (
								<Link
									href="/login"
									className="inline-flex min-h-12 items-center justify-center border-2 border-primary bg-background px-5 py-3 text-sm font-black text-primary transition-colors hover:bg-primary hover:text-primary-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
								>
									Einloggen
								</Link>
							)}
						</div>
					</div>

					<nav
						ref={stripeNavRef}
						aria-label="Buchungsarten"
						className="grid overflow-hidden sm:flex sm:h-[30rem] sm:w-full sm:justify-self-start min-[1328px]:h-[34rem] min-[1328px]:max-h-[calc(100svh-9rem)] min-[1328px]:min-h-[28rem]"
						onBlur={(event) => {
							if (
								event.relatedTarget instanceof Node &&
								event.currentTarget.contains(event.relatedTarget)
							) {
								return;
							}

							setActiveBookingOptionKey(null);
						}}
						onMouseLeave={deactivateBookingOption}
						onTransitionEnd={handleStripeTransitionEnd}
					>
						{orderedBookingOptions.map((option) => {
							const copy = stripeCopy[option.key];
							const isActive = activeBookingOptionKey === option.key;
							const href = getBookingOptionHref(option.key);

							return (
								<Link
									key={option.key}
									href={href}
									aria-label={`${getStripeTitle(copy)} auswählen`}
									style={getStripeLinkStyle(
										option.key,
										activeBookingOptionKey,
										stripeNavWidth,
									)}
									onFocus={() =>
										activateBookingOption(option.key, { force: true })
									}
									onClick={captureStripeTransitionOrigin}
									onNavigate={(event) => {
										event.preventDefault();
										startPageTransition({
											colorClassName: getStripeClassName(option.key),
											href,
											label: getStripeTitle(copy),
											origin: stripeTransitionOriginRef.current,
										});
									}}
									onPointerMove={(event) => {
										if (event.pointerType === "touch") {
											return;
										}

										activateBookingOption(option.key);
									}}
									className={clsx(
										"relative grid min-h-24 min-w-0 grid-cols-[2.5rem_5.25rem_minmax(0,1fr)] items-center gap-x-2 overflow-hidden px-2 py-3 transition-[opacity,transform] duration-[1000ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus min-[530px]:grid-cols-[3.75rem_minmax(6rem,0.85fr)_minmax(10rem,1fr)_auto] min-[530px]:gap-x-3 min-[530px]:px-4 sm:block sm:min-h-0 sm:min-w-20 sm:basis-0 sm:p-0 sm:transition-[flex-grow,opacity,transform] sm:[flex-grow:var(--stripe-flex-grow)]",
										getStripeClassName(option.key),
									)}
								>
									<span className="flex items-center justify-center text-lg font-black leading-none text-white/70 [writing-mode:vertical-rl] rotate-180 min-[530px]:text-2xl sm:hidden">
										{copy.label}
									</span>
									<span className="text-lg font-black leading-none text-pretty min-[530px]:text-2xl sm:hidden">
										{copy.titleLines.map((titleLine) => (
											<span key={titleLine} className="block">
												{titleLine}
											</span>
										))}
									</span>
									<span
										className={clsx(
											"hidden text-4xl font-black text-white leading-none transition-[opacity,transform] duration-[1000ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none sm:absolute sm:left-4 sm:top-1/2 sm:block sm:-translate-y-1/2 sm:rotate-180 sm:[writing-mode:vertical-rl] lg:text-5xl",
											isActive ? "sm:opacity-0" : "sm:opacity-65",
											!isActive &&
												activeBookingOptionKey !== null &&
												"sm:opacity-75",
										)}
									>
										{copy.label}
									</span>
									<span
										className={clsx(
											"hidden text-5xl font-black leading-none transition-[opacity,transform] duration-[1000ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none sm:absolute sm:left-8 sm:top-8 sm:block",
											isActive ? "sm:opacity-100" : "sm:opacity-0",
										)}
									>
										{copy.titleLines.map((titleLine) => (
											<span key={titleLine} className="block">
												{titleLine}
											</span>
										))}
									</span>
									<span
										className={clsx(
											"flex min-w-0 w-full flex-col items-stretch gap-2 justify-self-stretch text-xs font-semibold transition-[opacity,transform] duration-[1000ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none min-[425px]:flex-row min-[425px]:items-center min-[425px]:justify-between min-[530px]:block min-[530px]:space-y-1 sm:absolute sm:bottom-8 sm:left-8 sm:w-72 sm:overflow-hidden sm:whitespace-nowrap sm:text-sm",
											isActive ? "sm:opacity-100" : "sm:opacity-0",
										)}
									>
										<span className="min-w-0 space-y-0.5 text-right min-[425px]:text-left min-[530px]:space-y-1">
											<span className="block min-[530px]:text-base">
												{getAvailableUnitsLabel(option)}
											</span>
											<span className="block min-[530px]:text-base">
												ab {option.unitType.minDurationMinutes} Minuten
											</span>
											<span className="block min-[530px]:text-base">
												{getCapacityLabel(option)}
											</span>
										</span>
										<span className="inline-flex w-fit shrink-0 self-end items-center rounded-full border border-primary/40 bg-primary/10 px-3 py-2 text-xs font-black min-[425px]:self-auto min-[530px]:hidden sm:hidden">
											Auswählen
										</span>
										<span className="mt-5 hidden w-fit items-center rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-sm font-black sm:inline-flex">
											Jetzt auswählen
										</span>
									</span>
									<span className="hidden w-fit items-center justify-self-end rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-sm font-black min-[530px]:inline-flex sm:hidden">
										Auswählen
									</span>
								</Link>
							);
						})}
					</nav>
				</div>
			</section>
		</main>
	);
}
