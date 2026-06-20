"use client";

import { useEffect, useMemo, useState } from "react";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import {
	type BookingDemandAnalytics,
	getBookingDemandAnalytics,
} from "@/entities/analytics";
import { useSession } from "@/entities/session";
import { formatUnitTypeName, type UnitTypeName } from "@/entities/unit";
import { ApiRequestError } from "@/shared/api";
import { FeedbackBox } from "@/shared/ui";

const dateLabelFormatter = new Intl.DateTimeFormat("de-DE", {
	day: "2-digit",
	month: "2-digit",
});

const percentFormatter = new Intl.NumberFormat("de-DE", {
	maximumFractionDigits: 1,
	style: "percent",
});

const unitTypeChartColors: Record<UnitTypeName, string> = {
	HOT_DESK: "var(--color-unit-hot-desk)",
	BOOTH: "var(--color-unit-booth)",
	TEAM_ROOM: "var(--color-unit-team-room)",
	MEETING_ROOM: "var(--color-unit-meeting-room)",
};

function formatDateLabel(date: string): string {
	const [year, month, day] = date.split("-").map(Number);
	return dateLabelFormatter.format(new Date(Date.UTC(year, month - 1, day)));
}

function getDemandTotal(analytics: BookingDemandAnalytics): number {
	return analytics.trend.reduce(
		(total, trendPoint) => total + trendPoint.bookingCount,
		0,
	);
}

function getUnitTypeDemandData(analytics: BookingDemandAnalytics) {
	return analytics.demandByUnitType.map((unitTypePoint) => ({
		...unitTypePoint,
		fill: unitTypeChartColors[unitTypePoint.unitType],
		label: formatUnitTypeName(unitTypePoint.unitType),
	}));
}

function formatCancellationRate(rate: number): string {
	return percentFormatter.format(rate);
}

