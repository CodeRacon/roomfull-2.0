"use client";

import { useRouter } from "next/navigation";
import { type ComponentPropsWithoutRef, useEffect, useState } from "react";
import type {
	BookedInterval,
	BookingAvailability,
	BookingContext,
	CreateBookingInput,
	UnitDayBookings,
} from "@/entities/booking";
import {
	createBooking,
	getBookingAvailability,
	getUnitDayBookings,
} from "@/entities/booking";
import { useSession } from "@/entities/session";
import { ApiRequestError } from "@/shared/api";
import { Badge, Button, FeedbackBox, Panel } from "@/shared/ui";
import { BookingTimePicker } from "./BookingTimePicker";
import { type CalendarDayState, CustomCalendar } from "./CustomCalendar";

type CreateBookingFormProps = {
	bookingContext: BookingContext;
};

type FormSubmitHandler = NonNullable<
	ComponentPropsWithoutRef<"form">["onSubmit"]
>;

type MinuteRange = {
	end: number;
	start: number;
};

const OPENING_MINUTES = 8 * 60;
const CLOSING_MINUTES = 22 * 60;

const berlinDateFormatter = new Intl.DateTimeFormat("en-CA", {
	timeZone: "Europe/Berlin",
	year: "numeric",
	month: "2-digit",
	day: "2-digit",
});

const berlinTimeFormatter = new Intl.DateTimeFormat("en-CA", {
	timeZone: "Europe/Berlin",
	hour: "2-digit",
	minute: "2-digit",
	hourCycle: "h23",
});

const bookingSummaryDateFormatter = new Intl.DateTimeFormat("de-DE", {
	timeZone: "UTC",
	weekday: "long",
	day: "2-digit",
	month: "long",
});

function getBerlinTodayDate(): string {
	const parts = berlinDateFormatter.formatToParts(new Date());
	const values = new Map(parts.map((part) => [part.type, part.value]));

	return `${values.get("year")}-${values.get("month")}-${values.get("day")}`;
}

function getCurrentBerlinMonth(): string {
	return `${getBerlinTodayDate().slice(0, 7)}-01`;
}

function parseDate(date: string): Date {
	const [year, month, day] = date.split("-").map(Number);
	return new Date(Date.UTC(year, month - 1, day));
}

