export type UnitTypeName =
	| "HOT_DESK"
	| "BOOTH"
	| "TEAM_ROOM"
	| "MEETING_ROOM";

export type UnitType = { id: string; name: UnitTypeName };
export type UnitArea = { id: string; name: string };

export type Unit = {
	id: string;
	name: string;
	description: string;
	capacity: number;
	isActive: boolean;
	displayOrder: number;
	unitTypeId: string;
	areaId: string | null;
	createdAt: string;
	updatedAt: string;
	unitType: UnitType;
	area: UnitArea | null;
};

export type UnitListResponse = {
	units: Unit[];
};

export type UnitResponse = {
	unit: Unit;
};
