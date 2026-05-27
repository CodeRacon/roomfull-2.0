import ChevronRightIcon from "@public/icons/general/ic-chevron-right.svg";
import TrashIcon from "@public/icons/general/ic-trash.svg";
import "@/shared/ui/room-card/RoomCard.css";
import { useState } from "react";
import type { Booking, MyBooking } from "@/entities/booking";
import { formatUnitTypeName } from "@/entities/unit";
import { CancelBookingButton } from "@/features/booking/cancel-booking";
import { ExportBookingCalendarButton } from "@/features/booking/export-booking-calendar";
import { Badge, Button, FeedbackBox, Panel, TextInput } from "@/shared/ui";

type MyBookingsListProps = {
	bookings: MyBooking[];
	onBookingCancelError: (message: string) => void;
	onBookingCancelled: (booking: Booking) => void;
};

type BookingCardTone = "active" | "past";

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

function BookingCard({
	booking,
	onBookingCancelError,
	onBookingCancelled,
	tone = "active",
}: {
	booking: MyBooking;
	onBookingCancelError: (message: string) => void;
	onBookingCancelled: (booking: Booking) => void;
	tone?: BookingCardTone;
}) {
	const isPast = tone === "past";
	const [isCancelConfirmationOpen, setIsCancelConfirmationOpen] =
		useState(false);
	const [cancelConfirmationInput, setCancelConfirmationInput] = useState("");
	const [isCancelSubmitting, setIsCancelSubmitting] = useState(false);
	const canExportCalendar = tone === "active" && booking.status === "ACTIVE";
	const canCancelBooking =
		booking.status === "ACTIVE" && new Date(booking.startTime) > new Date();
	const canConfirmCancel = cancelConfirmationInput.trim() === "STORNO";

	return (
		<Panel
			key={booking.id}
			padding="compact"
			className={`room-card ${getBookingCardClassName(
				booking.unit.unitType.name,
			)} ${isPast ? "opacity-65 grayscale-[0.85]" : ""}`}
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
							className="room-card__badge rounded-full p-2 shadow-xs"
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
									className="rounded-full bg-danger-bg p-2 shadow-xs"
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

function BookingSection({
	bookings,
	emptyText,
	onBookingCancelError,
	onBookingCancelled,
	tone,
	title,
}: {
	bookings: MyBooking[];
	emptyText: string;
	onBookingCancelError: (message: string) => void;
	onBookingCancelled: (booking: Booking) => void;
	tone: BookingCardTone;
	title: string;
}) {
	return (
		<details open className="mt-8 group">
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
			) : (
				<div className="mt-4 grid gap-4 sm:grid-cols-2">
					{bookings.map((booking) => (
						<BookingCard
							key={booking.id}
							booking={booking}
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
	onBookingCancelError,
	onBookingCancelled,
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
			<BookingSection
				title="Anstehende Buchungen"
				bookings={upcomingBookings}
				emptyText="Keine anstehenden Buchungen."
				onBookingCancelled={onBookingCancelled}
				onBookingCancelError={onBookingCancelError}
				tone="active"
			/>
			<BookingSection
				title="Frühere Buchungen & Stornierungen"
				bookings={pastBookings}
				emptyText="Keine früheren Buchungen oder Stornierungen."
				onBookingCancelled={onBookingCancelled}
				onBookingCancelError={onBookingCancelError}
				tone="past"
			/>
		</div>
	);
}
