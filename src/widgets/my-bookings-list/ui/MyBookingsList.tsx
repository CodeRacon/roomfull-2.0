import ChevronRightIcon from "@public/icons/general/ic-chevron-right.svg";
import { clsx } from "clsx";
import { useState } from "react";
import {
	type Booking,
	createBookingDateTimeFormatter,
	formatBookingDateKey,
	isSameBookingDay,
	type MyBooking,
} from "@/entities/booking";
import { formatUnitTypeName } from "@/entities/unit";
import {
	CancelBookingCardAction,
	CancelBookingCompactAction,
	CancelBookingWorkflow,
} from "@/features/booking/cancel-booking";
import { ExportBookingCalendarButton } from "@/features/booking/export-booking-calendar";
import type { Dictionary, Locale } from "@/shared/i18n";
import { Calendar, FeedbackBox } from "@/shared/ui";

type MyBookingsListProps = {
	bookings: MyBooking[];
	copy: Dictionary["myBookings"];
	highlightedBookingId?: string | null;
	locale: Locale;
	onBookingCancelError: (message: string) => void;
	onBookingCancelled: (booking: Booking) => void;
	onViewModeChange: (viewMode: MyBookingsViewMode) => void;
	viewMode: MyBookingsViewMode;
};

type BookingCardTone = "active" | "past";
export type MyBookingsViewMode = "cards" | "list" | "calendar";
type MyBookingsCopy = Dictionary["myBookings"];

const intlLocaleByLocale: Record<Locale, string> = {
	de: "de-DE",
	en: "en-US",
};

function createBookingFormatters(locale: Locale) {
	const intlLocale = intlLocaleByLocale[locale];

	return {
		dateTime: createBookingDateTimeFormatter(intlLocale, {
			weekday: "long",
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		}),
		day: createBookingDateTimeFormatter(intlLocale, {
			weekday: "long",
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
		}),
		time: createBookingDateTimeFormatter(intlLocale, {
			hour: "2-digit",
			minute: "2-digit",
		}),
		listDay: createBookingDateTimeFormatter(intlLocale, {
			weekday: "short",
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
		}),
	};
}

const bookingFormattersByLocale: Record<
	Locale,
	ReturnType<typeof createBookingFormatters>
> = {
	de: createBookingFormatters("de"),
	en: createBookingFormatters("en"),
};

const calendarExportButtonClassName =
	"inline-flex min-h-10 items-center justify-center gap-2 border-2 border-accent bg-background px-3 py-2 text-sm font-black text-accent transition-colors hover:bg-accent-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";
const maxVisibleCalendarLabels = 3;
const myBookingsCalendarAccent = {
	containerClassName: "bg-background",
	weekdayClassName: "bg-primary text-on-primary",
};

function formatTemplate(
	template: string,
	values: Record<string, string | number>,
): string {
	return Object.entries(values).reduce(
		(result, [key, value]) => result.replace(`{${key}}`, String(value)),
		template,
	);
}

function formatBookingWindow(
	startTime: string,
	endTime: string,
	locale: Locale,
	copy: MyBookingsCopy["dateTime"],
): string {
	const start = new Date(startTime);
	const end = new Date(endTime);
	const formatters = bookingFormattersByLocale[locale];

	if (isSameBookingDay(start, end)) {
		return formatTemplate(copy.sameDay, {
			date: formatters.day.format(start),
			start: formatters.time.format(start),
			end: formatters.time.format(end),
		});
	}

	return formatTemplate(copy.crossDay, {
		start: formatters.dateTime.format(start),
		end: formatters.dateTime.format(end),
	});
}

function formatBookingListWindow(
	startTime: string,
	endTime: string,
	locale: Locale,
	copy: MyBookingsCopy["dateTime"],
): string {
	const start = new Date(startTime);
	const end = new Date(endTime);
	const formatters = bookingFormattersByLocale[locale];

	if (isSameBookingDay(start, end)) {
		return formatTemplate(copy.listSameDay, {
			date: formatters.listDay.format(start),
			start: formatters.time.format(start),
			end: formatters.time.format(end),
		});
	}

	return formatTemplate(copy.listCrossDay, {
		start: formatters.dateTime.format(start),
		end: formatters.dateTime.format(end),
	});
}

