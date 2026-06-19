"use client";

import { clsx } from "clsx";
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
import type { UnitTypeName } from "@/entities/unit";
import { formatUnitTypeName } from "@/entities/unit";
import { ApiRequestError } from "@/shared/api";
import { Button, FeedbackBox } from "@/shared/ui";
import { BookingTimePicker } from "./BookingTimePicker";
import {
	type CalendarDayState,
	CustomCalendar,
	type CustomCalendarAccentClasses,
} from "./CustomCalendar";

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

type BookingAccentTheme = {
	accentClassName: string;
	actionClassName: string;
	calendarAccent: CustomCalendarAccentClasses;
	sideLabel: string;
};

const OPENING_MINUTES = 8 * 60;
const CLOSING_MINUTES = 22 * 60;

const bookingAccentThemeByUnitType: Record<UnitTypeName, BookingAccentTheme> = {
	HOT_DESK: {
		accentClassName: "bg-feed-teal",
		actionClassName: "bg-feed-teal! text-primary! hover:bg-feed-teal!",
		calendarAccent: {
			containerClassName: "bg-feed-teal/10",
			weekdayClassName: "bg-feed-teal/30",
			availableClassName: "bg-feed-teal/10",
			availableHoverClassName:
				"md:hover:border-primary md:hover:bg-feed-teal/25",
			todayBorderClassName: "border-feed-teal!",
		},
		sideLabel: "Areas",
	},
	BOOTH: {
		accentClassName: "bg-feed-pink",
		actionClassName: "bg-feed-pink! text-primary! hover:bg-feed-pink!",
		calendarAccent: {
			containerClassName: "bg-feed-pink/10",
			weekdayClassName: "bg-feed-pink/25",
			availableClassName: "bg-feed-pink/10",
			availableHoverClassName:
				"md:hover:border-primary md:hover:bg-feed-pink/25",
			todayBorderClassName: "border-feed-pink!",
		},
		sideLabel: "Fokus",
	},
	TEAM_ROOM: {
		accentClassName: "bg-feed-coral",
		actionClassName: "bg-feed-coral! text-primary! hover:bg-feed-coral!",
		calendarAccent: {
			containerClassName: "bg-feed-coral/10",
			weekdayClassName: "bg-feed-coral/25",
			availableClassName: "bg-feed-coral/10",
			availableHoverClassName:
				"md:hover:border-primary md:hover:bg-feed-coral/25",
			todayBorderClassName: "border-feed-coral!",
		},
		sideLabel: "Team",
	},
	MEETING_ROOM: {
		accentClassName: "bg-feed-amber",
		actionClassName: "bg-feed-amber! text-primary! hover:bg-feed-amber!",
		calendarAccent: {
			containerClassName: "bg-feed-amber/10",
			weekdayClassName: "bg-feed-amber/30",
			availableClassName: "bg-feed-amber/10",
			availableHoverClassName:
				"md:hover:border-primary md:hover:bg-feed-amber/25",
			todayBorderClassName: "border-feed-amber!",
		},
		sideLabel: "Meet",
	},
};

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

function parseTimeToMinutes(time: string): number {
	const [hours, minutes] = time.split(":").map(Number);
	return hours * 60 + minutes;
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
	return `am ${bookingSummaryDateFormatter.format(parseDate(date))}`;
}

