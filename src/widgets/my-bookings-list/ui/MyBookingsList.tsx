import ChevronRightIcon from "@public/icons/general/ic-chevron-right.svg";
import TrashIcon from "@public/icons/general/ic-trash.svg";
import "@/shared/ui/room-card/RoomCard.css";
import { useState } from "react";
import type { Booking, MyBooking } from "@/entities/booking";
import { formatUnitTypeName } from "@/entities/unit";
import { CancelBookingButton } from "@/features/booking/cancel-booking";
import { ExportBookingCalendarButton } from "@/features/booking/export-booking-calendar";
import {
	Badge,
	Button,
	Calendar,
	FeedbackBox,
	Panel,
	TextInput,
} from "@/shared/ui";

type MyBookingsListProps = {
	bookings: MyBooking[];
	highlightedBookingId?: string | null;
	onBookingCancelError: (message: string) => void;
	onBookingCancelled: (booking: Booking) => void;
	onViewModeChange: (viewMode: MyBookingsViewMode) => void;
	viewMode: MyBookingsViewMode;
};

type BookingCardTone = "active" | "past";
export type MyBookingsViewMode = "cards" | "list" | "calendar";

const dateTimeFormatter = new Intl.DateTimeFormat("de-DE", {
	weekday: "long",
	day: "2-digit",
	month: "2-digit",
	year: "numeric",
	hour: "2-digit",
	minute: "2-digit",
});

const bookingDayFormatter = new Intl.DateTimeFormat("de-DE", {
	weekday: "long",
	day: "2-digit",
	month: "2-digit",
	year: "numeric",
});

const bookingTimeFormatter = new Intl.DateTimeFormat("de-DE", {
	hour: "2-digit",
	minute: "2-digit",
});

const bookingListDayFormatter = new Intl.DateTimeFormat("de-DE", {
	weekday: "short",
	day: "2-digit",
	month: "2-digit",
	year: "numeric",
});

const calendarExportButtonClassName =
	"rounded-full bg-secondary-soft p-2 text-secondary shadow-xs transition-colors border-secondary-soft border hover:border-secondary hover:border";
const cancelTriggerButtonClassName =
	"rounded-full bg-danger-bg p-2 shadow-xs border border-danger-bg hover:border-danger-text hover:border";
const maxVisibleCalendarLabels = 3;

function isSameLocalDay(start: Date, end: Date): boolean {
	return (
		start.getFullYear() === end.getFullYear() &&
		start.getMonth() === end.getMonth() &&
		start.getDate() === end.getDate()
	);
}

function formatBookingWindow(startTime: string, endTime: string): string {
	const start = new Date(startTime);
	const end = new Date(endTime);

	if (isSameLocalDay(start, end)) {
		return `${bookingDayFormatter.format(start)} von ${bookingTimeFormatter.format(
			start,
		)} bis ${bookingTimeFormatter.format(end)} Uhr`;
	}

	return `${dateTimeFormatter.format(start)} Uhr bis ${dateTimeFormatter.format(
		end,
	)} Uhr`;
}

function formatBookingListWindow(startTime: string, endTime: string): string {
	const start = new Date(startTime);
	const end = new Date(endTime);

	if (isSameLocalDay(start, end)) {
		return `${bookingListDayFormatter.format(start)}, ${bookingTimeFormatter.format(
			start,
		)}-${bookingTimeFormatter.format(end)} Uhr`;
	}

	return `${dateTimeFormatter.format(start)} Uhr bis ${dateTimeFormatter.format(
		end,
	)} Uhr`;
}

function formatBookingStatus(status: Booking["status"]): string {
	switch (status) {
		case "ACTIVE":
			return "Aktiv";
		case "CANCELLED":
			return "Storniert";
	}
}