function formatBookingStatus(
	status: Booking["status"],
	copy: MyBookingsCopy["status"],
): string {
	switch (status) {
		case "ACTIVE":
			return copy.active;
		case "CANCELLED":
			return copy.cancelled;
	}
}

function getBookingAccentClassName(
	unitTypeName: MyBooking["unit"]["unitType"]["name"],
): string {
	switch (unitTypeName) {
		case "HOT_DESK":
			return "bg-unit-hot-desk";
		case "BOOTH":
			return "bg-unit-booth";
		case "TEAM_ROOM":
			return "bg-unit-team-room";
		case "MEETING_ROOM":
			return "bg-unit-meeting-room";
	}
}

function compareByStartAsc(left: MyBooking, right: MyBooking): number {
	return (
		new Date(left.startTime).getTime() - new Date(right.startTime).getTime()
	);
}

function compareByStartDesc(left: MyBooking, right: MyBooking): number {
	return compareByStartAsc(right, left);
}

function getBookingDateKey(booking: MyBooking): string {
	return formatBookingDateKey(booking.startTime);
}

function getBookingMonth(booking: MyBooking): string {
	return `${getBookingDateKey(booking).slice(0, 7)}-01`;
}

function getCurrentMonth(): string {
	return `${formatBookingDateKey(new Date()).slice(0, 7)}-01`;
}

function getInitialVisibleMonth(bookings: MyBooking[]): string {
	return bookings[0] ? getBookingMonth(bookings[0]) : getCurrentMonth();
}

function getBookingsByDate(bookings: MyBooking[]): Record<string, MyBooking[]> {
	return bookings.reduce<Record<string, MyBooking[]>>(
		(bookingsByDate, booking) => {
			const date = getBookingDateKey(booking);

			bookingsByDate[date] = [...(bookingsByDate[date] ?? []), booking];
			bookingsByDate[date].sort(compareByStartAsc);

			return bookingsByDate;
		},
		{},
	);
}

function canExportBooking(booking: MyBooking, tone: BookingCardTone): boolean {
	return tone === "active" && booking.status === "ACTIVE";
}

function canCancelMyBooking(booking: MyBooking): boolean {
	return (
		booking.status === "ACTIVE" && new Date(booking.startTime) > new Date()
	);
}

function BookingMetaTag({ children }: { children: string }) {
	return (
		<span className="inline-flex min-h-8 items-center bg-primary/10 px-3 py-1.5 text-xs font-black text-primary">
			{children}
		</span>
	);
}

function MyBookingsViewModeSwitch({
	copy,
	onViewModeChange,
	viewMode,
}: {
	copy: MyBookingsCopy["views"];
	onViewModeChange: (viewMode: MyBookingsViewMode) => void;
	viewMode: MyBookingsViewMode;
}) {
	const modes: Array<{ label: string; value: MyBookingsViewMode }> = [
		{ label: copy.cards, value: "cards" },
		{ label: copy.list, value: "list" },
		{ label: copy.calendar, value: "calendar" },
	];

	return (
		<div className="mt-8 inline-grid grid-cols-3 border-2 border-primary">
			{modes.map((mode, index) => {
				const isActive = viewMode === mode.value;

				return (
					<button
						key={mode.value}
						type="button"
						aria-pressed={isActive}
						onClick={() => onViewModeChange(mode.value)}
						className={`min-h-11 border-primary px-4 py-2 text-sm font-black transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-focus ${
							index > 0 ? "border-l-2" : ""
						} ${
							isActive
								? "bg-primary text-on-primary"
								: "bg-background text-primary hover:bg-primary/10"
						}`}
					>
						{mode.label}
					</button>
				);
			})}
		</div>
	);
}

