"use client";

import { useRouter } from "next/navigation";
import { type ComponentPropsWithoutRef, useEffect, useState } from "react";
import type {
	BookingContext,
	CreateBookingInput,
	UnitDayBookings,
} from "@/entities/booking";
import { createBooking, getUnitDayBookings } from "@/entities/booking";
import { useSession } from "@/entities/session";
import { ApiRequestError } from "@/shared/api";
import {
	Badge,
	Button,
	FeedbackBox,
	Field,
	Panel,
	TextInput,
} from "@/shared/ui";

type CreateBookingFormProps = {
	bookingContext: BookingContext;
};

type FormSubmitHandler = NonNullable<
	ComponentPropsWithoutRef<"form">["onSubmit"]
>;

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

export function CreateBookingForm({ bookingContext }: CreateBookingFormProps) {
	const router = useRouter();
	const { endSession } = useSession();
	const [date, setDate] = useState("");
	const [startTime, setStartTime] = useState("");
	const [endTime, setEndTime] = useState("");

	const [dayBookings, setDayBookings] = useState<UnitDayBookings | null>(null);
	const [isLoadingDayBookings, setIsLoadingDayBookings] = useState(false);
	const [dayBookingsError, setDayBookingsError] = useState<string | null>(null);
	const [submitError, setSubmitError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const directUnitId =
		bookingContext.mode === "DIRECT" ? bookingContext.unit.id : null;

	useEffect(() => {
		if (directUnitId === null || date === "") {
			setDayBookings(null);
			setDayBookingsError(null);
			setIsLoadingDayBookings(false);
			return;
		}

		const unitId = directUnitId;

		async function loadDayBookings(): Promise<void> {
			setDayBookings(null);
			setIsLoadingDayBookings(true);
			setDayBookingsError(null);

			try {
				const bookings = await getUnitDayBookings(unitId, date);
				setDayBookings(bookings);
			} catch (error) {
				if (error instanceof ApiRequestError && error.status === 401) {
					endSession();
					return;
				}

				setDayBookingsError(
					error instanceof Error
						? error.message
						: "Fehler beim Laden der Buchungen",
				);
			} finally {
				setIsLoadingDayBookings(false);
			}
		}

		void loadDayBookings();
	}, [date, directUnitId, endSession]);

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
					<Badge>{`Dauer: ${unitType.minDurationMinutes}-${unitType.maxDurationMinutes} Minuten`}</Badge>
				</div>
				<div className="mt-6 grid gap-3 md:grid-cols-3">
					<Field label="Datum" htmlFor="booking-date">
						<TextInput
							id="booking-date"
							type="date"
							value={date}
							onChange={(event) => setDate(event.target.value)}
							required
						/>
					</Field>
					<Field label="Start" htmlFor="booking-start-time">
						<TextInput
							id="booking-start-time"
							type="time"
							value={startTime}
							onChange={(event) => setStartTime(event.target.value)}
							required
						/>
					</Field>
					<Field label="Ende" htmlFor="booking-end-time">
						<TextInput
							id="booking-end-time"
							type="time"
							value={endTime}
							onChange={(event) => setEndTime(event.target.value)}
							required
						/>
					</Field>
				</div>
				{bookingContext.mode === "DIRECT" && date !== "" && (
					<div className="mt-4">
						{isLoadingDayBookings && (
							<p className="text-sm text-muted">
								Belegte Zeiten werden geladen...
							</p>
						)}
						{dayBookingsError && (
							<FeedbackBox variant="error">{dayBookingsError}</FeedbackBox>
						)}
						{!isLoadingDayBookings &&
							!dayBookingsError &&
							dayBookings?.bookedIntervals.length === 0 && (
								<FeedbackBox>Keine belegten Zeiten an diesem Tag.</FeedbackBox>
							)}
						{!isLoadingDayBookings &&
							!dayBookingsError &&
							dayBookings &&
							dayBookings.bookedIntervals.length > 0 && (
								<div>
									<p className="text-sm font-medium text-text">
										Bereits belegt:
									</p>
									<ul className="mt-2 space-y-1 text-sm text-muted">
										{dayBookings.bookedIntervals.map((interval) => (
											<li key={`${interval.start}-${interval.end}`}>
												{new Date(interval.start).toLocaleTimeString("de-DE", {
													hour: "2-digit",
													minute: "2-digit",
												})}{" "}
												-{" "}
												{new Date(interval.end).toLocaleTimeString("de-DE", {
													hour: "2-digit",
													minute: "2-digit",
												})}
											</li>
										))}
									</ul>
								</div>
							)}
					</div>
				)}
				{submitError && (
					<FeedbackBox variant="error" className="mt-4">
						{submitError}
					</FeedbackBox>
				)}
				<div className="mt-6">
					<Button type="submit" disabled={isSubmitting}>
						{isSubmitting ? "Buchung wird erstellt..." : "Buchung erstellen"}
					</Button>
				</div>
			</form>
		</Panel>
	);
}