function formatBookingSummaryDuration(
	startTime: string,
	endTime: string,
): string {
	const durationMinutes =
		parseTimeToMinutes(endTime) - parseTimeToMinutes(startTime);

	if (durationMinutes <= 0) {
		return "";
	}

	return formatDuration(durationMinutes);
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
	const accentTheme = bookingAccentThemeByUnitType[unitType.name];
	const capacityLabel =
		bookingContext.mode === "DIRECT"
			? `${bookingContext.unit.capacity} Personen`
			: `${bookingContext.area.seatCount} Einzelplätze`;
	const durationLabel = `min. ${formatDuration(
		unitType.minDurationMinutes,
	)} - max. ${formatDuration(unitType.maxDurationMinutes)}`;
	const selectionModeLabel =
		bookingContext.mode === "DIRECT" ? "Direkte Unit" : "Auto-Assign";

	const isBookingSelectionComplete =
		date !== "" && startTime !== "" && endTime !== "";
	const bookingSummary = isBookingSelectionComplete
		? {
				date: formatBookingSummaryDate(date),
				duration: formatBookingSummaryDuration(startTime, endTime),
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
		<form className="mt-8" onSubmit={handleSubmit}>
			<section
				className={clsx(
					"grid min-h-[24rem] content-between p-5 text-primary md:p-6 lg:grid-cols-[1fr_0.9fr] lg:p-8",
					accentTheme.accentClassName,
				)}
				aria-labelledby="booking-context-title"
			>
				<div className="flex items-start justify-between gap-5 lg:col-span-2">
					<span className="rotate-180 text-3xl font-black leading-none text-white/70 [writing-mode:vertical-rl] md:text-4xl">
						{accentTheme.sideLabel}
					</span>
					<span className="bg-primary/10 px-3 py-1.5 text-xs font-black md:text-sm">
						{formatUnitTypeName(unitType.name)}
					</span>
				</div>

				<div className="mt-12 self-end lg:mt-16">
					<p className="text-sm font-black uppercase tracking-[0.18em]">
						Booking Context
					</p>
					<h2
						id="booking-context-title"
						className="mt-3 text-4xl font-black leading-none md:text-6xl"
					>
						{title}
					</h2>
					<p className="mt-5 max-w-2xl text-base font-semibold leading-7 md:text-lg">
						{description}
					</p>
				</div>

				<dl className="mt-10 grid self-end text-sm font-black sm:grid-cols-3 lg:mt-0">
					<div className="bg-primary px-4 py-3 text-primary-soft">
						<dt className="text-primary-soft/70">Auswahl</dt>
						<dd>{selectionModeLabel}</dd>
					</div>
					<div className="bg-primary/10 px-4 py-3">
						<dt className="text-primary/55">Kapazität</dt>
						<dd>{capacityLabel}</dd>
					</div>
					<div className="bg-primary/10 px-4 py-3">
						<dt className="text-primary/55">Dauer</dt>
						<dd>{durationLabel}</dd>
					</div>
				</dl>
			</section>

			<section className="mt-10 grid border-y-4 border-primary lg:grid-cols-[18rem_1fr]">
				<div className="bg-primary p-5 text-primary-soft md:p-6">
					<p className="text-sm font-black uppercase tracking-[0.18em]">
						Datum
					</p>
					<h3 className="type-section-title mt-5">Wähle deinen Werktag</h3>
				</div>
				<div className="p-0 lg:p-6 lg:pr-0">
					<p className="my-4 text-sm font-semibold text-muted lg:mb-4 lg:mt-0">
						Wähle einen verfügbaren Werktag. Wochenenden und vergangene Tage
						sind nicht buchbar.
					</p>
					<CustomCalendar
						accent={accentTheme.calendarAccent}
						dayStates={calendarDayStates}
						isLoadingStates={isLoadingCalendarStates}
						onDateSelect={handleDateSelect}
						onVisibleMonthChange={setVisibleMonth}
						selectedDate={date}
						visibleMonth={visibleMonth}
					/>
					{calendarStatesError && (
						<FeedbackBox variant="error" className="mt-3">
							{calendarStatesError}
						</FeedbackBox>
					)}
				</div>
			</section>

			{date !== "" && (
				<>
					{isLoadingBookingAvailability && (
						<p className="mt-6 bg-primary/10 px-3 py-2 text-sm font-semibold text-muted">
							Verfügbarkeit wird geladen…
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
								mode={bookingContext.mode === "DIRECT" ? "DIRECT" : "HOT_DESK"}
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
			<div className="mt-8 border-t-4 border-primary pt-5">
				{bookingSummary && (
					<div
						className={clsx(
							"mb-5 px-4 py-4 text-lg font-black leading-tight text-primary md:px-5 md:text-2xl",
							accentTheme.calendarAccent.weekdayClassName,
						)}
					>
						<div className="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-3">
							<span>{bookingSummary.target}</span>
							<span className="hidden text-primary/55 sm:inline">|</span>
							<span>{bookingSummary.date}</span>
							<span className="hidden text-primary/55 sm:inline">|</span>
							<span>{bookingSummary.duration}</span>
							<span className="hidden text-primary/55 sm:inline">→</span>
							<span className="tabular-nums">{bookingSummary.time}</span>
						</div>
					</div>
				)}
				<div className="flex justify-end">
					<Button
						type="submit"
						disabled={isSubmitting || !isBookingSelectionComplete}
						className={clsx(
							"min-h-14 w-full shrink-0 px-6 text-base sm:w-auto",
							isBookingSelectionComplete && accentTheme.actionClassName,
						)}
					>
						{isSubmitting ? "Buchung wird erstellt…" : "Buchung erstellen"}
					</Button>
				</div>
			</div>
		</form>
	);
}