function getCalendarMarkerColorClassName(
	unitTypeName: MyBooking["unit"]["unitType"]["name"],
): string {
	switch (unitTypeName) {
		case "HOT_DESK":
			return "border-unit-hot-desk bg-unit-hot-desk/25 text-success-text";
		case "BOOTH":
			return "border-unit-booth bg-danger-bg text-danger-text";
		case "TEAM_ROOM":
			return "border-unit-team-room bg-unit-team-room/25 text-text";
		case "MEETING_ROOM":
			return "border-unit-meeting-room bg-warning-bg text-warning-text";
	}
}

function getCalendarMarkerClassName(
	unitTypeName: MyBooking["unit"]["unitType"]["name"],
): string {
	return `block h-2 w-full border-2 sm:h-auto sm:truncate sm:px-1.5 sm:py-1 sm:text-left sm:text-[10px] sm:font-black sm:leading-tight ${getCalendarMarkerColorClassName(
		unitTypeName,
	)}`;
}

function MyBookingsCalendarLegend() {
	const unitTypes: Array<MyBooking["unit"]["unitType"]["name"]> = [
		"HOT_DESK",
		"BOOTH",
		"TEAM_ROOM",
		"MEETING_ROOM",
	];

	return (
		<div className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
			{unitTypes.map((unitTypeName) => (
				<div
					key={unitTypeName}
					className="flex min-h-10 items-center gap-2 border-2 border-primary bg-background px-3 py-2 text-xs font-black text-primary"
				>
					<span
						className={`h-3 w-8 border-2 ${getCalendarMarkerColorClassName(
							unitTypeName,
						)}`}
						aria-hidden="true"
					/>
					<span>{formatUnitTypeName(unitTypeName)}</span>
				</div>
			))}
		</div>
	);
}

function BookingCard({
	booking,
	copy,
	isHighlighted = false,
	locale,
	tone = "active",
}: {
	booking: MyBooking;
	copy: MyBookingsCopy;
	isHighlighted?: boolean;
	locale: Locale;
	tone?: BookingCardTone;
}) {
	const isPast = tone === "past";
	const canExportCalendar = canExportBooking(booking, tone);
	const canCancelBooking = canCancelMyBooking(booking);

	return (
		<article
			key={booking.id}
			className={clsx(
				"grid min-h-64 border-2 bg-background sm:grid-rows-[0.5rem_1fr]",
				isPast ? "border-primary/30 opacity-70" : "border-primary",
				isHighlighted && "booking-card--highlight",
			)}
		>
			<div
				className={clsx(
					"h-2 w-full",
					getBookingAccentClassName(booking.unit.unitType.name),
				)}
				aria-hidden="true"
			/>
			<div className="flex min-h-56 flex-col p-5">
				<div className="min-w-0">
					<p className="truncate text-2xl font-black leading-none text-primary">
						{booking.unit.name}
					</p>
					<p className="mt-3 text-sm font-semibold leading-6 text-muted">
						{formatBookingWindow(
							booking.startTime,
							booking.endTime,
							locale,
							copy.dateTime,
						)}
					</p>
				</div>

				<div className="mt-5 flex flex-wrap gap-2">
					<BookingMetaTag>
						{formatUnitTypeName(booking.unit.unitType.name)}
					</BookingMetaTag>
					<BookingMetaTag>
						{formatBookingStatus(booking.status, copy.status)}
					</BookingMetaTag>
					{isPast && <BookingMetaTag>{copy.status.past}</BookingMetaTag>}
				</div>

				<div className="mt-auto flex flex-wrap gap-3 pt-8">
					{canExportCalendar && (
						<ExportBookingCalendarButton
							ariaLabel={copy.actions.downloadIcsAriaLabel}
							booking={booking}
							className={calendarExportButtonClassName}
							iconClassName="size-4"
						>
							{copy.actions.downloadIcs}
						</ExportBookingCalendarButton>
					)}
					{canCancelBooking && (
						<CancelBookingCardAction bookingId={booking.id} />
					)}
				</div>
			</div>
		</article>
	);
}

