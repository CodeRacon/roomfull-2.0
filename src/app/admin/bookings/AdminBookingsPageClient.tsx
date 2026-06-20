"use client";

import { clsx } from "clsx";
import { useDeferredValue, useEffect, useState } from "react";
import {
	type AdminBooking,
	type AdminBookingViewStatus,
	listAdminBookings,
} from "@/entities/booking";
import { useSession } from "@/entities/session";
import { formatUnitTypeName } from "@/entities/unit";
import { RequireAuth } from "@/features/auth/require-auth";
import { ApiRequestError } from "@/shared/api";
import { FeedbackBox, TextInput } from "@/shared/ui";
import { AdminBookingsTable } from "@/widgets/admin-bookings-table";

type AdminBookingFilter = AdminBookingViewStatus;
type AdminBookingRangePreset = "week" | "month" | "quarter" | "year";
type AdminBookingDateRange = {
	from: string;
	to: string;
};

type AdminBookingSummary = {
	cancelledInRange: number;
	todayBookings: number;
	topBooked:
		| {
				count: number;
				label: string;
				meta: string;
		  }
		| undefined;
	upcomingInRange: number;
};

const DEFAULT_LIMIT = 100;
const SUMMARY_LIMIT = 500;
const DAY_IN_MS = 24 * 60 * 60 * 1000;
const DEFAULT_RANGE_PRESET: AdminBookingRangePreset = "month";

const filters: { label: string; status: AdminBookingFilter }[] = [
	{ label: "Heute", status: "today" },
	{ label: "Anstehend", status: "upcoming" },
	{ label: "Abgeschlossen", status: "completed" },
	{ label: "Storniert", status: "cancelled" },
	{ label: "Alle", status: "all" },
];

const rangePresets: {
	days: number;
	key: AdminBookingRangePreset;
	label: string;
}[] = [
	{ days: 7, key: "week", label: "1 Woche" },
	{ days: 30, key: "month", label: "1 Monat" },
	{ days: 90, key: "quarter", label: "3 Monate" },
	{ days: 365, key: "year", label: "1 Jahr" },
];

function getBookingFilterSelectedClassName(status: AdminBookingFilter): string {
	switch (status) {
		case "today":
			return "bg-warning-bg text-warning-text";
		case "upcoming":
			return "bg-success-bg text-success-text";
		case "completed":
			return "bg-surface-muted text-muted";
		case "cancelled":
			return "bg-danger-bg text-danger-text";
		case "all":
			return "bg-primary text-on-primary";
	}
}

const berlinDateFormatter = new Intl.DateTimeFormat("en-CA", {
	timeZone: "Europe/Berlin",
	year: "numeric",
	month: "2-digit",
	day: "2-digit",
});

function formatBerlinDate(date: Date): string {
	const parts = berlinDateFormatter.formatToParts(date);
	const values = new Map(parts.map((part) => [part.type, part.value]));

	return `${values.get("year")}-${values.get("month")}-${values.get("day")}`;
}

function addDays(date: Date, days: number): Date {
	return new Date(date.getTime() + days * DAY_IN_MS);
}

function getRangePresetDays(preset: AdminBookingRangePreset): number {
	return (
		rangePresets.find((rangePreset) => rangePreset.key === preset)?.days ?? 30
	);
}

function getDateRangeForFilter(
	status: AdminBookingFilter,
	preset: AdminBookingRangePreset,
): AdminBookingDateRange {
	const now = new Date();
	const today = formatBerlinDate(now);
	const presetDays = getRangePresetDays(preset);

	if (status === "today") {
		return { from: today, to: today };
	}

	if (status === "all") {
		return {
			from: formatBerlinDate(addDays(now, -presetDays)),
			to: formatBerlinDate(addDays(now, presetDays)),
		};
	}

	if (status === "completed" || status === "cancelled") {
		return { from: formatBerlinDate(addDays(now, -presetDays)), to: today };
	}

	return { from: today, to: formatBerlinDate(addDays(now, presetDays)) };
}

function getFilterLabel(status: AdminBookingFilter): string {
	return (
		filters.find((filter) => filter.status === status)?.label ?? "Anstehend"
	);
}

