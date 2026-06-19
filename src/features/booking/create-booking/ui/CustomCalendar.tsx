import { clsx } from "clsx";
import type { CalendarAccentClasses } from "@/shared/ui";
import { Calendar } from "@/shared/ui";

export type CalendarDayState =
	| "available"
	| "partially-booked"
	| "fully-booked";

type CustomCalendarProps = {
	accent?: CustomCalendarAccentClasses;
	dayStates: Record<string, CalendarDayState>;
	isLoadingStates?: boolean;
	onDateSelect: (date: string) => void;
	onVisibleMonthChange: (month: string) => void;
	selectedDate: string;
	visibleMonth: string;
};

export type CustomCalendarAccentClasses = CalendarAccentClasses & {
	availableClassName: string;
	availableHoverClassName: string;
	todayBorderClassName: string;
};

const defaultCustomCalendarAccentClasses: CustomCalendarAccentClasses = {
	containerClassName: "bg-background",
	weekdayClassName: "bg-primary/10",
	availableClassName: "bg-background",
	availableHoverClassName: "md:hover:border-primary md:hover:bg-primary/10",
	todayBorderClassName: "border-primary!",
};

const berlinDateFormatter = new Intl.DateTimeFormat("en-CA", {
	timeZone: "Europe/Berlin",
	year: "numeric",
	month: "2-digit",
	day: "2-digit",
});

function getBerlinTodayDate(): string {
	const parts = berlinDateFormatter.formatToParts(new Date());
	const values = new Map(parts.map((part) => [part.type, part.value]));

	return `${values.get("year")}-${values.get("month")}-${values.get("day")}`;
}

function parseDate(date: string): Date {
	const [year, month, day] = date.split("-").map(Number);
	return new Date(Date.UTC(year, month - 1, day));
}

function isWeekend(date: string): boolean {
	const day = parseDate(date).getUTCDay();
	return day === 0 || day === 6;
}

function getDayClassName(input: {
	isDisabled: boolean;
	isOutsideMonth: boolean;
	isPast: boolean;
	isSelected: boolean;
	isToday: boolean;
	isWeekend: boolean;
	state: CalendarDayState;
	theme: CustomCalendarAccentClasses;
}): string {
	const baseClassName =
		"min-h-12 touch-manipulation border-2 px-1 py-2 text-sm font-black tabular-nums transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus sm:min-h-14 sm:px-2";

	if (input.isDisabled) {
		return clsx(
			baseClassName,
			"cursor-default!",
			input.state === "fully-booked" &&
				"border-feed-pink bg-feed-pink/25 text-danger-text",
			input.state !== "fully-booked" &&
				input.isOutsideMonth &&
				"border-transparent bg-primary/5 text-muted opacity-50",
			input.state !== "fully-booked" &&
				!input.isOutsideMonth &&
				input.isPast &&
				"border-primary/15 bg-primary/5 text-muted opacity-60",
			input.state !== "fully-booked" &&
				!input.isOutsideMonth &&
				!input.isPast &&
				!input.isToday &&
				input.isWeekend &&
				"border-dashed border-primary/25 bg-background text-muted opacity-60",
			input.state !== "fully-booked" &&
				!input.isOutsideMonth &&
				!input.isPast &&
				!input.isToday &&
				!input.isWeekend &&
				"border-primary/15 bg-primary/5 text-muted opacity-60",
			input.state !== "fully-booked" &&
				!input.isOutsideMonth &&
				!input.isPast &&
				input.isToday &&
				input.isWeekend &&
				clsx(
					"border-dashed bg-background text-muted opacity-75",
					input.theme.todayBorderClassName,
				),
			input.state !== "fully-booked" &&
				!input.isOutsideMonth &&
				!input.isPast &&
				input.isToday &&
				!input.isWeekend &&
				clsx(
					"bg-primary/5 text-primary opacity-80",
					input.theme.todayBorderClassName,
				),
		);
	}

	if (input.isSelected) {
		return clsx(
			baseClassName,
			"cursor-pointer! bg-primary text-primary-soft",
			input.isToday ? input.theme.todayBorderClassName : "border-primary",
		);
	}

	if (input.state === "fully-booked") {
		return clsx(
			baseClassName,
			"cursor-default! border-feed-pink bg-feed-pink/25 text-danger-text",
		);
	}

	if (input.state === "partially-booked") {
		return clsx(
			baseClassName,
			"cursor-pointer! border-feed-amber bg-feed-amber/35 text-primary md:hover:bg-feed-amber/55",
		);
	}

	if (input.isOutsideMonth) {
		return clsx(
			baseClassName,
			"cursor-default! border-transparent bg-primary/5 text-muted opacity-50",
		);
	}

	return clsx(
		baseClassName,
		"cursor-pointer! border-primary/35 text-primary",
		input.theme.availableClassName,
		input.theme.availableHoverClassName,
		input.isToday && input.theme.todayBorderClassName,
	);
}

function getDayStateLabel(state: CalendarDayState): string | null {
	switch (state) {
		case "available":
			return null;
		case "partially-booked":
			return "teils belegt";
		case "fully-booked":
			return "belegt";
	}
}

export function CustomCalendar({
	accent = defaultCustomCalendarAccentClasses,
	dayStates,
	isLoadingStates = false,
	onDateSelect,
	onVisibleMonthChange,
	selectedDate,
	visibleMonth,
}: CustomCalendarProps) {
	const today = getBerlinTodayDate();
	const currentMonth = getBerlinTodayDate().slice(0, 7);
	const canGoPrevious = visibleMonth.slice(0, 7) > currentMonth;

	return (
		<Calendar
			accent={accent}
			canGoPrevious={canGoPrevious}
			isLoading={isLoadingStates}
			loadingLabel="Belegung wird geladen…"
			onVisibleMonthChange={onVisibleMonthChange}
			visibleMonth={visibleMonth}
			renderDay={({ date, dayNumber, isOutsideMonth }) => {
				const state = dayStates[date] ?? "available";
				const isPast = date < today;
				const isToday = date === today;
				const isWeekendDay = isWeekend(date);
				const isDisabled =
					isOutsideMonth || isPast || isWeekendDay || state === "fully-booked";
				const stateLabel = getDayStateLabel(state);

				return (
					<button
						key={date}
						type="button"
						disabled={isDisabled}
						onClick={() => onDateSelect(date)}
						className={getDayClassName({
							isDisabled,
							isOutsideMonth,
							isPast,
							isSelected: selectedDate === date,
							isToday,
							isWeekend: isWeekendDay,
							state,
							theme: accent,
						})}
						aria-label={`${date}${isToday ? ", heute" : ""}${stateLabel ? `, ${stateLabel}` : ""}`}
						aria-pressed={selectedDate === date}
					>
						<span>{dayNumber}</span>
						{stateLabel && (
							<span className="mt-1 hidden text-[10px] font-semibold leading-tight sm:block">
								{stateLabel}
							</span>
						)}
					</button>
				);
			}}
		/>
	);
}
