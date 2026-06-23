export type UnitTypeName = "HOT_DESK" | "BOOTH" | "TEAM_ROOM" | "MEETING_ROOM";

export type UnitType = {
	id: string;
	name: UnitTypeName;
	minDurationMinutes: number;
	maxDurationMinutes: number;
	capacity: Unit["capacity"];
};
export type UnitArea = { id: string; name: string; description: string | null };

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

export type AdminUnit = Unit & {
	descriptionDe: string | null;
	descriptionEn: string | null;
};

export type UnitListResponse = {
	units: Unit[];
};

export type UnitResponse = {
	unit: Unit;
};

export type AdminUnitListResponse = {
	units: AdminUnit[];
};

export type AdminUnitResponse = {
	unit: AdminUnit;
};

export type AdminUnitStatusFilter = "active" | "deactivated" | "all";

export type ListAdminUnitsInput = {
	status?: AdminUnitStatusFilter;
	unitType?: UnitTypeName;
	search?: string;
};

export type AdminUnitContextUnitType = {
	id: string;
	name: UnitTypeName;
};

export type AdminUnitContextArea = {
	id: string;
	name: string;
	description: string | null;
	isActive: boolean;
};

export type AdminUnitContext = {
	unitTypes: AdminUnitContextUnitType[];
	areas: AdminUnitContextArea[];
};

export type CreateAdminUnitInput = {
	name: string;
	descriptionDe: string;
	descriptionEn: string;
	capacity: number;
	isActive?: boolean;
	unitTypeId: string;
	areaId?: string;
	displayOrder?: number;
};

export type UpdateAdminUnitInput = Partial<
	Omit<CreateAdminUnitInput, "areaId">
> & {
	areaId?: string | null;
};