function BookingListRow({
	booking,
	copy,
	isHighlighted = false,
	locale,
	tone,
}: {
	booking: MyBooking;
	copy: MyBookingsCopy;
	isHighlighted?: boolean;
	locale: Locale;
	tone: BookingCardTone;
}) {
	const isPast = tone === "past";
	const canExportCalendar = canExportBooking(booking, tone);
	const canCancelBooking = canCancelMyBooking(booking);

	return (
		<article
			className={clsx(
				"grid border-2 bg-background md:grid-cols-[0.5rem_minmax(0,1fr)]",
				isPast ? "border-primary/30 opacity-70" : "border-primary",
				isHighlighted && "booking-card--highlight",
			)}
		>
			<div
				className={clsx(
					"h-2 w-full md:h-full md:w-2",
					getBookingAccentClassName(booking.unit.unitType.name),
				)}
				aria-hidden="true"
			/>
			<div className="flex flex-col gap-3">
				<div className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
					<div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-4 gap-y-2">
						<p className="min-w-36 truncate text-base font-black text-primary">
							{booking.unit.name}
						</p>
						<p className="text-sm font-semibold text-muted">
							{formatBookingListWindow(
								booking.startTime,
								booking.endTime,
								locale,
								copy.dateTime,
							)}
						</p>
						<BookingMetaTag>
							{formatUnitTypeName(booking.unit.unitType.name)}
						</BookingMetaTag>
						<BookingMetaTag>
							{formatBookingStatus(booking.status, copy.status)}
						</BookingMetaTag>
						{isPast && <BookingMetaTag>{copy.status.past}</BookingMetaTag>}
					</div>
					{(canExportCalendar || canCancelBooking) && (
						<div className="flex shrink-0 flex-wrap items-center gap-2">
							{canExportCalendar && (
								<ExportBookingCalendarButton
									ariaLabel={copy.actions.downloadIcsAriaLabel}
									booking={booking}
									className={calendarExportButtonClassName}
									iconClassName="size-4"
								>
									{copy.actions.downloadIcsShort}
								</ExportBookingCalendarButton>
							)}
							{canCancelBooking && (
								<CancelBookingCompactAction bookingId={booking.id} />
							)}
						</div>
					)}
				</div>
			</div>
		</article>
	);
}