function getBookingCardClassName(
	unitTypeName: MyBooking["unit"]["unitType"]["name"],
) {
	switch (unitTypeName) {
		case "HOT_DESK":
			return "room-card--desk";
		case "BOOTH":
			return "room-card--booth";
		case "TEAM_ROOM":
			return "room-card--team";
		case "MEETING_ROOM":
			return "room-card--meeting";
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

function formatDateKey(date: Date): string {
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
		2,
		"0",
	)}-${String(date.getDate()).padStart(2, "0")}`;
}

function getBookingDateKey(booking: MyBooking): string {
	return formatDateKey(new Date(booking.startTime));
}

function getBookingMonth(booking: MyBooking): string {
	return `${getBookingDateKey(booking).slice(0, 7)}-01`;
}

function getCurrentMonth(): string {
	return `${formatDateKey(new Date()).slice(0, 7)}-01`;
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

function MyBookingsViewModeSwitch({
	onViewModeChange,
	viewMode,
}: {
	onViewModeChange: (viewMode: MyBookingsViewMode) => void;
	viewMode: MyBookingsViewMode;
}) {
	const modes: Array<{ label: string; value: MyBookingsViewMode }> = [
		{ label: "Karten", value: "cards" },
		{ label: "Liste", value: "list" },
		{ label: "Kalender", value: "calendar" },
	];

	return (
		<div className="mt-8 inline-flex gap-1 rounded-md border border-border bg-surface p-1 shadow-xs">
			{modes.map((mode) => {
				const isActive = viewMode === mode.value;

				return (
					<button
						key={mode.value}
						type="button"
						aria-pressed={isActive}
						onClick={() => onViewModeChange(mode.value)}
						className={`rounded px-3 py-1.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus ${
							isActive
								? "bg-primary text-white"
								: "text-primary hover:bg-primary-soft"
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
			return "border-room-desk bg-room-desk-soft text-room-desk-strong";
		case "BOOTH":
			return "border-room-booth bg-room-booth-soft text-room-booth-strong";
		case "TEAM_ROOM":
			return "border-room-team bg-room-team-soft text-room-team-strong";
		case "MEETING_ROOM":
			return "border-room-meeting bg-room-meeting-soft text-room-meeting-strong";
	}
}

