import { clsx } from "clsx";
import type { BookingAvailability } from "@/entities/booking";
import type { Dictionary } from "@/shared/i18n";
import { FeedbackBox } from "@/shared/ui";

type BookingTimePickerMode = "DIRECT" | "HOT_DESK";

type BookingTimePickerProps = {
	availability: BookingAvailability;
	copy: Dictionary["createBooking"]["timePicker"];
	endTime: string;
	mode: BookingTimePickerMode;
	onEndTimeChange: (endTime: string) => void;
	onStartTimeChange: (startTime: string) => void;
	startTime: string;
};

type TimeOption = {
	availableUnitCount?: number;
	time: string;
};

type StartTimeGridItem =
	| {
			availableUnitCount: number;
			time: string;
			type: "time";
	  }
	| {
			end: string;
			start: string;
			type: "unavailable-range";
	  };

const MIN_DISABLED_TIMES_TO_COMPACT = 4;

function parseTimeToMinutes(time: string): number {
	const [hours, minutes] = time.split(":").map(Number);
	return hours * 60 + minutes;
}

function formatMinutes(minutes: number): string {
	const hours = Math.floor(minutes / 60);
	const remainingMinutes = minutes % 60;

	return `${String(hours).padStart(2, "0")}:${String(remainingMinutes).padStart(
		2,
		"0",
	)}`;
}

function getTimeGrid(availability: BookingAvailability): string[] {
	const startMinutes = parseTimeToMinutes(availability.openingHours.start);
	const endMinutes = parseTimeToMinutes(availability.openingHours.end);
	const times: string[] = [];

	for (
		let minutes = startMinutes;
		minutes < endMinutes;
		minutes += availability.timeGridMinutes
	) {
		times.push(formatMinutes(minutes));
	}

	return times;
}

function getAvailableStarts(
	availability: BookingAvailability,
): Map<string, number> {
	const starts = new Map<string, number>();

	for (const slot of availability.slots) {
		starts.set(
			slot.start,
			Math.max(starts.get(slot.start) ?? 0, slot.availableUnitCount),
		);
	}

	return starts;
}

function getEndOptions(
	availability: BookingAvailability,
	startTime: string,
): TimeOption[] {
	return availability.slots
		.filter((slot) => slot.start === startTime)
		.map((slot) => ({
			time: slot.end,
			availableUnitCount: slot.availableUnitCount,
		}));
}

function getStartTimeGridItems(
	timeGrid: string[],
	availableStarts: Map<string, number>,
): StartTimeGridItem[] {
	const items: StartTimeGridItem[] = [];

	for (let index = 0; index < timeGrid.length; index += 1) {
		const time = timeGrid[index];
		const availableUnitCount = availableStarts.get(time) ?? 0;

		if (availableUnitCount > 0) {
			items.push({ type: "time", time, availableUnitCount });
			continue;
		}

		const disabledStartIndex = index;

		while (
			index + 1 < timeGrid.length &&
			(availableStarts.get(timeGrid[index + 1]) ?? 0) === 0
		) {
			index += 1;
		}

		const disabledEndIndex = index;
		const disabledTimesCount = disabledEndIndex - disabledStartIndex + 1;

		if (disabledTimesCount >= MIN_DISABLED_TIMES_TO_COMPACT) {
			items.push({
				type: "unavailable-range",
				start: timeGrid[disabledStartIndex],
				end: timeGrid[disabledEndIndex],
			});
			continue;
		}

		for (
			let disabledIndex = disabledStartIndex;
			disabledIndex <= disabledEndIndex;
			disabledIndex += 1
		) {
			items.push({
				type: "time",
				time: timeGrid[disabledIndex],
				availableUnitCount: 0,
			});
		}
	}

	return items;
}

function getTimeButtonClassName(
	isSelected: boolean,
	isDisabled: boolean,
): string {
	return clsx(
		"min-h-11 touch-manipulation border-2 px-3 py-2 text-sm font-black tabular-nums transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
		isSelected && "border-primary bg-primary text-on-primary",
		!isSelected &&
			!isDisabled &&
			"cursor-pointer! border-primary/35 bg-background text-primary md:hover:border-primary md:hover:bg-primary/10",
		isDisabled &&
			"cursor-default! border-dashed border-primary/20 bg-primary/5 text-muted opacity-60",
	);
}