function BookingCalendarView({
	bookings,
	copy,
	highlightedBookingId,
	locale,
	tone,
}: {
	bookings: MyBooking[];
	copy: MyBookingsCopy;
	highlightedBookingId?: string | null;
	locale: Locale;
	tone: BookingCardTone;
}) {
	const initialSelectedDate =
		highlightedBookingId &&
		bookings.some((booking) => booking.id === highlightedBookingId)
			? getBookingDateKey(
					bookings.find((booking) => booking.id === highlightedBookingId) ??
						bookings[0],
				)
			: getBookingDateKey(bookings[0]);
	const [visibleMonth, setVisibleMonth] = useState(() =>
		getInitialVisibleMonth(bookings),
	);
	const [selectedDate, setSelectedDate] = useState(initialSelectedDate);
	const bookingsByDate = getBookingsByDate(bookings);
	const selectedDayBookings = bookingsByDate[selectedDate] ?? [];

	return (
		<div className="mt-4">
			<MyBookingsCalendarLegend />
			<Calendar
				accent={myBookingsCalendarAccent}
				copy={{
					nextMonth: copy.calendar.nextMonth,
					nextMonthAriaLabel: copy.calendar.nextMonthAriaLabel,
					previousMonth: copy.calendar.previousMonth,
					previousMonthAriaLabel: copy.calendar.previousMonthAriaLabel,
					weekdayLabels: copy.calendar.weekdayLabels,
				}}
				monthLocale={copy.calendar.monthLocale}
				visibleMonth={visibleMonth}
				onVisibleMonthChange={setVisibleMonth}
				renderDay={({ date, dayNumber, isOutsideMonth }) => {
					const dayBookings = bookingsByDate[date] ?? [];
					const hasBookings = dayBookings.length > 0;
					const isSelectedDate = date === selectedDate;
					const visibleBookings = dayBookings.slice(
						0,
						maxVisibleCalendarLabels,
					);
					const overflowBookingCount =
						dayBookings.length - visibleBookings.length;
					const dayNumberClassName = clsx(
						"block text-xs font-black",
						isSelectedDate && "text-on-primary",
						!isSelectedDate && isOutsideMonth && "text-muted",
						!isSelectedDate && !isOutsideMonth && "text-primary",
					);
					const overflowClassName = clsx(
						"truncate px-1.5 py-1 text-[10px] font-black",
						isSelectedDate
							? "bg-on-primary/15 text-on-primary"
							: "bg-primary/10 text-primary",
					);

					const dayContent = (
						<>
							<span className={dayNumberClassName}>{dayNumber}</span>
							{visibleBookings.length > 0 && (
								<div className="mt-2 grid gap-1">
									{visibleBookings.map((booking) => {
										const label = formatUnitTypeName(
											booking.unit.unitType.name,
										);

										return (
											<span
												key={booking.id}
												className={getCalendarMarkerClassName(
													booking.unit.unitType.name,
												)}
												aria-hidden="true"
											>
												<span className="hidden sm:inline">{label}</span>
											</span>
										);
									})}
									{overflowBookingCount > 0 && (
										<span className={overflowClassName}>
											+{overflowBookingCount}
										</span>
									)}
								</div>
							)}
						</>
					);

					const dayClassName = clsx(
						"min-h-20 border-2 p-1.5 text-left text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-focus sm:min-h-24",
						isSelectedDate && "border-primary bg-primary text-on-primary",
						!isSelectedDate &&
							isOutsideMonth &&
							"border-primary/10 bg-primary/5 opacity-45",
						!isSelectedDate &&
							!isOutsideMonth &&
							"border-primary bg-background text-primary",
						hasBookings && "cursor-pointer",
						hasBookings && !isSelectedDate && "hover:bg-primary/10",
					);

					if (!hasBookings) {
						return <div className={dayClassName}>{dayContent}</div>;
					}

					return (
						<button
							type="button"
							onClick={() => setSelectedDate(date)}
							className={dayClassName}
							aria-pressed={isSelectedDate}
							aria-label={formatTemplate(copy.calendar.showBookings, {
								date,
								count: dayBookings.length,
								bookingLabel:
									dayBookings.length === 1
										? copy.calendar.bookingOne
										: copy.calendar.bookingsMany,
							})}
						>
							{dayContent}
						</button>
					);
				}}
			/>
			{selectedDayBookings.length > 0 && (
				<div className="mt-4 border-t-4 border-primary pt-4">
					<p className="inline-flex bg-primary px-3 py-2 text-sm font-black text-on-primary">
						{bookingFormattersByLocale[locale].day.format(
							new Date(`${selectedDate}T00:00:00`),
						)}
					</p>
					<div className="mt-3 grid gap-3">
						{selectedDayBookings.map((booking) => (
							<BookingListRow
								key={booking.id}
								booking={booking}
								copy={copy}
								isHighlighted={booking.id === highlightedBookingId}
								locale={locale}
								tone={tone}
							/>
						))}
					</div>
				</div>
			)}
		</div>
	);
}

