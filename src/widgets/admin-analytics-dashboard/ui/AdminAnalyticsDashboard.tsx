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
import type { Dictionary } from "@/shared/i18n";
import { FeedbackBox } from "@/shared/ui";

const unitTypeChartColors: Record<UnitTypeName, string> = {
	HOT_DESK: "var(--color-unit-hot-desk)",
	BOOTH: "var(--color-unit-booth)",
	TEAM_ROOM: "var(--color-unit-team-room)",
	MEETING_ROOM: "var(--color-unit-meeting-room)",
};

function parseAnalyticsDate(date: string): Date {
	const [year, month, day] = date.split("-").map(Number);
	return new Date(Date.UTC(year, month - 1, day));
}

function formatDateLabel(date: string, formatter: Intl.DateTimeFormat): string {
	return formatter.format(parseAnalyticsDate(date));
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

function formatTemplate(
	template: string,
	values: Record<string, string | number>,
): string {
	return Object.entries(values).reduce(
		(result, [key, value]) => result.replace(`{${key}}`, String(value)),
		template,
	);
}

type AdminAnalyticsDashboardProps = {
	copy: Dictionary["adminShell"]["analytics"];
};

export function AdminAnalyticsDashboard({
	copy,
}: AdminAnalyticsDashboardProps) {
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
						setErrorMessage(copy.errors.forbidden);
						return;
					}
				}

				setErrorMessage(copy.errors.fallback);
			} finally {
				setIsLoading(false);
			}
		}

		void loadAnalytics();
	}, [status, endSession, copy.errors.forbidden, copy.errors.fallback]);

	const dateLabelFormatter = useMemo(
		() =>
			new Intl.DateTimeFormat(copy.dateLocale, {
				day: "2-digit",
				month: "2-digit",
			}),
		[copy.dateLocale],
	);
	const dateRangeFormatter = useMemo(
		() =>
			new Intl.DateTimeFormat(copy.dateLocale, {
				day: "2-digit",
				month: "2-digit",
				year: "numeric",
			}),
		[copy.dateLocale],
	);
	const percentFormatter = useMemo(
		() =>
			new Intl.NumberFormat(copy.dateLocale, {
				maximumFractionDigits: 1,
				style: "percent",
			}),
		[copy.dateLocale],
	);

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
						{copy.eyebrow}
					</p>
					<h2 className="mt-2 text-3xl font-black leading-none text-text">
						{copy.title}
					</h2>
					{analytics && (
						<p className="mt-3 text-sm font-semibold text-muted">
							{formatTemplate(copy.dateRange, {
								from: dateRangeFormatter.format(
									parseAnalyticsDate(analytics.dateRange.from),
								),
								to: dateRangeFormatter.format(
									parseAnalyticsDate(analytics.dateRange.to),
								),
							})}
						</p>
					)}
				</div>
				<div className="flex h-full flex-col border-2 border-primary bg-primary px-4 py-3 text-on-primary">
					<p className="text-xs font-black uppercase">{copy.activeBookings}</p>
					<p className="mt-2 text-4xl font-black leading-none tabular-nums">
						{demandTotal}
					</p>
				</div>
				<div className="flex h-full flex-col border-2 border-primary bg-background px-4 py-3 text-primary">
					<p className="text-xs font-black uppercase">
						{copy.cancellationRate}
					</p>
					<p className="mt-2 text-4xl font-black leading-none tabular-nums">
						{analytics
							? percentFormatter.format(
									analytics.cancellationStats.cancellationRate,
								)
							: percentFormatter.format(0)}
					</p>
					{analytics && (
						<p className="mt-2 text-xs font-semibold text-muted">
							{formatTemplate(copy.cancellationSummary, {
								cancelled: analytics.cancellationStats.cancelledBookings,
								total: analytics.cancellationStats.totalBookings,
							})}
						</p>
					)}
				</div>
			</div>

			<div className="p-5">
				{isLoading && (
					<p className="bg-primary/10 px-3 py-2 text-sm font-semibold text-muted">
						{copy.loading}
					</p>
				)}

				{errorMessage && (
					<FeedbackBox variant="error">{errorMessage}</FeedbackBox>
				)}

				{!isLoading && !errorMessage && analytics && demandTotal === 0 && (
					<FeedbackBox variant="empty">{copy.empty}</FeedbackBox>
				)}

				{!isLoading && !errorMessage && analytics && demandTotal > 0 && (
					<div className="grid gap-8 xl:grid-cols-[minmax(0,2fr)_minmax(20rem,1fr)]">
						<div className="min-w-0">
							<h3 className="text-sm font-black uppercase text-muted">
								{copy.trendTitle}
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
											tickFormatter={(date) =>
												formatDateLabel(date, dateLabelFormatter)
											}
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
											labelFormatter={(date) =>
												formatDateLabel(String(date), dateLabelFormatter)
											}
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
											name={copy.bookingSeriesName}
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
								{copy.unitTypeDemandTitle}
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
										<Bar
											dataKey="bookingCount"
											name={copy.bookingSeriesName}
											radius={0}
										>
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
