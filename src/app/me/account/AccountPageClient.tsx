"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { listMyBookings, type MyBooking } from "@/entities/booking";
import { useSession } from "@/entities/session";
import { formatUnitTypeName } from "@/entities/unit";
import { RequireAuth } from "@/features/auth/require-auth";
import { ApiRequestError } from "@/shared/api";
import { Anchor, Badge, FeedbackBox, Panel } from "@/shared/ui";

function formatRole(role: "CUSTOMER" | "ADMIN"): string {
	switch (role) {
		case "CUSTOMER":
			return "Customer";
		case "ADMIN":
			return "Admin";
	}
}

function formatRegistrationDate(createdAt: string): string {
	return new Intl.DateTimeFormat("de-DE", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	}).format(new Date(createdAt));
}

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

const dateTimeFormatter = new Intl.DateTimeFormat("de-DE", {
	weekday: "long",
	day: "2-digit",
	month: "2-digit",
	year: "numeric",
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

function getHighlightedBookingHref(bookingId: string): string {
	return `/me/bookings?highlightBookingId=${encodeURIComponent(bookingId)}`;
}

function findNextBooking(bookings: MyBooking[]): MyBooking | null {
	const now = Date.now();

	const upcomingBookings = bookings.filter(
		(booking) =>
			booking.status === "ACTIVE" && new Date(booking.endTime).getTime() >= now,
	);

	upcomingBookings.sort(
		(firstBooking, secondBooking) =>
			new Date(firstBooking.startTime).getTime() -
			new Date(secondBooking.startTime).getTime(),
	);

	return upcomingBookings[0] ?? null;
}

function getBookingAccentClassName(
	unitTypeName: MyBooking["unit"]["unitType"]["name"],
) {
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

export function AccountPageClient() {
	const { status, user, endSession } = useSession();
	const [bookings, setBookings] = useState<MyBooking[]>([]);
	const [isLoadingBookings, setIsLoadingBookings] = useState(false);
	const [bookingErrorMessage, setBookingErrorMessage] = useState<string | null>(
		null,
	);

	const nextBooking = useMemo(() => findNextBooking(bookings), [bookings]);

	useEffect(() => {
		if (status !== "authenticated") {
			return;
		}

		async function loadBookings(): Promise<void> {
			try {
				setIsLoadingBookings(true);
				setBookingErrorMessage(null);
				const myBookings = await listMyBookings();
				setBookings(myBookings);
			} catch (error) {
				if (error instanceof ApiRequestError && error.status === 401) {
					endSession();
					return;
				}

				setBookingErrorMessage(
					"Deine nächste Buchung konnte nicht geladen werden.",
				);
			} finally {
				setIsLoadingBookings(false);
			}
		}

		void loadBookings();
	}, [status, endSession]);

	return (
		<RequireAuth>
			{user && (
				<div className="mt-8 grid gap-4 md:grid-cols-[1fr_0.7fr]">
					<Panel>
						<div className="flex flex-wrap items-start justify-between gap-4">
							<div>
								<p className="text-sm font-medium text-muted">Angemeldet als</p>
								<h2 className="mt-1 text-2xl font-semibold">{user.name}</h2>
							</div>
							<Badge>Angemeldet</Badge>
						</div>

						<dl className="mt-6 grid gap-4 sm:grid-cols-2">
							<div>
								<dt className="text-sm font-medium text-muted">E-Mail</dt>
								<dd className="mt-1 text-base font-semibold">{user.email}</dd>
							</div>
							<div>
								<dt className="text-sm font-medium text-muted">Rolle</dt>
								<dd className="mt-1 text-base font-semibold">
									{formatRole(user.role)}
								</dd>
							</div>
							<div>
								<dt className="text-sm font-medium text-muted">Nutzer seit</dt>
								<dd className="mt-1 text-base font-semibold">
									{formatRegistrationDate(user.createdAt)}
								</dd>
							</div>
						</dl>

						{user.role === "CUSTOMER" && (
							<div className="mt-6 border-t-2 border-primary/20 pt-5">
								<p className="text-sm font-medium text-muted">
									Fragen, Feedback oder Kritik
								</p>
								<div className="mt-3 flex flex-wrap items-center justify-between gap-3">
									<p className="max-w-md text-sm font-semibold leading-6 text-muted">
										Schreib uns direkt aus deinem Customer-Konto heraus.
									</p>
									<Anchor href="/me/contact" variant="secondary">
										Kontakt aufnehmen
									</Anchor>
								</div>
							</div>
						)}
					</Panel>

					<Panel
						variant={
							!isLoadingBookings && !bookingErrorMessage && !nextBooking
								? "muted"
								: "default"
						}
					>
						<h2 className="text-lg font-semibold">Nächste Buchung</h2>
						{isLoadingBookings && (
							<p className="mt-3 text-sm leading-6 text-muted">
								Deine nächste Buchung wird geladen…
							</p>
						)}
						{bookingErrorMessage && (
							<FeedbackBox variant="error" className="mt-4">
								{bookingErrorMessage}
							</FeedbackBox>
						)}
						{!isLoadingBookings && !bookingErrorMessage && nextBooking && (
							<Link
								href={getHighlightedBookingHref(nextBooking.id)}
								className="group mt-5 block overflow-hidden border-2 border-primary bg-background text-primary transition-colors hover:bg-primary hover:text-on-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
							>
								<span
									className={`block h-3 ${getBookingAccentClassName(
										nextBooking.unit.unitType.name,
									)}`}
									aria-hidden="true"
								/>
								<span className="block p-5">
									<span className="block text-lg font-black leading-snug">
										{formatBookingWindow(
											nextBooking.startTime,
											nextBooking.endTime,
										)}
									</span>
									<span className="mt-4 block text-2xl font-black leading-none text-pretty">
										{nextBooking.unit.name}
									</span>
									<span
										className={`mt-5 inline-flex border-2 border-primary px-4 py-2 text-base font-black text-primary transition-colors group-hover:border-on-primary group-hover:text-on-primary ${getBookingAccentClassName(
											nextBooking.unit.unitType.name,
										)}`}
									>
										{formatUnitTypeName(nextBooking.unit.unitType.name)}
									</span>
								</span>
							</Link>
						)}
						{!isLoadingBookings && !bookingErrorMessage && !nextBooking && (
							<div className="mt-4">
								<p className="text-sm leading-6 text-muted">
									Du hast gerade keine anstehende Buchung.
								</p>
								<button
									type="button"
									disabled
									className="mt-4 inline-flex min-h-10 cursor-not-allowed items-center justify-center rounded-md bg-muted px-4 py-2 text-sm font-semibold text-surface-muted"
								>
									Keine anstehende Buchung
								</button>
							</div>
						)}
					</Panel>
				</div>
			)}
		</RequireAuth>
	);
}
