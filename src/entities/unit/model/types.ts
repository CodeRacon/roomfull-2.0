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
};

export type UnitListResponse = {
	units: Unit[];
};

export type UnitResponse = {
	unit: Unit;
};