function getCalendarMarkerClassName(
	unitTypeName: MyBooking["unit"]["unitType"]["name"],
): string {
	return `block h-1.5 w-full rounded-full border sm:h-auto sm:truncate sm:px-1.5 sm:py-0.5 sm:text-left sm:text-[10px] sm:font-semibold sm:leading-tight ${getCalendarMarkerColorClassName(
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
		<div className="mb-3 flex flex-wrap gap-2">
			{unitTypes.map((unitTypeName) => (
				<div
					key={unitTypeName}
					className="flex items-center gap-2 rounded-full border border-border-muted bg-surface px-2.5 py-1 text-xs font-medium text-muted"
				>
					<span
						className={`h-2 w-6 rounded-full border ${getCalendarMarkerColorClassName(
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
	isHighlighted = false,
	onBookingCancelError,
	onBookingCancelled,
	tone = "active",
}: {
	booking: MyBooking;
	isHighlighted?: boolean;
	onBookingCancelError: (message: string) => void;
	onBookingCancelled: (booking: Booking) => void;
	tone?: BookingCardTone;
}) {
	const isPast = tone === "past";
	const [isCancelConfirmationOpen, setIsCancelConfirmationOpen] =
		useState(false);
	const [cancelConfirmationInput, setCancelConfirmationInput] = useState("");
	const [isCancelSubmitting, setIsCancelSubmitting] = useState(false);
	const canExportCalendar = canExportBooking(booking, tone);
	const canCancelBooking = canCancelMyBooking(booking);
	const canConfirmCancel = cancelConfirmationInput.trim() === "STORNO";

	return (
		<Panel
			key={booking.id}
			padding="compact"
			className={`room-card ${getBookingCardClassName(
				booking.unit.unitType.name,
			)} ${isPast ? "opacity-65 grayscale-[0.85]" : ""} ${
				isHighlighted ? "booking-card--highlight" : ""
			}`}
		>
			<div className="flex min-h-32 flex-col justify-center gap-2">
				<p className="room-card__title text-base font-semibold">
					{booking.unit.name}
				</p>
				<p className="room-card__text text-sm font-medium">
					{formatBookingWindow(booking.startTime, booking.endTime)}
				</p>
				<div className="mt-2 flex flex-wrap gap-2">
					<span className="room-card__badge rounded-full px-3 py-1 text-sm">
						{formatUnitTypeName(booking.unit.unitType.name)}
					</span>
					<span className="room-card__badge rounded-full px-3 py-1 text-sm">
						{formatBookingStatus(booking.status)}
					</span>
					{isPast && (
						<span className="room-card__badge rounded-full px-3 py-1 text-sm">
							Vergangen
						</span>
					)}
				</div>
				{canExportCalendar && (
					<div className="flex mt-3 gap-4 items-center room-card__text text-sm">
						<ExportBookingCalendarButton
							booking={booking}
							className={calendarExportButtonClassName}
						/>
						<span className="room-card__text">Download .ics</span>
					</div>
				)}
				{canCancelBooking && (
					<div className="mt-3 room-card__text text-sm">
						{isCancelConfirmationOpen ? (
							<div className="space-y-3">
								<p className="text-danger-text">
									Zum Stornieren bitte "STORNO" eingeben.
								</p>
								<div className="flex flex-wrap items-center gap-3 justify-between">
									<div className="flex items-center gap-4">
										<TextInput
											value={cancelConfirmationInput}
											onChange={(event) =>
												setCancelConfirmationInput(event.target.value)
											}
											disabled={isCancelSubmitting}
											placeholder="STORNO"
											className="max-w-48"
										/>
										<CancelBookingButton
											bookingId={booking.id}
											className="rounded-full p-2 shadow-xs disabled:opacity-50"
											onCancelled={onBookingCancelled}
											onError={onBookingCancelError}
											onSubmittingChange={setIsCancelSubmitting}
											disabled={!canConfirmCancel}
										/>
									</div>
									<Button
										type="button"
										variant="secondary"
										disabled={isCancelSubmitting}
										onClick={() => {
											setIsCancelConfirmationOpen(false);
											setCancelConfirmationInput("");
										}}
									>
										Abbrechen
									</Button>
								</div>
							</div>
						) : (
							<div className="flex items-center gap-4">
								<button
									type="button"
									onClick={() => setIsCancelConfirmationOpen(true)}
									className={cancelTriggerButtonClassName}
									aria-label="Stornierung vorbereiten"
								>
									<TrashIcon className="size-4 text-danger-text" />
								</button>
								<span className="text-danger-text">Buchung stornieren</span>
							</div>
						)}
					</div>
				)}
			</div>
		</Panel>
	);
}

function BookingListRow({
	booking,
	isHighlighted = false,
	onBookingCancelError,
	onBookingCancelled,
	tone,
}: {
	booking: MyBooking;
	isHighlighted?: boolean;
	onBookingCancelError: (message: string) => void;
	onBookingCancelled: (booking: Booking) => void;
	tone: BookingCardTone;
}) {
	const isPast = tone === "past";
	const [isCancelConfirmationOpen, setIsCancelConfirmationOpen] =
		useState(false);
	const [cancelConfirmationInput, setCancelConfirmationInput] = useState("");
	const [isCancelSubmitting, setIsCancelSubmitting] = useState(false);
	const canExportCalendar = canExportBooking(booking, tone);
	const canCancelBooking = canCancelMyBooking(booking);
	const canConfirmCancel = cancelConfirmationInput.trim() === "STORNO";

	return (
		<Panel
			padding="compact"
			className={`room-card ${getBookingCardClassName(
				booking.unit.unitType.name,
			)} ${isPast ? "opacity-65 grayscale-[0.85]" : ""} ${
				isHighlighted ? "booking-card--highlight" : ""
			}`}
		>
			<div className="flex flex-col gap-3">
				<div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
					<div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-4 gap-y-2">
						<p className="room-card__title min-w-36 truncate text-sm font-semibold">
							{booking.unit.name}
						</p>
						<p className="room-card__text text-sm font-medium">
							{formatBookingListWindow(booking.startTime, booking.endTime)}
						</p>
						<span className="room-card__badge rounded-full px-2.5 py-1 text-xs">
							{formatUnitTypeName(booking.unit.unitType.name)}
						</span>
						<span className="room-card__badge rounded-full px-2.5 py-1 text-xs">
							{formatBookingStatus(booking.status)}
						</span>
						{isPast && (
							<span className="room-card__badge rounded-full px-2.5 py-1 text-xs">
								Vergangen
							</span>
						)}
					</div>
					{(canExportCalendar || canCancelBooking) && (
						<div className="flex shrink-0 items-center gap-2">
							{canExportCalendar && (
								<ExportBookingCalendarButton
									booking={booking}
									className={calendarExportButtonClassName}
								/>
							)}
							{canCancelBooking && (
								<button
									type="button"
									onClick={() => setIsCancelConfirmationOpen(true)}
									className={cancelTriggerButtonClassName}
									aria-label="Stornierung vorbereiten"
								>
									<TrashIcon className="size-4 text-danger-text" />
								</button>
							)}
						</div>
					)}
				</div>
				{canCancelBooking && isCancelConfirmationOpen && (
					<div className="border-border-muted border-t pt-3 room-card__text text-sm">
						<p className="text-danger-text">
							Zum Stornieren bitte "STORNO" eingeben.
						</p>
						<div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
							<div className="flex items-center gap-3">
								<TextInput
									value={cancelConfirmationInput}
									onChange={(event) =>
										setCancelConfirmationInput(event.target.value)
									}
									disabled={isCancelSubmitting}
									placeholder="STORNO"
									className="max-w-48"
								/>
								<CancelBookingButton
									bookingId={booking.id}
									className="rounded-full p-2 shadow-xs disabled:opacity-50"
									onCancelled={onBookingCancelled}
									onError={onBookingCancelError}
									onSubmittingChange={setIsCancelSubmitting}
									disabled={!canConfirmCancel}
								/>
							</div>
							<Button
								type="button"
								variant="secondary"
								disabled={isCancelSubmitting}
								onClick={() => {
									setIsCancelConfirmationOpen(false);
									setCancelConfirmationInput("");
								}}
							>
								Abbrechen
							</Button>
						</div>
					</div>
				)}
			</div>
		</Panel>
	);
}

function BookingCalendarView({
	bookings,
	highlightedBookingId,
	onBookingCancelError,
	onBookingCancelled,
	tone,
}: {
	bookings: MyBooking[];
	highlightedBookingId?: string | null;
	onBookingCancelError: (message: string) => void;
	onBookingCancelled: (booking: Booking) => void;
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
		<Panel className="mt-4 p-2">
			<MyBookingsCalendarLegend />
			<Calendar
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

					const dayContent = (
						<>
							<span className="block text-xs font-semibold text-muted">
								{dayNumber}
							</span>
							{visibleBookings.length > 0 && (
								<div className="mt-1 grid gap-1">
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
										<span className="truncate rounded bg-surface-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted">
											+{overflowBookingCount}
										</span>
									)}
								</div>
							)}
						</>
					);

					const dayClassName = `min-h-20 rounded-md border p-1.5 text-left text-sm transition-colors sm:min-h-24 ${
						isOutsideMonth
							? "border-transparent bg-surface-muted/40 text-zinc-400 opacity-45"
							: "border-border-muted bg-surface"
					} ${
						hasBookings
							? "cursor-pointer hover:border-primary hover:bg-primary-soft/40"
							: ""
					} ${isSelectedDate ? "border-focus ring-2 ring-focus" : ""}`;

					if (!hasBookings) {
						return <div className={dayClassName}>{dayContent}</div>;
					}

					return (
						<button
							type="button"
							onClick={() => setSelectedDate(date)}
							className={dayClassName}
							aria-pressed={isSelectedDate}
							aria-label={`${date}: ${dayBookings.length} ${
								dayBookings.length === 1 ? "Buchung" : "Buchungen"
							} anzeigen`}
						>
							{dayContent}
						</button>
					);
				}}
			/>
			{selectedDayBookings.length > 0 && (
				<div className="mt-4">
					<p className="text-sm font-semibold text-text">
						{bookingDayFormatter.format(new Date(`${selectedDate}T00:00:00`))}
					</p>
					<div className="mt-3 grid gap-3">
						{selectedDayBookings.map((booking) => (
							<BookingListRow
								key={booking.id}
								booking={booking}
								isHighlighted={booking.id === highlightedBookingId}
								onBookingCancelled={onBookingCancelled}
								onBookingCancelError={onBookingCancelError}
								tone={tone}
							/>
						))}
					</div>
				</div>
			)}
		</Panel>
	);
}

