import { clsx } from "clsx";
import { formatBookingDateKey } from "@/entities/booking";
import type { Dictionary } from "@/shared/i18n";
import type { CalendarAccentClasses } from "@/shared/ui";
import { Calendar } from "@/shared/ui";

export type CalendarDayState =
	| "available"
	| "partially-booked"
	| "fully-booked";

type CustomCalendarProps = {
	accent?: CustomCalendarAccentClasses;
	copy: Dictionary["createBooking"]["calendar"];
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

function getBerlinTodayDate(): string {
	return formatBookingDateKey(new Date());
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
				"border-unit-booth bg-unit-booth/25 text-danger-text",
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
			"cursor-pointer! bg-primary text-on-primary",
			input.isToday ? input.theme.todayBorderClassName : "border-primary",
		);
	}

	if (input.state === "fully-booked") {
		return clsx(
			baseClassName,
			"cursor-default! border-unit-booth bg-unit-booth/25 text-danger-text",
		);
	}

	if (input.state === "partially-booked") {
		return clsx(
			baseClassName,
			"cursor-pointer! border-unit-meeting-room bg-unit-meeting-room/35 text-primary md:hover:bg-unit-meeting-room/55",
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

function getDayStateLabel(
	state: CalendarDayState,
	copy: Dictionary["createBooking"]["calendar"]["states"],
): string | null {
	switch (state) {
		case "available":
			return null;
		case "partially-booked":
			return copy.partiallyBooked;
		case "fully-booked":
			return copy.fullyBooked;
	}
}

export function CustomCalendar({
	accent = defaultCustomCalendarAccentClasses,
	copy,
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
			copy={{
				nextMonth: copy.nextMonth,
				nextMonthAriaLabel: copy.nextMonthAriaLabel,
				previousMonth: copy.previousMonth,
				previousMonthAriaLabel: copy.previousMonthAriaLabel,
				weekdayLabels: copy.weekdayLabels,
			}}
			isLoading={isLoadingStates}
			loadingLabel={copy.loadingLabel}
			monthLocale={copy.locale}
			onVisibleMonthChange={onVisibleMonthChange}
			visibleMonth={visibleMonth}
			renderDay={({ date, dayNumber, isOutsideMonth }) => {
				const state = dayStates[date] ?? "available";
				const isPast = date < today;
				const isToday = date === today;
				const isWeekendDay = isWeekend(date);
				const isDisabled =
					isOutsideMonth || isPast || isWeekendDay || state === "fully-booked";
				const stateLabel = getDayStateLabel(state, copy.states);

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
						aria-label={`${date}${isToday ? `, ${copy.todayLabel}` : ""}${stateLabel ? `, ${stateLabel}` : ""}`}
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
