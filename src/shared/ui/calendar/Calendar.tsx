import ChevronRightIcon from "@public/icons/general/ic-chevron-right.svg";
import { clsx } from "clsx";
import { Fragment, type ReactNode } from "react";

export type CalendarDay = {
	date: string;
	dayNumber: number;
	isOutsideMonth: boolean;
};

type CalendarProps = {
	accent?: CalendarAccentClasses;
	canGoPrevious?: boolean;
	copy?: Partial<CalendarCopy>;
	isLoading?: boolean;
	loadingLabel?: string;
	monthLocale?: string;
	onVisibleMonthChange: (month: string) => void;
	renderDay: (day: CalendarDay) => ReactNode;
	visibleMonth: string;
};

export type CalendarCopy = {
	nextMonth: string;
	nextMonthAriaLabel: string;
	previousMonth: string;
	previousMonthAriaLabel: string;
	weekdayLabels: string[];
};

export type CalendarAccentClasses = {
	containerClassName: string;
	weekdayClassName: string;
};

const defaultCalendarAccentClasses: CalendarAccentClasses = {
	containerClassName: "bg-background",
	weekdayClassName: "bg-primary/10",
};

const defaultCalendarCopy: CalendarCopy = {
	nextMonth: "Weiter",
	nextMonthAriaLabel: "Nächsten Monat anzeigen",
	previousMonth: "Zurück",
	previousMonthAriaLabel: "Vorherigen Monat anzeigen",
	weekdayLabels: ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"],
};

function formatDateParts(year: number, month: number, day: number): string {
	return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function getMonthStart(month: string): Date {
	const [year, monthNumber] = month.split("-").map(Number);
	return new Date(Date.UTC(year, monthNumber - 1, 1));
}

function formatMonth(date: Date): string {
	return formatDateParts(date.getUTCFullYear(), date.getUTCMonth() + 1, 1);
}

function addMonths(month: string, delta: number): string {
	const monthStart = getMonthStart(month);
	return formatMonth(
		new Date(
			Date.UTC(
				monthStart.getUTCFullYear(),
				monthStart.getUTCMonth() + delta,
				1,
			),
		),
	);
}

function getCalendarDates(month: string): CalendarDay[] {
	const monthStart = getMonthStart(month);
	const monthEnd = new Date(
		Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth() + 1, 0),
	);
	const startDay = monthStart.getUTCDay();
	const endDay = monthEnd.getUTCDay();
	const mondayBasedStartOffset = startDay === 0 ? 6 : startDay - 1;
	const mondayBasedEndOffset = endDay === 0 ? 0 : 7 - endDay;
	const gridStart = new Date(
		Date.UTC(
			monthStart.getUTCFullYear(),
			monthStart.getUTCMonth(),
			1 - mondayBasedStartOffset,
		),
	);
	const calendarDayCount =
		mondayBasedStartOffset + monthEnd.getUTCDate() + mondayBasedEndOffset;

	return Array.from({ length: calendarDayCount }, (_, index) => {
		const currentDate = new Date(
			Date.UTC(
				gridStart.getUTCFullYear(),
				gridStart.getUTCMonth(),
				gridStart.getUTCDate() + index,
			),
		);
		const date = formatDateParts(
			currentDate.getUTCFullYear(),
			currentDate.getUTCMonth() + 1,
			currentDate.getUTCDate(),
		);

		return {
			date,
			dayNumber: currentDate.getUTCDate(),
			isOutsideMonth: date.slice(0, 7) !== month.slice(0, 7),
		};
	});
}

export function Calendar({
	accent = defaultCalendarAccentClasses,
	canGoPrevious = true,
	copy,
	isLoading = false,
	loadingLabel = "Kalender wird geladen…",
	monthLocale = "de-DE",
	onVisibleMonthChange,
	renderDay,
	visibleMonth,
}: CalendarProps) {
	const visibleMonthDate = getMonthStart(visibleMonth);
	const calendarCopy = { ...defaultCalendarCopy, ...copy };
	const monthFormatter = new Intl.DateTimeFormat(monthLocale, {
		month: "long",
		year: "numeric",
	});

	return (
		<div
			className={clsx(
				"border-2 border-primary p-3 transition-colors md:p-4",
				accent.containerClassName,
			)}
		>
			<div className="grid grid-cols-[2.75rem_minmax(0,1fr)_2.75rem] items-center gap-2 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:gap-3">
				<button
					type="button"
					disabled={!canGoPrevious}
					onClick={() => onVisibleMonthChange(addMonths(visibleMonth, -1))}
					aria-label={calendarCopy.previousMonthAriaLabel}
					className="inline-flex min-h-11 items-center justify-center bg-primary px-3 py-2 text-sm font-black text-on-primary transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:cursor-default! disabled:bg-primary/10 disabled:text-muted disabled:opacity-60"
				>
					<ChevronRightIcon className="size-5 rotate-180" aria-hidden="true" />
					<span className="sr-only sm:not-sr-only sm:ml-2">
						{calendarCopy.previousMonth}
					</span>
				</button>
				<p className="min-w-0 bg-primary/10 px-2 py-2 text-center text-sm font-black leading-tight text-primary md:text-base">
					{monthFormatter.format(visibleMonthDate)}
				</p>
				<button
					type="button"
					onClick={() => onVisibleMonthChange(addMonths(visibleMonth, 1))}
					aria-label={calendarCopy.nextMonthAriaLabel}
					className="inline-flex min-h-11 items-center justify-center bg-primary px-3 py-2 text-sm font-black text-on-primary transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
				>
					<span className="sr-only sm:not-sr-only sm:mr-2">
						{calendarCopy.nextMonth}
					</span>
					<ChevronRightIcon className="size-5" aria-hidden="true" />
				</button>
			</div>

			{isLoading && (
				<p className="mt-3 bg-primary/10 px-3 py-2 text-sm font-semibold text-muted">
					{loadingLabel}
				</p>
			)}

			<div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs font-black text-primary md:gap-2">
				{calendarCopy.weekdayLabels.map((label) => (
					<span key={label} className={clsx("py-2", accent.weekdayClassName)}>
						{label}
					</span>
				))}
			</div>

			<div className="mt-1 grid grid-cols-7 gap-1 md:mt-2 md:gap-2">
				{getCalendarDates(visibleMonth).map((day) => (
					<Fragment key={day.date}>{renderDay(day)}</Fragment>
				))}
			</div>
		</div>
	);
}
