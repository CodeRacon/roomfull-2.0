export type BookingOptionKey =
	| "HOT_DESK"
	| "BOOTH"
	| "TEAM_ROOM"
	| "MEETING_ROOM";

export type BookingMode = "AUTO_ASSIGN" | "CHOOSE_UNIT";

export type AreaSelectionMode = "REQUIRED" | "NOT_APPLICABLE";

export type BookingOptionStatus = "AVAILABLE" | "UNAVAILABLE";

export type BookingOptionArea = {
	id: string;
	name: string;
	activeUnitCount: number;
};

export type BookingOption = {
	key: BookingOptionKey;
	unitType: { id: string; name: BookingOptionKey };
	bookingMode: BookingMode;
	areaSelection: AreaSelectionMode;
	status: BookingOptionStatus;
	totalActiveUnits: number;
	areas: BookingOptionArea[];
};

export type BookingOptionListResponse = { bookingOptions: BookingOption[] };
