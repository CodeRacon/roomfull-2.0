import { clsx } from "clsx";
import Link from "next/link";
import {
	type BookingOption,
	getBookingOptionHref,
} from "@/entities/booking-option";
import type { Dictionary, Locale } from "@/shared/i18n";
import { localizedPath } from "@/shared/routing";
import { EmphasizedText, FeedbackBox } from "@/shared/ui";

type BookingOptionsListProps = {
	bookingOptions: BookingOption[];
	copy: Dictionary["bookingOptionsPage"];
	locale: Locale;
};

type BookingOptionsCopy = Dictionary["bookingOptionsPage"];

type BookingOptionPanelStyle = {
	colorClassName: string;
};

const bookingOptionOrder: BookingOption["key"][] = [
	"HOT_DESK",
	"BOOTH",
	"TEAM_ROOM",
	"MEETING_ROOM",
];

const bookingOptionPanelStyles: Record<
	BookingOption["key"],
	BookingOptionPanelStyle
> = {
	HOT_DESK: {
		colorClassName: "bg-unit-hot-desk",
	},
	BOOTH: {
		colorClassName: "bg-unit-booth",
	},
	TEAM_ROOM: {
		colorClassName: "bg-unit-team-room",
	},
	MEETING_ROOM: {
		colorClassName: "bg-unit-meeting-room",
	},
};

function formatCountTemplate(template: string, count: number): string {
	return template.replace("{count}", String(count));
}

function getCapacityLabel(
	option: BookingOption,
	copy: BookingOptionsCopy["capacity"],
): string {
	if (option.key === "HOT_DESK") {
		return copy.singleSeat;
	}

	return formatCountTemplate(copy.upToPeople, option.maxCapacity);
}

function getAvailabilityLabel(
	option: BookingOption,
	copy: BookingOptionsCopy["availability"],
): string {
	if (option.key === "HOT_DESK") {
		return formatCountTemplate(copy.seats, option.totalActiveUnits);
	}

	return option.totalActiveUnits === 1
		? copy.oneRoom
		: formatCountTemplate(copy.rooms, option.totalActiveUnits);
}

function getDurationLabel(option: BookingOption, template: string): string {
	return formatCountTemplate(template, option.unitType.minDurationMinutes);
}

function getOptionPreviews(
	option: BookingOption,
): Array<{ id: string; name: string }> {
	if (option.key === "HOT_DESK") {
		return option.areas.map((area) => ({ id: area.id, name: area.name }));
	}

	return option.units;
}

export function BookingOptionsList({
	bookingOptions,
	copy,
	locale,
}: BookingOptionsListProps) {
	if (bookingOptions.length === 0) {
		return (
			<FeedbackBox variant="empty" className="mt-8">
				{copy.emptyState}
			</FeedbackBox>
		);
	}

	const orderedBookingOptions = bookingOptionOrder
		.map((key) => bookingOptions.find((option) => option.key === key))
		.filter((option): option is BookingOption => Boolean(option));

	return (
		<section
			aria-label={copy.listAriaLabel}
			className="mt-8 grid overflow-hidden sm:grid-cols-2 lg:min-h-[34rem] lg:grid-cols-4"
		>
			{orderedBookingOptions.map((option) => {
				const panelCopy = copy.options[option.key];
				const panelStyle = bookingOptionPanelStyles[option.key];
				const optionPreviews = getOptionPreviews(option);

				return (
					<Link
						key={option.key}
						href={localizedPath(locale, getBookingOptionHref(option.key))}
						className={clsx(
							"group flex min-h-[24rem] min-w-0 flex-col justify-between p-5 text-primary transition-[filter] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:z-10 hover:brightness-105 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus motion-reduce:transition-none sm:min-h-[28rem] md:p-6 lg:min-h-0",
							panelStyle.colorClassName,
						)}
					>
						<div>
							<div className="flex items-start justify-between gap-4">
								<span className="rotate-180 text-2xl font-black leading-none text-white/70 [writing-mode:vertical-rl]">
									{panelCopy.label}
								</span>
								<span className="bg-primary/10 px-3 py-1.5 text-xs font-black">
									{getAvailabilityLabel(option, copy.availability)}
								</span>
							</div>

							<h2 className="type-panel-title mt-8">{panelCopy.title}</h2>
							<p className="mt-5 text-sm font-semibold leading-6 md:text-base">
								<EmphasizedText
									emphasis={panelCopy.descriptionEmphasis}
									text={panelCopy.description}
								/>
							</p>
						</div>

						<div className="mt-8">
							<div className="space-y-2">
								{optionPreviews.map((preview) => (
									<span
										key={preview.id}
										className="block bg-primary/10 px-3 py-2 text-sm font-black"
									>
										{preview.name}
									</span>
								))}
							</div>

							<div className="mt-8 flex flex-wrap gap-2">
								<span className="bg-primary/10 px-3 py-2 text-xs font-black">
									{getCapacityLabel(option, copy.capacity)}
								</span>
								<span className="bg-primary/10 px-3 py-2 text-xs font-black">
									{getDurationLabel(option, copy.duration.minimumShort)}
								</span>
							</div>

							<span className="mt-5 inline-flex min-h-11 items-center bg-primary px-4 py-2 text-sm font-black text-on-primary transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none">
								{panelCopy.cta}
							</span>
						</div>
					</Link>
				);
			})}
		</section>
	);
}
