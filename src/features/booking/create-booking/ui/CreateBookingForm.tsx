"use client";

import { clsx } from "clsx";
import { useRouter } from "next/navigation";
import { type ComponentPropsWithoutRef, useEffect, useState } from "react";
import type { BookingAvailability, BookingContext } from "@/entities/booking";
import {
	createBooking,
	formatBookingDateKey,
	getBookingAvailability,
	getDirectBookingCalendarState,
} from "@/entities/booking";
import { useSession } from "@/entities/session";
import type { UnitTypeName } from "@/entities/unit";
import { formatUnitTypeName } from "@/entities/unit";
import { ApiRequestError } from "@/shared/api";
import type { Dictionary, Locale } from "@/shared/i18n";
import { appRoutes } from "@/shared/routing";
import { Button, FeedbackBox } from "@/shared/ui";
import {
	buildBookingSummary,
	createBookingInputFromSelection,
	getBookingContextView,
	isBookingSelectionComplete,
	resetBookingSelectionDate,
	resetBookingSelectionStartTime,
	resolveCreateBookingSubmitError,
} from "../model";
import { BookingTimePicker } from "./BookingTimePicker";
import {
	type CalendarDayState,
	CustomCalendar,
	type CustomCalendarAccentClasses,
} from "./CustomCalendar";

type CreateBookingFormProps = {
	bookingContext: BookingContext;
	copy: Dictionary["createBooking"];
	locale: Locale;
};

type FormSubmitHandler = NonNullable<
	ComponentPropsWithoutRef<"form">["onSubmit"]
>;

type BookingAccentTheme = {
	accentClassName: string;
	actionClassName: string;
	calendarAccent: CustomCalendarAccentClasses;
};

const bookingAccentThemeByUnitType: Record<UnitTypeName, BookingAccentTheme> = {
	HOT_DESK: {
		accentClassName: "bg-unit-hot-desk",
		actionClassName: "bg-unit-hot-desk! text-primary! hover:bg-unit-hot-desk!",
		calendarAccent: {
			containerClassName: "bg-unit-hot-desk/10",
			weekdayClassName: "bg-unit-hot-desk/30",
			availableClassName: "bg-unit-hot-desk/10",
			availableHoverClassName:
				"md:hover:border-primary md:hover:bg-unit-hot-desk/25",
			todayBorderClassName: "border-unit-hot-desk!",
		},
	},
	BOOTH: {
		accentClassName: "bg-unit-booth",
		actionClassName: "bg-unit-booth! text-primary! hover:bg-unit-booth!",
		calendarAccent: {
			containerClassName: "bg-unit-booth/10",
			weekdayClassName: "bg-unit-booth/25",
			availableClassName: "bg-unit-booth/10",
			availableHoverClassName:
				"md:hover:border-primary md:hover:bg-unit-booth/25",
			todayBorderClassName: "border-unit-booth!",
		},
	},
	TEAM_ROOM: {
		accentClassName: "bg-unit-team-room",
		actionClassName:
			"bg-unit-team-room! text-primary! hover:bg-unit-team-room!",
		calendarAccent: {
			containerClassName: "bg-unit-team-room/10",
			weekdayClassName: "bg-unit-team-room/25",
			availableClassName: "bg-unit-team-room/10",
			availableHoverClassName:
				"md:hover:border-primary md:hover:bg-unit-team-room/25",
			todayBorderClassName: "border-unit-team-room!",
		},
	},
	MEETING_ROOM: {
		accentClassName: "bg-unit-meeting-room",
		actionClassName:
			"bg-unit-meeting-room! text-primary! hover:bg-unit-meeting-room!",
		calendarAccent: {
			containerClassName: "bg-unit-meeting-room/10",
			weekdayClassName: "bg-unit-meeting-room/30",
			availableClassName: "bg-unit-meeting-room/10",
			availableHoverClassName:
				"md:hover:border-primary md:hover:bg-unit-meeting-room/25",
			todayBorderClassName: "border-unit-meeting-room!",
		},
	},
};