function BookingSection({
	bookings,
	defaultOpen = true,
	emptyText,
	highlightedBookingId,
	onBookingCancelError,
	onBookingCancelled,
	tone,
	title,
	viewMode,
}: {
	bookings: MyBooking[];
	defaultOpen?: boolean;
	emptyText: string;
	highlightedBookingId?: string | null;
	onBookingCancelError: (message: string) => void;
	onBookingCancelled: (booking: Booking) => void;
	tone: BookingCardTone;
	title: string;
	viewMode: MyBookingsViewMode;
}) {
	return (
		<details open={defaultOpen} className="mt-8 group">
			<summary className="cursor-pointer list-none rounded-md px-1 py-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">
				<div className="flex flex-wrap items-center gap-3">
					<h2 className="text-xl font-semibold tracking-tight text-text">
						{title}
					</h2>
					<ChevronRightIcon
						className="size-6 text-text transition-transform duration-200 ease-out group-open:rotate-90"
						aria-hidden="true"
					/>
					<Badge variant="muted" className="ml-4 text-sm">
						{bookings.length} {bookings.length === 1 ? "Buchung" : "Buchungen"}
					</Badge>
				</div>
			</summary>
			{bookings.length === 0 ? (
				<FeedbackBox variant="empty" className="w-fit! mt-4">
					{emptyText}
				</FeedbackBox>
			) : viewMode === "calendar" ? (
				<BookingCalendarView
					bookings={bookings}
					highlightedBookingId={highlightedBookingId}
					onBookingCancelled={onBookingCancelled}
					onBookingCancelError={onBookingCancelError}
					tone={tone}
				/>
			) : viewMode === "list" ? (
				<div className="mt-4 grid gap-3">
					{bookings.map((booking) => (
						<BookingListRow
							key={booking.id}
							booking={booking}
							isHighlighted={booking.id === highlightedBookingId}
							onBookingCancelled={onBookingCancelled}
							onBookingCancelError={onBookingCancelError}
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
							isHighlighted={booking.id === highlightedBookingId}
							onBookingCancelled={onBookingCancelled}
							onBookingCancelError={onBookingCancelError}
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
	highlightedBookingId,
	onBookingCancelError,
	onBookingCancelled,
	onViewModeChange,
	viewMode,
}: MyBookingsListProps) {
	if (bookings.length === 0) {
		return (
			<FeedbackBox variant="empty" className="mt-8">
				Keine Buchung vorhanden.
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
		<div>
			<MyBookingsViewModeSwitch
				onViewModeChange={onViewModeChange}
				viewMode={viewMode}
			/>
			<BookingSection
				title="Anstehende Buchungen"
				bookings={upcomingBookings}
				emptyText="Keine anstehenden Buchungen."
				highlightedBookingId={highlightedBookingId}
				onBookingCancelled={onBookingCancelled}
				onBookingCancelError={onBookingCancelError}
				tone="active"
				viewMode={viewMode}
			/>
			<BookingSection
				title="Frühere Buchungen & Stornierungen"
				bookings={pastBookings}
				defaultOpen={false}
				emptyText="Keine früheren Buchungen oder Stornierungen."
				highlightedBookingId={highlightedBookingId}
				onBookingCancelled={onBookingCancelled}
				onBookingCancelError={onBookingCancelError}
				tone="past"
				viewMode={viewMode}
			/>
		</div>
	);
}
