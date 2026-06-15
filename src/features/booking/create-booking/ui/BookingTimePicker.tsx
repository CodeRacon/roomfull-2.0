import { clsx } from "clsx";
import type { BookingAvailability } from "@/entities/booking";
import { Badge, FeedbackBox } from "@/shared/ui";

type BookingTimePickerMode = "DIRECT" | "HOT_DESK";

type BookingTimePickerProps = {
	availability: BookingAvailability;
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
		"min-h-10 rounded-md border px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
		isSelected && "border-secondary bg-secondary text-white",
		!isSelected &&
			!isDisabled &&
			"cursor-pointer! border-border bg-surface text-text hover:bg-surface-muted",
		isDisabled &&
			"cursor-default! border-border-muted bg-surface-muted text-muted opacity-50",
	);
}

export function BookingTimePicker({
	availability,
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
		<div className="border-border-muted mt-5 border-t pt-5">
			<div className="flex flex-wrap items-start justify-between gap-3">
				<div>
					<h3 className="text-sm font-semibold">Zeit</h3>
					<p className="mt-1 text-sm text-muted">
						Öffnungszeiten: {availability.openingHours.start}-
						{availability.openingHours.end} Uhr
					</p>
				</div>
				<Badge variant={hasStartOptions ? "success" : "danger"}>
					{hasStartOptions ? "Zeiten verfügbar" : "voll belegt"}
				</Badge>
			</div>

			{availability.blockedIntervals.length > 0 && (
				<div className="mt-4">
					<p className="text-sm font-medium text-text">Bereits belegt</p>
					<ul className="mt-2 flex flex-wrap gap-2 text-sm text-muted">
						{availability.blockedIntervals.map((interval) => (
							<li
								key={`${interval.start}-${interval.end}`}
								className="rounded-full bg-surface-muted px-3 py-1"
							>
								{interval.start}-{interval.end} Uhr
							</li>
						))}
					</ul>
				</div>
			)}

			{!hasStartOptions && (
				<FeedbackBox variant="empty" className="mt-4">
					Für diesen Tag sind keine passenden Zeiträume verfügbar.
				</FeedbackBox>
			)}

			<div className="mt-5">
				<p className="text-medium font-semibold text-text">Startzeit</p>
				<div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
					{startTimeGridItems.map((item) => {
						if (item.type === "unavailable-range") {
							return (
								<div
									key={`${item.start}-${item.end}`}
									className="col-span-3 rounded-md border border-dashed border-border-muted bg-surface-muted px-3 py-2 text-center text-sm font-medium text-muted sm:col-span-4 lg:col-span-6"
								>
									{item.start}-{item.end} Uhr nicht verfügbar
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
								className={getTimeButtonClassName(isSelected, isDisabled)}
								onClick={() => handleStartChange(item.time)}
							>
								<span>{item.time}</span>
								{mode === "HOT_DESK" && availableUnitCount > 0 && (
									<span className="mt-0.5 block text-[10px] font-medium leading-tight">
										{availableUnitCount} frei
									</span>
								)}
							</button>
						);
					})}
				</div>
			</div>

			{startTime !== "" && (
				<div className="mt-5">
					<p className="text-medium font-semibold text-text">Endzeit</p>
					<div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
						{endOptions.map((option) => {
							const isSelected = endTime === option.time;

							return (
								<button
									key={option.time}
									type="button"
									className={getTimeButtonClassName(isSelected, false)}
									onClick={() => onEndTimeChange(option.time)}
								>
									<span>{option.time}</span>
									{mode === "HOT_DESK" && option.availableUnitCount && (
										<span className="mt-0.5 block text-[10px] font-medium leading-tight">
											{option.availableUnitCount} frei
										</span>
									)}
								</button>
							);
						})}
					</div>
				</div>
			)}
		</div>
	);
}
