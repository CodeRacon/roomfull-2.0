import type { UnitTypeName } from "@/entities/unit";

export type BookingDemandTrendPoint = {
	date: string;
	bookingCount: number;
};

export type BookingDemandUnitTypePoint = {
	unitType: UnitTypeName;
	bookingCount: number;
};

export type BookingCancellationStats = {
	activeBookings: number;
	cancelledBookings: number;
	totalBookings: number;
	cancellationRate: number;
};

export type BookingDemandAnalytics = {
	cancellationStats: BookingCancellationStats;
	dateRange: {
		from: string;
		to: string;
	};
	demandByUnitType: BookingDemandUnitTypePoint[];
	granularity: "day";
	metric: "activeBookingsByStartDate";
	trend: BookingDemandTrendPoint[];
};

export type BookingDemandAnalyticsResponse = {
	bookingDemand: BookingDemandAnalytics;
};

export type GetBookingDemandAnalyticsInput = {
	from?: string;
	to?: string;
};