function BookingSection({
	bookings,
	copy,
	defaultOpen = true,
	emptyText,
	highlightedBookingId,
	locale,
	tone,
	title,
	viewMode,
}: {
	bookings: MyBooking[];
	copy: MyBookingsCopy;
	defaultOpen?: boolean;
	emptyText: string;
	highlightedBookingId?: string | null;
	locale: Locale;
	tone: BookingCardTone;
	title: string;
	viewMode: MyBookingsViewMode;
}) {
	return (
		<details open={defaultOpen} className="group mt-10">
			<summary className="cursor-pointer list-none border-y-4 border-primary bg-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">
				<div className="grid md:grid-cols-[minmax(0,1fr)_auto]">
					<div className="flex min-h-16 min-w-0 items-center gap-3 bg-primary px-4 py-3 text-on-primary">
						<h2 className="min-w-0 text-xl font-black leading-tight text-pretty md:text-2xl">
							{title}
						</h2>
						<ChevronRightIcon
							className="size-6 shrink-0 transition-transform duration-200 ease-out group-open:rotate-90 motion-reduce:transition-none"
							aria-hidden="true"
						/>
					</div>
					<div className="mx-1 mb-0 flex min-h-14 items-center bg-on-primary px-4 py-3 text-sm font-black text-primary md:mx-0 md:mb-0 md:mr-1">
						{bookings.length}{" "}
						{bookings.length === 1
							? copy.sections.bookingOne
							: copy.sections.bookingsMany}
					</div>
				</div>
			</summary>
			{bookings.length === 0 ? (
				<FeedbackBox variant="empty" className="w-fit! mt-4">
					{emptyText}
				</FeedbackBox>
			) : viewMode === "calendar" ? (
				<BookingCalendarView
					bookings={bookings}
					copy={copy}
					highlightedBookingId={highlightedBookingId}
					locale={locale}
					tone={tone}
				/>
			) : viewMode === "list" ? (
				<div className="mt-4 grid gap-3">
					{bookings.map((booking) => (
						<BookingListRow
							key={booking.id}
							booking={booking}
							copy={copy}
							isHighlighted={booking.id === highlightedBookingId}
							locale={locale}
							tone={tone}
						/>
					))}
				</div>
			) : (
				<div className="mt-4 grid gap-4 sm:grid-cols-2">
					{bookings.map((booking) => (
						<BookingCard
							key={booking.id}
							booking={booking}
							copy={copy}
							isHighlighted={booking.id === highlightedBookingId}
							locale={locale}
							tone={tone}
						/>
					))}
				</div>
			)}
		</details>
	);
}

export function MyBookingsList({
	bookings,
	copy,
	highlightedBookingId,
	locale,
	onBookingCancelError,
	onBookingCancelled,
	onViewModeChange,
	viewMode,
}: MyBookingsListProps) {
	if (bookings.length === 0) {
		return (
			<FeedbackBox variant="empty" className="mt-8">
				{copy.sections.noBookings}
			</FeedbackBox>
		);
	}

	const now = new Date();
	const upcomingBookings = bookings
		.filter(
			(booking) =>
				booking.status === "ACTIVE" && new Date(booking.endTime) >= now,
		)
		.sort(compareByStartAsc);
	const pastBookings = bookings
		.filter(
			(booking) =>
				booking.status === "CANCELLED" || new Date(booking.endTime) < now,
		)
		.sort(compareByStartDesc);

	return (
		<CancelBookingWorkflow
			key={viewMode}
			copy={copy}
			onCancelled={onBookingCancelled}
			onError={onBookingCancelError}
		>
			<MyBookingsViewModeSwitch
				copy={copy.views}
				onViewModeChange={onViewModeChange}
				viewMode={viewMode}
			/>
			<BookingSection
				bookings={upcomingBookings}
				copy={copy}
				emptyText={copy.sections.upcomingEmpty}
				highlightedBookingId={highlightedBookingId}
				locale={locale}
				tone="active"
				title={copy.sections.upcomingTitle}
				viewMode={viewMode}
			/>
			<BookingSection
				bookings={pastBookings}
				copy={copy}
				defaultOpen={false}
				emptyText={copy.sections.pastEmpty}
				highlightedBookingId={highlightedBookingId}
				locale={locale}
				tone="past"
				title={copy.sections.pastTitle}
				viewMode={viewMode}
			/>
		</CancelBookingWorkflow>
	);
}
