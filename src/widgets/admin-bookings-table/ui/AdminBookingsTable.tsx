import ChevronRightIcon from "@public/icons/general/ic-chevron-right.svg";
import type { AdminBooking } from "@/entities/booking";
import { formatUnitTypeName } from "@/entities/unit";
import { Badge, FeedbackBox, Panel } from "@/shared/ui";

type AdminBookingsTableProps = {
	bookings: AdminBooking[];
	filterLabel: string;
};

type BookingDayGroup = {
	dateKey: string;
	dayLabel: string;
	bookings: AdminBooking[];
};

type DisplayStatus = {
	label: string;
	variant: "danger" | "muted" | "neutral" | "success" | "warning";
};

const dateKeyFormatter = new Intl.DateTimeFormat("en-CA", {
	timeZone: "Europe/Berlin",
	year: "numeric",
	month: "2-digit",
	day: "2-digit",
});

const dayLabelFormatter = new Intl.DateTimeFormat("de-DE", {
	timeZone: "Europe/Berlin",
	weekday: "long",
	day: "2-digit",
	month: "2-digit",
	year: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat("de-DE", {
	timeZone: "Europe/Berlin",
	hour: "2-digit",
	minute: "2-digit",
});

function formatBerlinDateKey(value: string): string {
	const parts = dateKeyFormatter.formatToParts(new Date(value));
	const values = new Map(parts.map((part) => [part.type, part.value]));

	return `${values.get("year")}-${values.get("month")}-${values.get("day")}`;
}

function groupBookingsByDay(bookings: AdminBooking[]): BookingDayGroup[] {
	const groups = new Map<string, BookingDayGroup>();

	for (const booking of bookings) {
		const dateKey = formatBerlinDateKey(booking.startTime);
		const existingGroup = groups.get(dateKey);

		if (existingGroup) {
			existingGroup.bookings.push(booking);
			continue;
		}

		groups.set(dateKey, {
			dateKey,
			dayLabel: dayLabelFormatter.format(new Date(booking.startTime)),
			bookings: [booking],
		});
	}

	return Array.from(groups.values());
}

function getDisplayStatus(booking: AdminBooking): DisplayStatus {
	if (booking.status === "CANCELLED") {
		return { label: "Storniert", variant: "danger" };
	}

	const now = new Date();
	const startDateKey = formatBerlinDateKey(booking.startTime);
	const todayDateKey = formatBerlinDateKey(now.toISOString());

	if (new Date(booking.endTime) < now) {
		return { label: "Abgeschlossen", variant: "muted" };
	}

	if (startDateKey === todayDateKey) {
		return { label: "Heute", variant: "warning" };
	}

	return { label: "Anstehend", variant: "success" };
}

function formatTimeRange(booking: AdminBooking): string {
	return `${timeFormatter.format(new Date(booking.startTime))}-${timeFormatter.format(
		new Date(booking.endTime),
	)} Uhr`;
}

function formatBookingCount(count: number): string {
	return count === 1 ? "1 Buchung" : `${count} Buchungen`;
}

function getStatusSummary(bookings: AdminBooking[]): string {
	const statusCounts = new Map<string, number>();

	for (const booking of bookings) {
		const displayStatus = getDisplayStatus(booking);
		statusCounts.set(
			displayStatus.label,
			(statusCounts.get(displayStatus.label) ?? 0) + 1,
		);
	}

	return Array.from(statusCounts.entries())
		.map(([label, count]) => `${count} ${label.toLowerCase()}`)
		.join(" · ");
}

function isGroupOpenByDefault(group: BookingDayGroup): boolean {
	const todayDateKey = formatBerlinDateKey(new Date().toISOString());

	return group.dateKey >= todayDateKey;
}

export function AdminBookingsTable({
	bookings,
	filterLabel,
}: AdminBookingsTableProps) {
	const bookingGroups = groupBookingsByDay(bookings);

	if (bookings.length === 0) {
		return (
			<FeedbackBox variant="empty" className="mt-8">
				Keine Buchungen für "{filterLabel}".
			</FeedbackBox>
		);
	}

	return (
		<Panel className="mt-8">
			<div className="mb-5 flex flex-wrap items-end justify-between gap-3">
				<div>
					<h2 className="text-lg font-semibold">{filterLabel}</h2>
					<p className="mt-1 text-sm text-muted">
						{bookings.length} Buchungen im gewählten Zeitraum
					</p>
				</div>
			</div>
			<div className="space-y-3">
				{bookingGroups.map((group) => (
					<details
						key={group.dateKey}
						open={isGroupOpenByDefault(group)}
						className="group rounded-md border border-border bg-surface-muted/45"
					>
						<summary className="cursor-pointer list-none rounded-md px-4 py-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">
							<div className="flex flex-wrap items-center justify-between gap-3">
								<div className="min-w-0">
									<p className="font-semibold text-text capitalize">
										{group.dayLabel}
									</p>
									<p className="mt-1 text-xs text-muted">
										{getStatusSummary(group.bookings)}
									</p>
								</div>
								<div className="flex items-center gap-3">
									<span className="rounded-full bg-secondary-soft px-3 py-1 text-xs font-semibold text-secondary">
										{formatBookingCount(group.bookings.length)}
									</span>
									<ChevronRightIcon
										className="size-5 text-muted transition-transform group-open:rotate-90"
										aria-hidden="true"
									/>
								</div>
							</div>
						</summary>
						<div className="space-y-2 border-border border-t p-3">
							{group.bookings.map((booking) => {
								const displayStatus = getDisplayStatus(booking);

								return (
									<div
										key={booking.id}
										className="grid gap-3 rounded-md border border-border bg-surface p-3 text-sm md:grid-cols-[8.5rem_minmax(0,1fr)_minmax(0,1fr)] md:items-center"
									>
										<div className="flex items-center gap-3 md:block">
											<p className="font-semibold tabular-nums text-text">
												{formatTimeRange(booking)}
											</p>
											<Badge
												variant={displayStatus.variant}
												className="md:mt-2"
											>
												{displayStatus.label}
											</Badge>
										</div>
										<div className="min-w-0">
											<p className="truncate font-semibold text-text">
												{booking.user.name}
											</p>
											<p className="mt-1 truncate text-xs text-muted">
												{booking.user.email}
											</p>
										</div>
										<div className="min-w-0">
											<p className="truncate font-semibold text-text">
												{booking.unit.name}
											</p>
											<p className="mt-1 truncate text-xs text-muted">
												{formatUnitTypeName(booking.unit.unitType.name)}
											</p>
											{booking.status === "CANCELLED" && (
												<p className="mt-2 text-xs font-medium text-danger-text">
													Storno vermerkt
												</p>
											)}
										</div>
									</div>
								);
							})}
						</div>
					</details>
				))}
			</div>
		</Panel>
	);
}