function getBerlinTodayDate(): string {
	return formatBookingDateKey(new Date());
}

function getCurrentBerlinMonth(): string {
	return `${getBerlinTodayDate().slice(0, 7)}-01`;
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

function formatDuration(
	minutes: number,
	copy: Dictionary["createBooking"]["summary"]["duration"],
): string {
	const hours = Math.floor(minutes / 60);
	const remainingMinutes = minutes % 60;

	if (hours === 0) {
		return formatTemplate(copy.minutes, { count: remainingMinutes });
	}

	if (remainingMinutes === 0) {
		return formatTemplate(copy.hours, { count: hours });
	}

	return formatTemplate(copy.hoursAndMinutes, {
		hours,
		minutes: remainingMinutes,
	});
}

function formatCapacityLabel(
	count: number,
	oneTemplate: string,
	manyTemplate: string,
): string {
	return formatTemplate(count === 1 ? oneTemplate : manyTemplate, { count });
}

export function CreateBookingForm({
	bookingContext,
	copy,
	locale,
}: CreateBookingFormProps) {
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

		async function loadCalendarStates(): Promise<void> {
			setCalendarDayStates({});
			setCalendarStatesError(null);
			setIsLoadingCalendarStates(true);

			try {
				const calendarState = await getDirectBookingCalendarState(
					unitId,
					visibleMonth.slice(0, 7),
				);

				setCalendarDayStates(
					Object.fromEntries(
						calendarState.days.map((day) => [day.date, day.state]),
					),
				);
			} catch (error) {
				if (error instanceof ApiRequestError && error.status === 401) {
					endSession();
					return;
				}

				setCalendarStatesError(copy.errors.calendarStatesFallback);
			} finally {
				setIsLoadingCalendarStates(false);
			}
		}

		void loadCalendarStates();
	}, [
		directUnitId,
		endSession,
		visibleMonth,
		copy.errors.calendarStatesFallback,
	]);

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

				setBookingAvailabilityError(copy.errors.availabilityFallback);
			} finally {
				setIsLoadingBookingAvailability(false);
			}
		}

		void loadBookingAvailability();
	}, [bookingContext, date, endSession, copy.errors.availabilityFallback]);

	function handleDateSelect(selectedDate: string): void {
		const nextSelection = resetBookingSelectionDate(
			{ date, startTime, endTime },
			selectedDate,
		);
		setDate(nextSelection.date);
		setStartTime(nextSelection.startTime);
		setEndTime(nextSelection.endTime);
		setSubmitError(null);
	}

	const bookingSelection = { date, startTime, endTime };
	const bookingContextView = getBookingContextView({
		bookingContext,
		fallbackAreaDescription: copy.context.fallbackAreaDescription,
	});
	const { title, description, unitType } = bookingContextView;
	const accentTheme = bookingAccentThemeByUnitType[unitType.name];
	const capacityLabel = formatCapacityLabel(
		bookingContextView.capacityCount,
		bookingContextView.capacityKind === "person"
			? copy.context.capacityLabels.onePerson
			: copy.context.capacityLabels.oneDesk,
		bookingContextView.capacityKind === "person"
			? copy.context.capacityLabels.people
			: copy.context.capacityLabels.desks,
	);
	const durationLabel = formatTemplate(copy.context.durationRange, {
		min: formatDuration(unitType.minDurationMinutes, copy.summary.duration),
		max: formatDuration(unitType.maxDurationMinutes, copy.summary.duration),
	});
	const selectionModeLabel =
		bookingContextView.selectionMode === "DIRECT"
			? copy.context.directMode
			: copy.context.autoAssignMode;

	const isSelectionComplete = isBookingSelectionComplete(bookingSelection);
	const bookingSummary = buildBookingSummary({
		selection: bookingSelection,
		target: title,
		copy: copy.summary,
	});

	const handleSubmit: FormSubmitHandler = async (event) => {
		event.preventDefault();
		setSubmitError(null);

		const input = createBookingInputFromSelection(
			bookingContext,
			bookingSelection,
		);

		if (!input) {
			setSubmitError(copy.errors.incompleteSelection);
			return;
		}

		try {
			setIsSubmitting(true);
			await createBooking(input);
			router.replace(`${appRoutes.myBookings(locale)}?created=1`);
		} catch (error) {
			const submitError = resolveCreateBookingSubmitError(error, copy.errors);

			if (submitError.type === "unauthorized") {
				endSession();
				return;
			}

			setSubmitError(submitError.message);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<form className="mt-8" onSubmit={handleSubmit}>
			<section
				className={clsx(
					"grid min-h-96 content-between p-5 text-primary md:p-6 lg:grid-cols-[1fr_0.9fr] lg:p-8",
					accentTheme.accentClassName,
				)}
				aria-labelledby="booking-context-title"
			>
				<div className="flex items-start justify-between gap-5 lg:col-span-2">
					<span className="rotate-180 text-3xl font-black leading-none text-white/70 [writing-mode:vertical-rl] md:text-4xl">
						{copy.context.sideLabels[unitType.name]}
					</span>
					<span className="bg-primary/10 px-3 py-1.5 text-xs font-black md:text-sm">
						{formatUnitTypeName(unitType.name)}
					</span>
				</div>

				<div className="mt-12 self-end lg:mt-16">
					<p className="text-sm font-black uppercase tracking-[0.18em]">
						{copy.context.eyebrow}
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
					<div className="bg-primary px-4 py-3 text-on-primary">
						<dt className="text-on-primary/70">{copy.context.selection}</dt>
						<dd>{selectionModeLabel}</dd>
					</div>
					<div className="bg-primary/10 px-4 py-3">
						<dt className="text-primary/55">{copy.context.capacity}</dt>
						<dd>{capacityLabel}</dd>
					</div>
					<div className="bg-primary/10 px-4 py-3">
						<dt className="text-primary/55">{copy.context.duration}</dt>
						<dd>{durationLabel}</dd>
					</div>
				</dl>
			</section>

			<section className="mt-10 grid border-y-4 border-primary lg:grid-cols-[18rem_1fr]">
				<div className="bg-primary p-5 text-on-primary md:p-6">
					<p className="text-sm font-black uppercase tracking-[0.18em]">
						{copy.calendar.sectionEyebrow}
					</p>
					<h3 className="type-section-title mt-5">{copy.calendar.title}</h3>
				</div>
				<div className="p-0 lg:p-6 lg:pr-0">
					<p className="my-4 text-sm font-semibold text-muted lg:mb-4 lg:mt-0">
						{copy.calendar.intro}
					</p>
					<CustomCalendar
						accent={accentTheme.calendarAccent}
						copy={copy.calendar}
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
							{copy.timePicker.loadingAvailability}
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
								copy={copy.timePicker}
								endTime={endTime}
								mode={bookingContext.mode === "DIRECT" ? "DIRECT" : "HOT_DESK"}
								onEndTimeChange={setEndTime}
								onStartTimeChange={(nextStartTime) => {
									const nextSelection = resetBookingSelectionStartTime(
										bookingSelection,
										nextStartTime,
									);
									setStartTime(nextSelection.startTime);
									setEndTime(nextSelection.endTime);
								}}
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
						disabled={isSubmitting || !isSelectionComplete}
						className={clsx(
							"min-h-14 w-full shrink-0 px-6 text-base sm:w-auto",
							isSelectionComplete && accentTheme.actionClassName,
						)}
					>
						{isSubmitting ? copy.submit.pending : copy.submit.label}
					</Button>
				</div>
			</div>
		</form>
	);
}