function formatTemplate(
	template: string,
	values: Record<string, string | number>,
): string {
	return Object.entries(values).reduce(
		(result, [key, value]) => result.replace(`{${key}}`, String(value)),
		template,
	);
}

export function BookingTimePicker({
	availability,
	copy,
	endTime,
	mode,
	onEndTimeChange,
	onStartTimeChange,
	startTime,
}: BookingTimePickerProps) {
	const timeGrid = getTimeGrid(availability);
	const availableStarts = getAvailableStarts(availability);
	const startTimeGridItems = getStartTimeGridItems(timeGrid, availableStarts);
	const endOptions = getEndOptions(availability, startTime);
	const hasStartOptions = availability.slots.length > 0;

	function handleStartChange(nextStartTime: string): void {
		onStartTimeChange(nextStartTime);
		onEndTimeChange("");
	}

	return (
		<section className="mt-8 border-t-4 border-primary pt-6">
			<div>
				<h3 className="text-xs font-black uppercase tracking-[0.18em] text-primary">
					{copy.sectionEyebrow}
				</h3>
				<p className="mt-2 text-sm font-semibold text-muted">
					{formatTemplate(copy.openingHours, {
						start: availability.openingHours.start,
						end: availability.openingHours.end,
					})}
				</p>
			</div>

			{availability.blockedIntervals.length > 0 && (
				<div className="mt-4">
					<p className="text-xs font-black uppercase tracking-[0.18em] text-primary">
						{copy.blockedIntervals}
					</p>
					<ul className="mt-2 flex flex-wrap gap-2 text-sm text-muted">
						{availability.blockedIntervals.map((interval) => (
							<li
								key={`${interval.start}-${interval.end}`}
								className="bg-primary/10 px-3 py-1.5 text-xs font-black text-primary"
							>
								{formatTemplate(copy.blockedInterval, {
									start: interval.start,
									end: interval.end,
								})}
							</li>
						))}
					</ul>
				</div>
			)}

			{!hasStartOptions && (
				<FeedbackBox variant="empty" className="mt-4">
					{copy.noSlots}
				</FeedbackBox>
			)}

			<div className="mt-5">
				<p className="text-xs font-black uppercase tracking-[0.18em] text-primary">
					{copy.startTime}
				</p>
				<div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
					{startTimeGridItems.map((item) => {
						if (item.type === "unavailable-range") {
							return (
								<div
									key={`${item.start}-${item.end}`}
									className="col-span-3 border-2 border-dashed border-primary/25 bg-primary/5 px-3 py-2 text-center text-sm font-semibold text-muted sm:col-span-4 lg:col-span-6"
								>
									{formatTemplate(copy.unavailableRange, {
										start: item.start,
										end: item.end,
									})}
								</div>
							);
						}

						const availableUnitCount = item.availableUnitCount;
						const isDisabled = availableUnitCount === 0;
						const isSelected = startTime === item.time;

						return (
							<button
								key={item.time}
								type="button"
								disabled={isDisabled}
								aria-pressed={isSelected}
								className={getTimeButtonClassName(isSelected, isDisabled)}
								onClick={() => handleStartChange(item.time)}
							>
								<span>{item.time}</span>
								{mode === "HOT_DESK" && availableUnitCount > 0 && (
									<span className="mt-0.5 block text-[10px] font-semibold leading-tight">
										{formatTemplate(copy.availableCount, {
											count: availableUnitCount,
										})}
									</span>
								)}
							</button>
						);
					})}
				</div>
			</div>

			{startTime !== "" && (
				<div className="mt-5">
					<p className="text-xs font-black uppercase tracking-[0.18em] text-primary">
						{copy.endTime}
					</p>
					<div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
						{endOptions.map((option) => {
							const isSelected = endTime === option.time;

							return (
								<button
									key={option.time}
									type="button"
									aria-pressed={isSelected}
									className={getTimeButtonClassName(isSelected, false)}
									onClick={() => onEndTimeChange(option.time)}
								>
									<span>{option.time}</span>
									{mode === "HOT_DESK" && option.availableUnitCount && (
										<span className="mt-0.5 block text-[10px] font-semibold leading-tight">
											{formatTemplate(copy.availableCount, {
												count: option.availableUnitCount,
											})}
										</span>
									)}
								</button>
							);
						})}
					</div>
				</div>
			)}
		</section>
	);
}
