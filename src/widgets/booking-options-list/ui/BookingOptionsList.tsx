import { clsx } from "clsx";
import Link from "next/link";
import {
	type BookingOption,
	getBookingOptionDescription,
	getBookingOptionHref,
} from "@/entities/booking-option";
import { formatUnitTypeName } from "@/entities/unit";
import { FeedbackBox } from "@/shared/ui";

type BookingOptionsListProps = {
	bookingOptions: BookingOption[];
};

type BookingOptionPanelCopy = {
	colorClassName: string;
	label: string;
	variants: string[];
};

const bookingOptionOrder: BookingOption["key"][] = [
	"HOT_DESK",
	"BOOTH",
	"TEAM_ROOM",
	"MEETING_ROOM",
];

const bookingOptionPanelCopy: Record<
	BookingOption["key"],
	BookingOptionPanelCopy
> = {
	HOT_DESK: {
		colorClassName: "bg-feed-teal",
		label: "Areas",
		variants: ["Open World", "Quiet Place"],
	},
	BOOTH: {
		colorClassName: "bg-feed-pink",
		label: "Fokus",
		variants: ["Phone Booth", "Focus Booth", "Deep Work Booth"],
	},
	TEAM_ROOM: {
		colorClassName: "bg-feed-coral",
		label: "Team",
		variants: ["Sprint Room", "Workshop Room", "Project Room"],
	},
	MEETING_ROOM: {
		colorClassName: "bg-feed-amber",
		label: "Meet",
		variants: ["Client Meeting", "Board Room", "Presentation Room"],
	},
};

function getCapacityLabel(option: BookingOption): string {
	if (option.key === "HOT_DESK") {
		return "Einzelplatz";
	}

	return `bis ${option.maxCapacity} Personen`;
}

function getAvailabilityLabel(option: BookingOption): string {
	if (option.key === "HOT_DESK") {
		return `${option.totalActiveUnits} Plätze`;
	}

	return option.totalActiveUnits === 1
		? "1 Raum"
		: `${option.totalActiveUnits} Räume`;
}

function getCtaLabel(option: BookingOption): string {
	if (option.key === "HOT_DESK") {
		return "Area wählen";
	}

	return "Varianten ansehen";
}

export function BookingOptionsList({
	bookingOptions,
}: BookingOptionsListProps) {
	if (bookingOptions.length === 0) {
		return (
			<FeedbackBox variant="empty" className="mt-8">
				Gerade sind keine Plätze oder Räume verfügbar.
			</FeedbackBox>
		);
	}

	const orderedBookingOptions = bookingOptionOrder
		.map((key) => bookingOptions.find((option) => option.key === key))
		.filter((option): option is BookingOption => Boolean(option));

	return (
		<section
			aria-label="Buchungsarten vergleichen"
			className="mt-8 grid overflow-hidden sm:grid-cols-2 lg:min-h-[34rem] lg:grid-cols-4"
		>
			{orderedBookingOptions.map((option) => {
				const panelCopy = bookingOptionPanelCopy[option.key];

				return (
					<Link
						key={option.key}
						href={getBookingOptionHref(option.key)}
						className={clsx(
							"group flex min-h-[24rem] min-w-0 flex-col justify-between p-5 text-primary transition-[filter] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:z-10 hover:brightness-105 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus motion-reduce:transition-none sm:min-h-[28rem] md:p-6 lg:min-h-0",
							panelCopy.colorClassName,
						)}
					>
						<div>
							<div className="flex items-start justify-between gap-4">
								<span className="rotate-180 text-2xl font-black leading-none text-white/70 [writing-mode:vertical-rl]">
									{panelCopy.label}
								</span>
								<span className="bg-primary/10 px-3 py-1.5 text-xs font-black">
									{getAvailabilityLabel(option)}
								</span>
							</div>

							<h2 className="type-panel-title mt-8">
								{formatUnitTypeName(option.key)}
							</h2>
							<p className="mt-5 text-sm font-semibold leading-6 md:text-base">
								{getBookingOptionDescription(option.key)}
							</p>
						</div>

						<div className="mt-8">
							<div className="space-y-2">
								{panelCopy.variants.map((variant) => (
									<span
										key={variant}
										className="block bg-primary/10 px-3 py-2 text-sm font-black"
									>
										{variant}
									</span>
								))}
							</div>

							<div className="mt-8 flex flex-wrap gap-2">
								<span className="bg-primary/10 px-3 py-2 text-xs font-black">
									{getCapacityLabel(option)}
								</span>
								<span className="bg-primary/10 px-3 py-2 text-xs font-black">
									ab {option.unitType.minDurationMinutes} Min.
								</span>
							</div>

							<span className="mt-5 inline-flex min-h-11 items-center bg-primary px-4 py-2 text-sm font-black text-primary-soft transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none">
								{getCtaLabel(option)}
							</span>
						</div>
					</Link>
				);
			})}
		</section>
	);
}
