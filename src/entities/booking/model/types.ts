import type { UnitTypeName } from "@/entities/unit";

export type BookingContextUnitType = {
	name: UnitTypeName;
	minDurationMinutes: number;
	maxDurationMinutes: number;
};

export type DirectBookingContext = {
	mode: "DIRECT";
	unit: {
		id: string;
		name: string;
		description: string;
		capacity: number;
		unitType: BookingContextUnitType;
	};
};

export type AutoAssignBookingContext = {
	mode: "AUTO_ASSIGN";
	unitType: BookingContextUnitType;
	area: {
		id: string;
		name: string;
		description: string | null;
		seatCount: number;
	};
};

export type BookingContext = DirectBookingContext | AutoAssignBookingContext;

export type BookingContextResponse = {
	bookingContext: BookingContext;
};

export type GetBookingContextInput =
	| { unitId: string; unitType?: never; areaId?: never }
	| { unitType: "HOT_DESK"; areaId: string; unitId?: never };

export type AvailabilitySlot = {
	start: string;
	end: string;
	availableUnitCount: number;
};

export type BlockedInterval = {
	start: string;
	end: string;
};

export type BookingAvailability = {
	blockedIntervals: BlockedInterval[];
	date: string;
	openingHours: {
		start: string;
		end: string;
	};
	slots: AvailabilitySlot[];
	timeGridMinutes: number;
};

export type BookingAvailabilityResponse = {
	availability: BookingAvailability;
};

export type GetBookingAvailabilityInput =
	| { date: string; unitId: string; areaId?: never; unitType?: never }
	| { date: string; areaId: string; unitType: "HOT_DESK"; unitId?: never };

export type DirectBookingCalendarDayState =
	| "available"
	| "partially-booked"
	| "fully-booked";

export type DirectBookingCalendarState = {
	days: {
		date: string;
		state: DirectBookingCalendarDayState;
	}[];
	month: string;
	unitId: string;
};

export type DirectBookingCalendarStateResponse = {
	calendarState: DirectBookingCalendarState;
};

export type BookingStatus = "ACTIVE" | "CANCELLED";

export type Booking = {
	id: string;
	userId: string;
	unitId: string;
	startTime: string;
	endTime: string;
	status: BookingStatus;
	createdAt: string;
	updatedAt: string;
};

export type MyBooking = Booking & {
	unit: {
		id: string;
		name: string;
		unitType: {
			name: UnitTypeName;
		};
	};
};

export type AdminBooking = MyBooking & {
	user: {
		id: string;
		name: string;
		email: string;
		role: "CUSTOMER" | "ADMIN";
	};
};

export type AdminBookingViewStatus =
	| "upcoming"
	| "today"
	| "completed"
	| "cancelled"
	| "all";

export type AdminBookingRangePreset = "week" | "month" | "quarter" | "year";

export type GetAdminBookingOperationsInput = {
	from?: string;
	limit?: number;
	range?: AdminBookingRangePreset;
	search?: string;
	status?: AdminBookingViewStatus;
	to?: string;
};

export type AdminBookingOperations = {
	bookings: AdminBooking[];
	dateRange: { from: string; to: string };
	summary: {
		cancelledInRange: number;
		todayBookings: number;
		topBookedUnit?: {
			id: string;
			name: string;
			unitType: UnitTypeName;
			bookingCount: number;
		};
		upcomingInRange: number;
	};
};

export type BookingResponse = { booking: Booking };

export type CreateDirectBookingInput = {
	unitId: string;
	date: string;
	startTime: string;
	endTime: string;
	areaId?: never;
	unitType?: never;
};

export type CreateAutoAssignBookingInput = {
	areaId: string;
	unitType: "HOT_DESK";
	date: string;
	startTime: string;
	endTime: string;
	unitId?: never;
};

export type CreateBookingInput =
	| CreateDirectBookingInput
	| CreateAutoAssignBookingInput;

export type BookingListResponse = { bookings: MyBooking[] };
