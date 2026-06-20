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

export type BookedInterval = { start: string; end: string };

export type UnitDayBookings = {
	date: string;
	unitId: string;
	bookedIntervals: BookedInterval[];
};

export type UnitDayBookingsResponse = { dayBookings: UnitDayBookings };

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

export type ListAdminBookingsInput = {
	from?: string;
	limit?: number;
	search?: string;
	status?: AdminBookingViewStatus;
	to?: string;
};

export type BookingResponse = { booking: Booking };

export type CreateDirectBookingInput = {
	unitId: string;
	start: string;
	end: string;
	areaId?: never;
	unitType?: never;
};

export type CreateAutoAssignBookingInput = {
	areaId: string;
	unitType: "HOT_DESK";
	start: string;
	end: string;
	unitId?: never;
};

export type CreateBookingInput =
	| CreateDirectBookingInput
	| CreateAutoAssignBookingInput;

export type BookingListResponse = { bookings: MyBooking[] };

export type AdminBookingListResponse = { bookings: AdminBooking[] };