function getTopBookedUnit(
	bookings: AdminBooking[],
): AdminBookingSummary["topBooked"] {
	const unitCounts = new Map<
		string,
		{ count: number; label: string; meta: string }
	>();

	for (const booking of bookings) {
		const existingUnit = unitCounts.get(booking.unit.id);

		if (existingUnit) {
			existingUnit.count += 1;
			continue;
		}

		unitCounts.set(booking.unit.id, {
			count: 1,
			label: booking.unit.name,
			meta: formatUnitTypeName(booking.unit.unitType.name),
		});
	}

	return Array.from(unitCounts.values()).sort((firstUnit, secondUnit) => {
		if (secondUnit.count !== firstUnit.count) {
			return secondUnit.count - firstUnit.count;
		}

		return firstUnit.label.localeCompare(secondUnit.label, "de-DE");
	})[0];
}

function getSummaryFromBookings(input: {
	allBookings: AdminBooking[];
	rangeBookings: AdminBooking[];
	todayBookings: AdminBooking[];
}): AdminBookingSummary {
	const now = new Date();

	let cancelledInRange = 0;
	let upcomingInRange = 0;

	for (const booking of input.rangeBookings) {
		if (booking.status === "CANCELLED") {
			cancelledInRange += 1;
			continue;
		}

		if (new Date(booking.startTime) >= now) {
			upcomingInRange += 1;
		}
	}

	return {
		cancelledInRange,
		todayBookings: input.todayBookings.length,
		topBooked: getTopBookedUnit(input.allBookings),
		upcomingInRange,
	};
}

function getEmptySummary(): AdminBookingSummary {
	return {
		cancelledInRange: 0,
		todayBookings: 0,
		topBooked: undefined,
		upcomingInRange: 0,
	};
}

