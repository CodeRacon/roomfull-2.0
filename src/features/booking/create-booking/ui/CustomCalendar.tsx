import { clsx } from "clsx";
import { Calendar } from "@/shared/ui";

export type CalendarDayState =
	| "available"
	| "partially-booked"
	| "fully-booked";

type CustomCalendarProps = {
	dayStates: Record<string, CalendarDayState>;
	isLoadingStates?: boolean;
	onDateSelect: (date: string) => void;
	onVisibleMonthChange: (month: string) => void;
	selectedDate: string;
	visibleMonth: string;
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
	isWeekend: boolean;
	state: CalendarDayState;
}): string {
	const baseClassName =
		"min-h-12 rounded-md border px-2 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";

	if (input.isDisabled) {
		return clsx(baseClassName, "cursor-default!", {
			"border-tertiary bg-tertiary-soft text-tertiary opacity-80":
				input.state === "fully-booked",
			"border-transparent bg-surface-muted/40 text-zinc-400 opacity-45":
				input.state !== "fully-booked" && input.isOutsideMonth,
			"border-border-muted bg-surface-muted text-zinc-400 opacity-75":
				input.state !== "fully-booked" && !input.isOutsideMonth && input.isPast,
			"border-dashed border-primary-soft bg-surface text-primary opacity-55":
				input.state !== "fully-booked" &&
				!input.isOutsideMonth &&
				!input.isPast &&
				input.isWeekend,
			"border-border-muted bg-surface-muted text-muted opacity-60":
				input.state !== "fully-booked" &&
				!input.isOutsideMonth &&
				!input.isPast &&
				!input.isWeekend,
		});
	}

	if (input.isSelected) {
		return clsx(
			baseClassName,
			"cursor-pointer! border-primary bg-primary text-primary-soft shadow-sm",
		);
	}

	if (input.state === "fully-booked") {
		return clsx(
			baseClassName,
			"cursor-default! border-tertiary bg-tertiary-soft text-tertiary opacity-80",
		);
	}

	if (input.state === "partially-booked") {
		return clsx(
			baseClassName,
			"cursor-pointer! border-warning-text bg-warning-bg text-warning-text hover:bg-surface",
		);
	}

	if (input.isOutsideMonth) {
		return clsx(
			baseClassName,
			"cursor-default! border-transparent bg-surface-muted/40 text-zinc-400 opacity-45",
		);
	}

	return clsx(
		baseClassName,
		"cursor-pointer! border-primary-soft bg-primary-soft/60 text-primary hover:border-primary hover:bg-primary-soft",
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
			canGoPrevious={canGoPrevious}
			isLoading={isLoadingStates}
			loadingLabel="Belegung wird geladen..."
			onVisibleMonthChange={onVisibleMonthChange}
			visibleMonth={visibleMonth}
			renderDay={({ date, dayNumber, isOutsideMonth }) => {
				const state = dayStates[date] ?? "available";
				const isPast = date < today;
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
							isWeekend: isWeekendDay,
							state,
						})}
						aria-label={`${date}${stateLabel ? `, ${stateLabel}` : ""}`}
					>
						<span>{dayNumber}</span>
						{stateLabel && (
							<span className="mt-1 block text-[10px] font-medium leading-tight">
								{stateLabel}
							</span>
						)}
					</button>
				);
			}}
		/>
	);
}
