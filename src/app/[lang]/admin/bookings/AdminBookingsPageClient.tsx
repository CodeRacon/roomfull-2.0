"use client";

import { clsx } from "clsx";
import { useDeferredValue, useEffect, useState } from "react";
import {
	type AdminBookingOperations,
	type AdminBookingRangePreset,
	type AdminBookingViewStatus,
	getAdminBookingOperations,
} from "@/entities/booking";
import { useSession } from "@/entities/session";
import { formatUnitTypeName } from "@/entities/unit";
import { RequireAuth } from "@/features/auth/require-auth";
import { ApiRequestError } from "@/shared/api";
import type { Dictionary } from "@/shared/i18n";
import { FeedbackBox, TextInput } from "@/shared/ui";
import { AdminBookingsTable } from "@/widgets/admin-bookings-table";

type AdminBookingFilter = AdminBookingViewStatus;

const DEFAULT_LIMIT = 100;
const DEFAULT_RANGE_PRESET: AdminBookingRangePreset = "month";
const EMPTY_OPERATIONS: AdminBookingOperations = {
	bookings: [],
	dateRange: { from: "", to: "" },
	summary: {
		cancelledInRange: 0,
		todayBookings: 0,
		upcomingInRange: 0,
	},
};

const filters: { status: AdminBookingFilter }[] = [
	{ status: "today" },
	{ status: "upcoming" },
	{ status: "completed" },
	{ status: "cancelled" },
	{ status: "all" },
];

const rangePresets: { key: AdminBookingRangePreset }[] = [
	{ key: "week" },
	{ key: "month" },
	{ key: "quarter" },
	{ key: "year" },
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

type AdminBookingsPageClientProps = {
	copy: Dictionary["adminWorkspaces"]["bookings"];
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

export function AdminBookingsPageClient({
	copy,
}: AdminBookingsPageClientProps) {
	const { status, endSession } = useSession();
	const [selectedFilter, setSelectedFilter] =
		useState<AdminBookingFilter>("upcoming");
	const [selectedRangePreset, setSelectedRangePreset] =
		useState<AdminBookingRangePreset>(() => DEFAULT_RANGE_PRESET);
	const [searchQuery, setSearchQuery] = useState("");
	const deferredSearchQuery = useDeferredValue(searchQuery);
	const [operations, setOperations] =
		useState<AdminBookingOperations>(EMPTY_OPERATIONS);
	const [isLoading, setIsLoading] = useState(true);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	useEffect(() => {
		if (status !== "authenticated") {
			return;
		}

		async function loadBookings(): Promise<void> {
			try {
				setIsLoading(true);
				setErrorMessage(null);

				const nextOperations = await getAdminBookingOperations({
					limit: DEFAULT_LIMIT,
					range: selectedRangePreset,
					search: deferredSearchQuery,
					status: selectedFilter,
				});

				setOperations(nextOperations);
			} catch (error) {
				if (error instanceof ApiRequestError) {
					if (error.status === 401) {
						endSession();
						return;
					}

					if (error.status === 403) {
						setErrorMessage(copy.errors.forbidden);
						return;
					}
				}

				setErrorMessage(copy.errors.fallback);
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
		copy.errors.forbidden,
		copy.errors.fallback,
	]);
	const { bookings, summary } = operations;

	return (
		<RequireAuth allowedRoles={["ADMIN"]}>
			<div className="mt-8 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
				<div className="border-2 border-primary bg-background p-4">
					<p className="text-xs font-black uppercase text-muted">
						{copy.summary.today}
					</p>
					<p className="mt-3 text-4xl font-black leading-none tabular-nums text-primary">
						{summary.todayBookings}
					</p>
					<p className="mt-2 text-xs font-semibold text-muted">
						{copy.summary.todayDescription}
					</p>
				</div>
				<div className="border-2 border-primary bg-background p-4">
					<p className="text-xs font-black uppercase text-muted">
						{copy.summary.upcoming}
					</p>
					<p className="mt-3 text-4xl font-black leading-none tabular-nums text-success-text">
						{summary.upcomingInRange}
					</p>
					<p className="mt-2 text-xs font-semibold text-muted">
						{copy.summary.rangeDescription}
					</p>
				</div>
				<div className="border-2 border-primary bg-background p-4">
					<p className="text-xs font-black uppercase text-muted">
						{copy.summary.cancelled}
					</p>
					<p className="mt-3 text-4xl font-black leading-none tabular-nums text-danger-text">
						{summary.cancelledInRange}
					</p>
					<p className="mt-2 text-xs font-semibold text-muted">
						{copy.summary.rangeDescription}
					</p>
				</div>
				<div className="min-w-0 border-2 border-primary bg-background p-4">
					<p className="text-xs font-black uppercase text-muted">
						{copy.summary.topBooked}
					</p>
					<p className="mt-3 truncate text-xl font-black leading-none text-primary">
						{summary.topBookedUnit?.name ?? "-"}
					</p>
					<p className="mt-2 truncate text-xs font-semibold text-muted">
						{summary.topBookedUnit
							? formatTemplate(copy.summary.topBookedMeta, {
									count: summary.topBookedUnit.bookingCount,
									meta: formatUnitTypeName(summary.topBookedUnit.unitType),
								})
							: copy.summary.noData}
					</p>
				</div>
			</div>

			<div className="mt-6 grid gap-4 border-2 border-primary bg-background p-5">
				<div>
					<p className="mb-2 text-xs font-black uppercase text-muted">
						{copy.controls.view}
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
									{copy.filters[filter.status]}
								</button>
							);
						})}
					</div>
				</div>

				<div>
					<p className="mb-2 text-xs font-black uppercase text-muted">
						{copy.controls.range}
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
									{copy.ranges[rangePreset.key]}
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
						{copy.controls.customer}
					</label>
					<TextInput
						id="admin-booking-search"
						type="search"
						autoComplete="off"
						name="admin-booking-search"
						value={searchQuery}
						placeholder={copy.controls.searchPlaceholder}
						className="h-14"
						onChange={(event) => setSearchQuery(event.target.value)}
					/>
				</div>
			</div>

			{isLoading && (
				<p className="mt-8 bg-primary/10 px-3 py-2 text-sm font-semibold text-muted">
					{copy.loading}
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
					copy={copy.table}
					filterLabel={copy.filters[selectedFilter]}
				/>
			)}
		</RequireAuth>
	);
}