export function AdminAnalyticsDashboard() {
	const { status, endSession } = useSession();
	const [analytics, setAnalytics] = useState<BookingDemandAnalytics | null>(
		null,
	);
	const [isLoading, setIsLoading] = useState(true);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	useEffect(() => {
		if (status !== "authenticated") {
			return;
		}

		async function loadAnalytics(): Promise<void> {
			try {
				setIsLoading(true);
				setErrorMessage(null);

				const bookingDemand = await getBookingDemandAnalytics();
				setAnalytics(bookingDemand);
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

				setErrorMessage("Die Analytics-Daten konnten nicht geladen werden.");
			} finally {
				setIsLoading(false);
			}
		}

		void loadAnalytics();
	}, [status, endSession]);

	const demandTotal = useMemo(
		() => (analytics ? getDemandTotal(analytics) : 0),
		[analytics],
	);
	const unitTypeDemandData = useMemo(
		() => (analytics ? getUnitTypeDemandData(analytics) : []),
		[analytics],
	);

	return (
		<section className="mt-8 border-2 border-primary bg-background">
			<div className="grid gap-4 border-primary border-b-2 p-5 md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-stretch">
				<div className="flex min-w-0 flex-col justify-end">
					<p className="text-xs font-black uppercase text-muted">
						Admin Analytics
					</p>
					<h2 className="mt-2 text-3xl font-black leading-none text-text">
						Nachfrageverlauf
					</h2>
					{analytics && (
						<p className="mt-3 text-sm font-semibold text-muted">
							{analytics.dateRange.from} bis {analytics.dateRange.to}
						</p>
					)}
				</div>
				<div className="flex h-full flex-col border-2 border-primary bg-primary px-4 py-3 text-on-primary">
					<p className="text-xs font-black uppercase">Aktive Bookings</p>
					<p className="mt-2 text-4xl font-black leading-none tabular-nums">
						{demandTotal}
					</p>
				</div>
				<div className="flex h-full flex-col border-2 border-primary bg-background px-4 py-3 text-primary">
					<p className="text-xs font-black uppercase">Stornoquote</p>
					<p className="mt-2 text-4xl font-black leading-none tabular-nums">
						{analytics
							? formatCancellationRate(
									analytics.cancellationStats.cancellationRate,
								)
							: "0 %"}
					</p>
					{analytics && (
						<p className="mt-2 text-xs font-semibold text-muted">
							{analytics.cancellationStats.cancelledBookings} von{" "}
							{analytics.cancellationStats.totalBookings} storniert
						</p>
					)}
				</div>
			</div>

			<div className="p-5">
				{isLoading && (
					<p className="bg-primary/10 px-3 py-2 text-sm font-semibold text-muted">
						Analytics werden geladen…
					</p>
				)}

				{errorMessage && (
					<FeedbackBox variant="error">{errorMessage}</FeedbackBox>
				)}

				{!isLoading && !errorMessage && analytics && demandTotal === 0 && (
					<FeedbackBox variant="empty">
						Keine aktiven Buchungen im Analytics-Zeitraum.
					</FeedbackBox>
				)}

				{!isLoading && !errorMessage && analytics && demandTotal > 0 && (
					<div className="grid gap-8 xl:grid-cols-[minmax(0,2fr)_minmax(20rem,1fr)]">
						<div className="min-w-0">
							<h3 className="text-sm font-black uppercase text-muted">
								Entwicklung
							</h3>
							<div className="mt-4 h-72">
								<ResponsiveContainer width="100%" height="100%">
									<LineChart
										data={analytics.trend}
										margin={{ top: 10, right: 12, bottom: 0, left: 0 }}
									>
										<CartesianGrid
											stroke="var(--color-border)"
											strokeDasharray="4 4"
										/>
										<XAxis
											dataKey="date"
											tickFormatter={formatDateLabel}
											tickMargin={10}
											stroke="var(--color-muted)"
											tick={{ fill: "var(--color-muted)", fontSize: 12 }}
										/>
										<YAxis
											allowDecimals={false}
											stroke="var(--color-muted)"
											tick={{ fill: "var(--color-muted)", fontSize: 12 }}
											width={32}
										/>
										<Tooltip
											labelFormatter={(date) => formatDateLabel(String(date))}
											contentStyle={{
												background: "var(--color-background)",
												border: "2px solid var(--color-primary)",
												borderRadius: 0,
												color: "var(--color-text)",
												fontWeight: 700,
											}}
										/>
										<Line
											type="monotone"
											dataKey="bookingCount"
											name="Buchungen"
											stroke="var(--color-accent)"
											strokeWidth={3}
											dot={{ r: 3, strokeWidth: 2 }}
											activeDot={{ r: 5, strokeWidth: 2 }}
										/>
									</LineChart>
								</ResponsiveContainer>
							</div>
						</div>

						<div className="min-w-0">
							<h3 className="text-sm font-black uppercase text-muted">
								Nachfrage nach UnitType
							</h3>
							<div className="mt-4 h-72">
								<ResponsiveContainer width="100%" height="100%">
									<BarChart
										data={unitTypeDemandData}
										layout="vertical"
										margin={{ top: 10, right: 12, bottom: 0, left: 12 }}
									>
										<CartesianGrid
											stroke="var(--color-border)"
											strokeDasharray="4 4"
											horizontal={false}
										/>
										<XAxis
											type="number"
											allowDecimals={false}
											stroke="var(--color-muted)"
											tick={{ fill: "var(--color-muted)", fontSize: 12 }}
										/>
										<YAxis
											type="category"
											dataKey="label"
											width={110}
											stroke="var(--color-muted)"
											tick={{ fill: "var(--color-muted)", fontSize: 12 }}
										/>
										<Tooltip
											contentStyle={{
												background: "var(--color-background)",
												border: "2px solid var(--color-primary)",
												borderRadius: 0,
												color: "var(--color-text)",
												fontWeight: 700,
											}}
										/>
										<Bar dataKey="bookingCount" name="Buchungen" radius={0}>
											{unitTypeDemandData.map((unitTypePoint) => (
												<Cell
													key={unitTypePoint.unitType}
													fill={unitTypePoint.fill}
												/>
											))}
										</Bar>
									</BarChart>
								</ResponsiveContainer>
							</div>
						</div>
					</div>
				)}
			</div>
		</section>
	);
}