export function AdminBookingsPageClient() {
	const { status, endSession } = useSession();
	const [selectedFilter, setSelectedFilter] =
		useState<AdminBookingFilter>("upcoming");
	const [selectedRangePreset, setSelectedRangePreset] =
		useState<AdminBookingRangePreset>(() => DEFAULT_RANGE_PRESET);
	const [searchQuery, setSearchQuery] = useState("");
	const deferredSearchQuery = useDeferredValue(searchQuery);
	const [bookings, setBookings] = useState<AdminBooking[]>([]);
	const [summary, setSummary] = useState<AdminBookingSummary>(() =>
		getEmptySummary(),
	);
	const [isLoading, setIsLoading] = useState(true);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	useEffect(() => {
		if (status !== "authenticated") {
			return;
		}

		async function loadBookings(): Promise<void> {
			const selectedRange = getDateRangeForFilter(
				selectedFilter,
				selectedRangePreset,
			);
			const todayRange = getDateRangeForFilter("today", selectedRangePreset);

			try {
				setIsLoading(true);
				setErrorMessage(null);

				const [selectedBookings, rangeBookings, todayBookings] =
					await Promise.all([
						listAdminBookings({
							...selectedRange,
							limit: DEFAULT_LIMIT,
							search: deferredSearchQuery,
							status: selectedFilter,
						}),
						listAdminBookings({
							...selectedRange,
							limit: SUMMARY_LIMIT,
							search: deferredSearchQuery,
							status: "all",
						}),
						listAdminBookings({
							...todayRange,
							limit: SUMMARY_LIMIT,
							search: deferredSearchQuery,
							status: "today",
						}),
					]);

				setBookings(selectedBookings);
				setSummary(
					getSummaryFromBookings({
						allBookings: rangeBookings,
						rangeBookings,
						todayBookings,
					}),
				);
			} catch (error) {
				if (error instanceof ApiRequestError) {
					if (error.status === 401) {
						endSession();
						return;
					}

					if (error.status === 403) {
						setErrorMessage("Du hast keine Berechtigung für diesen Bereich.");
						return;
					}

					setErrorMessage(error.message);
					return;
				}

				setErrorMessage("Die Buchungen konnten nicht geladen werden.");
			} finally {
				setIsLoading(false);
			}
		}

		void loadBookings();
	}, [
		selectedFilter,
		selectedRangePreset,
		deferredSearchQuery,
		status,
		endSession,
	]);

	return (
		<RequireAuth allowedRoles={["ADMIN"]}>
			<div className="mt-8 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
				<div className="border-2 border-primary bg-background p-4">
					<p className="text-xs font-black uppercase text-muted">Heute</p>
					<p className="mt-3 text-4xl font-black leading-none tabular-nums text-primary">
						{summary.todayBookings}
					</p>
					<p className="mt-2 text-xs font-semibold text-muted">
						Buchungen am aktuellen Tag
					</p>
				</div>
				<div className="border-2 border-primary bg-background p-4">
					<p className="text-xs font-black uppercase text-muted">Anstehend</p>
					<p className="mt-3 text-4xl font-black leading-none tabular-nums text-success-text">
						{summary.upcomingInRange}
					</p>
					<p className="mt-2 text-xs font-semibold text-muted">
						Im gewählten Zeitraum
					</p>
				</div>
				<div className="border-2 border-primary bg-background p-4">
					<p className="text-xs font-black uppercase text-muted">Storniert</p>
					<p className="mt-3 text-4xl font-black leading-none tabular-nums text-danger-text">
						{summary.cancelledInRange}
					</p>
					<p className="mt-2 text-xs font-semibold text-muted">
						Im gewählten Zeitraum
					</p>
				</div>
				<div className="min-w-0 border-2 border-primary bg-background p-4">
					<p className="text-xs font-black uppercase text-muted">
						Meistgebucht
					</p>
					<p className="mt-3 truncate text-xl font-black leading-none text-primary">
						{summary.topBooked?.label ?? "-"}
					</p>
					<p className="mt-2 truncate text-xs font-semibold text-muted">
						{summary.topBooked
							? `${summary.topBooked.count} · ${summary.topBooked.meta}`
							: "Keine Daten im Zeitraum"}
					</p>
				</div>
			</div>

			<div className="mt-6 grid gap-4 border-2 border-primary bg-background p-5">
				<div>
					<p className="mb-2 text-xs font-black uppercase text-muted">
						Ansicht
					</p>
					<div className="grid border-2 border-primary sm:grid-cols-5">
						{filters.map((filter) => {
							const isSelected = selectedFilter === filter.status;

							return (
								<button
									key={filter.status}
									type="button"
									className={clsx(
										"h-14 border-primary border-t-2 px-3 py-2 text-sm font-black transition-colors first:border-t-0 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-focus sm:border-l-2 sm:border-t-0 sm:first:border-l-0",
										isSelected
											? getBookingFilterSelectedClassName(filter.status)
											: "bg-background text-primary hover:bg-primary/10",
									)}
									aria-pressed={isSelected}
									onClick={() => setSelectedFilter(filter.status)}
								>
									{filter.label}
								</button>
							);
						})}
					</div>
				</div>

				<div>
					<p className="mb-2 text-xs font-black uppercase text-muted">
						Zeitraum
					</p>
					<div className="grid border-2 border-primary sm:grid-cols-4">
						{rangePresets.map((rangePreset) => {
							const isSelected = selectedRangePreset === rangePreset.key;

							return (
								<button
									key={rangePreset.key}
									type="button"
									className={clsx(
										"h-14 border-primary border-t-2 px-3 py-2 text-sm font-black transition-colors first:border-t-0 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-focus sm:border-l-2 sm:border-t-0 sm:first:border-l-0",
										isSelected
											? "bg-primary text-on-primary"
											: "bg-background text-primary hover:bg-primary/10",
									)}
									aria-pressed={isSelected}
									onClick={() => setSelectedRangePreset(rangePreset.key)}
								>
									{rangePreset.label}
								</button>
							);
						})}
					</div>
				</div>

				<div>
					<label
						htmlFor="admin-booking-search"
						className="mb-2 block text-xs font-black uppercase text-muted"
					>
						Customer
					</label>
					<TextInput
						id="admin-booking-search"
						type="search"
						autoComplete="off"
						name="admin-booking-search"
						value={searchQuery}
						placeholder="Name oder E-Mail suchen…"
						className="h-14"
						onChange={(event) => setSearchQuery(event.target.value)}
					/>
				</div>
			</div>

			{isLoading && (
				<p className="mt-8 bg-primary/10 px-3 py-2 text-sm font-semibold text-muted">
					Buchungen werden geladen…
				</p>
			)}
			{errorMessage && (
				<FeedbackBox variant="error" className="mt-8">
					{errorMessage}
				</FeedbackBox>
			)}
			{!isLoading && !errorMessage && (
				<AdminBookingsTable
					bookings={bookings}
					filterLabel={getFilterLabel(selectedFilter)}
				/>
			)}
		</RequireAuth>
	);
}
