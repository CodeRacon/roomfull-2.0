import ChevronRightIcon from "@public/icons/general/ic-chevron-right.svg";
import type { AdminBooking } from "@/entities/booking";
import { formatUnitTypeName } from "@/entities/unit";
import { Badge, FeedbackBox } from "@/shared/ui";

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
			<FeedbackBox variant="empty" className="mt-8 w-fit!">
				Keine Buchungen für "{filterLabel}".
			</FeedbackBox>
		);
	}

	return (
		<section className="mt-8">
			<div className="border-primary border-y-4 bg-primary">
				<div className="grid md:grid-cols-[minmax(0,1fr)_auto]">
					<div className="flex min-h-16 min-w-0 items-center bg-primary px-4 py-3 text-on-primary">
						<h2 className="min-w-0 text-xl font-black leading-tight text-pretty md:text-2xl">
							{filterLabel}
						</h2>
					</div>
					<div className="mx-1 mb-0 flex min-h-14 items-center bg-on-primary px-4 py-3 text-sm font-black text-primary md:mx-0 md:mr-1">
						{formatBookingCount(bookings.length)}
					</div>
				</div>
			</div>
			<div className="mt-4 grid gap-3">
				{bookingGroups.map((group) => (
					<details
						key={group.dateKey}
						open={isGroupOpenByDefault(group)}
						className="group border-2 border-primary bg-background"
					>
						<summary className="cursor-pointer list-none border-primary border-b-2 bg-primary/10 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-focus">
							<div className="grid md:grid-cols-[minmax(0,1fr)_auto]">
								<div className="flex min-h-16 min-w-0 flex-col justify-center px-4 py-3">
									<p className="truncate font-black text-primary capitalize">
										{group.dayLabel}
									</p>
									<p className="mt-1 truncate text-xs font-semibold text-muted">
										{getStatusSummary(group.bookings)}
									</p>
								</div>
								<div className="flex min-h-14 items-center gap-3 bg-primary px-4 py-3 text-on-primary md:min-h-16">
									<span className="bg-on-primary px-3 py-2 text-xs font-black text-primary">
										{formatBookingCount(group.bookings.length)}
									</span>
									<ChevronRightIcon
										className="size-5 shrink-0 transition-transform duration-200 ease-out group-open:rotate-90 motion-reduce:transition-none"
										aria-hidden="true"
									/>
								</div>
							</div>
						</summary>
						<div className="grid gap-3 p-3">
							{group.bookings.map((booking) => {
								const displayStatus = getDisplayStatus(booking);

								return (
									<div
										key={booking.id}
										className="grid gap-3 border-2 border-primary bg-background p-3 text-sm md:grid-cols-[8.5rem_minmax(0,1fr)_minmax(0,1fr)] md:items-center"
									>
										<div className="flex items-center gap-3 md:block">
											<p className="font-black tabular-nums text-primary">
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
											<p className="truncate font-black text-text">
												{booking.user.name}
											</p>
											<p className="mt-1 truncate text-xs text-muted">
												{booking.user.email}
											</p>
										</div>
										<div className="min-w-0">
											<p className="truncate font-black text-text">
												{booking.unit.name}
											</p>
											<p className="mt-1 truncate text-xs text-muted">
												{formatUnitTypeName(booking.unit.unitType.name)}
											</p>
											{booking.status === "CANCELLED" && (
												<p className="mt-2 text-xs font-black text-danger-text">
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
		</section>
	);
}
