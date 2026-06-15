import { Fragment, type ReactNode } from "react";

export type CalendarDay = {
	date: string;
	dayNumber: number;
	isOutsideMonth: boolean;
};

type CalendarProps = {
	canGoPrevious?: boolean;
	isLoading?: boolean;
	loadingLabel?: string;
	onVisibleMonthChange: (month: string) => void;
	renderDay: (day: CalendarDay) => ReactNode;
	visibleMonth: string;
};

const weekdayLabels = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const monthFormatter = new Intl.DateTimeFormat("de-DE", {
	month: "long",
	year: "numeric",
});

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
	canGoPrevious = true,
	isLoading = false,
	loadingLabel = "Kalender wird geladen...",
	onVisibleMonthChange,
	renderDay,
	visibleMonth,
}: CalendarProps) {
	const visibleMonthDate = getMonthStart(visibleMonth);

	return (
		<div className="rounded-md border border-primary-soft bg-primary-soft/35 p-4 shadow-xs">
			<div className="flex items-center justify-between gap-3">
				<button
					type="button"
					disabled={!canGoPrevious}
					onClick={() => onVisibleMonthChange(addMonths(visibleMonth, -1))}
					className="cursor-pointer! rounded-md border border-primary-soft bg-surface px-3 py-2 text-sm font-semibold text-primary hover:bg-primary-soft disabled:cursor-default! disabled:bg-soft-muted disabled:text-muted disabled:opacity-50"
				>
					Zurück
				</button>
				<p className="text-base font-semibold text-primary">
					{monthFormatter.format(visibleMonthDate)}
				</p>
				<button
					type="button"
					onClick={() => onVisibleMonthChange(addMonths(visibleMonth, 1))}
					className="cursor-pointer! rounded-md border border-primary-soft bg-surface px-3 py-2 text-sm font-semibold text-primary hover:bg-primary-soft"
				>
					Weiter
				</button>
			</div>

			{isLoading && <p className="mt-3 text-sm text-muted">{loadingLabel}</p>}

			<div className="mt-4 grid grid-cols-7 gap-2 text-center text-xs font-semibold text-primary">
				{weekdayLabels.map((label) => (
					<span key={label}>{label}</span>
				))}
			</div>

			<div className="mt-2 grid grid-cols-7 gap-2">
				{getCalendarDates(visibleMonth).map((day) => (
					<Fragment key={day.date}>{renderDay(day)}</Fragment>
				))}
			</div>
		</div>
	);
}