function formatDateParts(year: number, month: number, day: number): string {
	return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function getVisibleMonthDates(month: string): string[] {
	const monthStart = parseDate(month);
	const year = monthStart.getUTCFullYear();
	const monthIndex = monthStart.getUTCMonth();
	const daysInMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();

	return Array.from({ length: daysInMonth }, (_, index) =>
		formatDateParts(year, monthIndex + 1, index + 1),
	);
}

function isWeekend(date: string): boolean {
	const day = parseDate(date).getUTCDay();
	return day === 0 || day === 6;
}

function getBerlinMinutesOfDay(value: string): number {
	const parts = berlinTimeFormatter.formatToParts(new Date(value));
	const values = new Map(parts.map((part) => [part.type, part.value]));

	return Number(values.get("hour")) * 60 + Number(values.get("minute"));
}

function getBookedMinuteRanges(intervals: BookedInterval[]): MinuteRange[] {
	return intervals
		.map((interval) => ({
			end: Math.min(getBerlinMinutesOfDay(interval.end), CLOSING_MINUTES),
			start: Math.max(getBerlinMinutesOfDay(interval.start), OPENING_MINUTES),
		}))
		.filter((range) => range.end > range.start)
		.sort((firstRange, secondRange) => firstRange.start - secondRange.start);
}

function getMergedMinuteRanges(ranges: MinuteRange[]): MinuteRange[] {
	const mergedRanges: MinuteRange[] = [];

	for (const range of ranges) {
		const lastRange = mergedRanges.at(-1);

		if (!lastRange || range.start > lastRange.end) {
			mergedRanges.push({ ...range });
			continue;
		}

		lastRange.end = Math.max(lastRange.end, range.end);
	}

	return mergedRanges;
}

function isFullyBookedDay(intervals: BookedInterval[]): boolean {
	const bookedRanges = getMergedMinuteRanges(getBookedMinuteRanges(intervals));

	let coveredUntil = OPENING_MINUTES;

	for (const range of bookedRanges) {
		if (range.start > coveredUntil) {
			return false;
		}

		coveredUntil = Math.max(coveredUntil, range.end);

		if (coveredUntil >= CLOSING_MINUTES) {
			return true;
		}
	}

	return false;
}

function getCalendarDayState(dayBookings: UnitDayBookings): CalendarDayState {
	if (dayBookings.bookedIntervals.length === 0) {
		return "available";
	}

	return isFullyBookedDay(dayBookings.bookedIntervals)
		? "fully-booked"
		: "partially-booked";
}

function buildBookingDateTime(date: string, time: string): string | null {
	if (date === "" || time === "") {
		return null;
	}

	const dateTime = new Date(`${date}T${time}:00`);

	if (Number.isNaN(dateTime.getTime())) {
		return null;
	}

	return dateTime.toISOString();
}

function formatDuration(minutes: number): string {
	const hours = Math.floor(minutes / 60);
	const remainingMinutes = minutes % 60;

	if (hours === 0) {
		return `${remainingMinutes}min`;
	}

	if (remainingMinutes === 0) {
		return `${hours}h`;
	}

	return `${hours}h ${remainingMinutes}min`;
}

function formatBookingSummaryDate(date: string): string {
	return bookingSummaryDateFormatter.format(parseDate(date));
}

export function CreateBookingForm({ bookingContext }: CreateBookingFormProps) {
	const router = useRouter();
	const { endSession } = useSession();
	const [date, setDate] = useState("");
	const [startTime, setStartTime] = useState("");
	const [endTime, setEndTime] = useState("");
	const [visibleMonth, setVisibleMonth] = useState(getCurrentBerlinMonth);

	const [calendarDayStates, setCalendarDayStates] = useState<
		Record<string, CalendarDayState>
	>({});
	const [isLoadingCalendarStates, setIsLoadingCalendarStates] = useState(false);
	const [calendarStatesError, setCalendarStatesError] = useState<string | null>(
		null,
	);
	const [bookingAvailability, setBookingAvailability] =
		useState<BookingAvailability | null>(null);
	const [isLoadingBookingAvailability, setIsLoadingBookingAvailability] =
		useState(false);
	const [bookingAvailabilityError, setBookingAvailabilityError] = useState<
		string | null
	>(null);
	const [submitError, setSubmitError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const directUnitId =
		bookingContext.mode === "DIRECT" ? bookingContext.unit.id : null;

	useEffect(() => {
		if (directUnitId === null) {
			setCalendarDayStates({});
			setCalendarStatesError(null);
			setIsLoadingCalendarStates(false);
			return;
		}

		const unitId = directUnitId;
		const today = getBerlinTodayDate();
		const visibleDates = getVisibleMonthDates(visibleMonth).filter(
			(visibleDate) => visibleDate >= today && !isWeekend(visibleDate),
		);

		async function loadCalendarStates(): Promise<void> {
			setCalendarDayStates({});
			setCalendarStatesError(null);
			setIsLoadingCalendarStates(true);

			try {
				const monthBookings = await Promise.all(
					visibleDates.map((visibleDate) =>
						getUnitDayBookings(unitId, visibleDate),
					),
				);

				setCalendarDayStates(
					Object.fromEntries(
						monthBookings.map((monthDayBookings) => [
							monthDayBookings.date,
							getCalendarDayState(monthDayBookings),
						]),
					),
				);
			} catch (error) {
				if (error instanceof ApiRequestError && error.status === 401) {
					endSession();
					return;
				}

				setCalendarStatesError(
					error instanceof Error
						? error.message
						: "Kalenderbelegung konnte nicht geladen werden.",
				);
			} finally {
				setIsLoadingCalendarStates(false);
			}
		}

		void loadCalendarStates();
	}, [directUnitId, endSession, visibleMonth]);

	useEffect(() => {
		if (date === "") {
			setBookingAvailability(null);
			setBookingAvailabilityError(null);
			setIsLoadingBookingAvailability(false);
			return;
		}

		async function loadBookingAvailability(): Promise<void> {
			setBookingAvailability(null);
			setIsLoadingBookingAvailability(true);
			setBookingAvailabilityError(null);

			try {
				const availability =
					bookingContext.mode === "DIRECT"
						? await getBookingAvailability({
								date,
								unitId: bookingContext.unit.id,
							})
						: await getBookingAvailability({
								date,
								areaId: bookingContext.area.id,
								unitType: "HOT_DESK",
							});

				setBookingAvailability(availability);
			} catch (error) {
				if (error instanceof ApiRequestError && error.status === 401) {
					endSession();
					return;
				}

				setBookingAvailabilityError(
					error instanceof Error
						? error.message
						: "Verfügbarkeit konnte nicht geladen werden.",
				);
			} finally {
				setIsLoadingBookingAvailability(false);
			}
		}

		void loadBookingAvailability();
	}, [bookingContext, date, endSession]);

	function handleDateSelect(selectedDate: string): void {
		setDate(selectedDate);
		setStartTime("");
		setEndTime("");
		setSubmitError(null);
	}

	const title =
		bookingContext.mode === "DIRECT"
			? bookingContext.unit.name
			: bookingContext.area.name;

	const description =
		bookingContext.mode === "DIRECT"
			? bookingContext.unit.description
			: (bookingContext.area.description ??
				"Hot-Desk-Area mit buchbaren Einzelplätzen.");

	const unitType =
		bookingContext.mode === "DIRECT"
			? bookingContext.unit.unitType
			: bookingContext.unitType;

	const isBookingSelectionComplete =
		date !== "" && startTime !== "" && endTime !== "";
	const bookingSummary = isBookingSelectionComplete
		? {
				date: formatBookingSummaryDate(date),
				target: title,
				time: `${startTime}-${endTime} Uhr`,
			}
		: null;

	const handleSubmit: FormSubmitHandler = async (event) => {
		event.preventDefault();
		setSubmitError(null);

		const start = buildBookingDateTime(date, startTime);
		const end = buildBookingDateTime(date, endTime);

		if (!start || !end) {
			setSubmitError("Bitte wähle Datum, Start und Ende aus.");
			return;
		}

		const input: CreateBookingInput =
			bookingContext.mode === "DIRECT"
				? {
						unitId: bookingContext.unit.id,
						start,
						end,
					}
				: {
						areaId: bookingContext.area.id,
						unitType: "HOT_DESK",
						start,
						end,
					};

		try {
			setIsSubmitting(true);
			await createBooking(input);
			router.replace("/me/bookings?created=1");
		} catch (error) {
			if (error instanceof ApiRequestError) {
				if (error.status === 400) {
					setSubmitError("Bitte prüfe Datum und Uhrzeit.");
					return;
				}
				if (error.status === 401) {
					endSession();
					return;
				}
				if (error.status === 404) {
					setSubmitError("Dieses Angebot ist nicht mehr buchbar.");
					return;
				}
				if (error.status === 409) {
					setSubmitError("Der Zeitraum ist inzwischen belegt.");
					return;
				}
				setSubmitError(error.message);
				return;
			}

			setSubmitError("Buchung konnte nicht erstellt werden.");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Panel className="mt-8">
			<form onSubmit={handleSubmit}>
				<h2 className="text-lg font-semibold">{title}</h2>
				<p className="mt-2 text-sm leading-6 text-primary">{description}</p>
				<div className="mt-4 flex flex-wrap gap-2">
					{bookingContext.mode === "DIRECT" ? (
						<Badge>{`Kapazität: ${bookingContext.unit.capacity} Personen`}</Badge>
					) : (
						<Badge>{`${bookingContext.area.seatCount} Einzelplätze`}</Badge>
					)}
					<Badge>{`Dauer: min. ${formatDuration(
						unitType.minDurationMinutes,
					)} - max. ${formatDuration(unitType.maxDurationMinutes)}`}</Badge>
				</div>
				<div className="mt-6">
					<h3 className="text-sm font-semibold">Datum</h3>
					<p className="mt-1 text-sm text-muted">
						Wähle einen verfügbaren Werktag.
					</p>
					<div className="mt-3">
						<CustomCalendar
							dayStates={calendarDayStates}
							isLoadingStates={isLoadingCalendarStates}
							onDateSelect={handleDateSelect}
							onVisibleMonthChange={setVisibleMonth}
							selectedDate={date}
							visibleMonth={visibleMonth}
						/>
					</div>
					{calendarStatesError && (
						<FeedbackBox variant="error" className="mt-3">
							{calendarStatesError}
						</FeedbackBox>
					)}
				</div>
				{date !== "" && (
					<>
						{isLoadingBookingAvailability && (
							<p className="mt-5 text-sm text-muted">
								Verfügbarkeit wird geladen...
							</p>
						)}
						{bookingAvailabilityError && (
							<FeedbackBox variant="error" className="mt-5">
								{bookingAvailabilityError}
							</FeedbackBox>
						)}
						{!isLoadingBookingAvailability &&
							!bookingAvailabilityError &&
							bookingAvailability && (
								<BookingTimePicker
									availability={bookingAvailability}
									endTime={endTime}
									mode={
										bookingContext.mode === "DIRECT" ? "DIRECT" : "HOT_DESK"
									}
									onEndTimeChange={setEndTime}
									onStartTimeChange={setStartTime}
									startTime={startTime}
								/>
							)}
					</>
				)}
				{submitError && (
					<FeedbackBox variant="error" className="mt-4">
						{submitError}
					</FeedbackBox>
				)}
				<div className="mt-6 flex flex-col gap-3 border-border-muted border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
					{bookingSummary && (
						<FeedbackBox
							variant="success"
							title=""
							className="sm:w-fit! w-full!"
						>
							<div className="flex gap-1 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-2 justify-center">
								<span className="font-semibold">{bookingSummary.target}</span>
								<span className="text-success-text/70 sm:inline">-</span>
								<span>{bookingSummary.date}</span>
								<span className="text-success-text/70 sm:inline">-</span>
								<span className="font-medium tabular-nums">
									{bookingSummary.time}
								</span>
							</div>
						</FeedbackBox>
					)}
					<Button
						type="submit"
						disabled={isSubmitting || !isBookingSelectionComplete}
						className="w-full shrink-0 sm:w-auto ml-auto"
					>
						{isSubmitting ? "Buchung wird erstellt..." : "Buchung erstellen"}
					</Button>
				</div>
			</form>
		</Panel>
	);
}
