import type { BookableUnit, UnitTypeName } from "@prisma/client";
import {
	doesAreaExist,
	listAreasForAdminContext,
} from "../db/area.repository.js";
import {
	type AdminUnitStatusFilter,
	type CreateUnitInput,
	createUnit,
	deactivateUnit,
	findUnitById,
	findUnitTypeById,
	type ListAdminUnitsInput,
	listAdminUnitsWithRelations,
	listUnitTypesForAdminContext,
	type UnitTypeIdentity,
	type UnitWithRelations,
	type UpdateUnitInput,
	updateUnit,
} from "../db/unit.repository.js";
import { AppError } from "../lib/app-error.js";

export type AdminUnitListInput = {
	status?: string;
	unitType?: string;
	search?: string;
};

export type CreateAdminUnitInput = Omit<CreateUnitInput, "description">;
export type UpdateAdminUnitInput = { id: string } & Partial<
	Omit<CreateAdminUnitInput, "areaId">
> & {
		areaId?: string | null;
	};

export type AdminUnitContext = {
	unitTypes: UnitTypeIdentity[];
	areas: Array<{
		id: string;
		name: string;
		description: string | null;
		isActive: boolean;
	}>;
};

export type AdminUnitManagementSource = {
	createUnit: (input: CreateUnitInput) => Promise<BookableUnit>;
	deactivateUnit: (id: string) => Promise<BookableUnit>;
	doesAreaExist: (id: string) => Promise<boolean>;
	findUnitById: (id: string) => Promise<BookableUnit | null>;
	findUnitTypeById: (id: string) => Promise<UnitTypeIdentity | null>;
	listAreas: () => Promise<AdminUnitContext["areas"]>;
	listUnits: (input: ListAdminUnitsInput) => Promise<UnitWithRelations[]>;
	listUnitTypes: () => Promise<UnitTypeIdentity[]>;
	updateUnit: (input: UpdateUnitInput) => Promise<BookableUnit>;
};

function parseOptionalUnitType(value?: string): UnitTypeName | undefined {
	const normalized = value?.trim().toUpperCase();

	if (!normalized) {
		return undefined;
	}

	switch (normalized) {
		case "HOT_DESK":
		case "BOOTH":
		case "TEAM_ROOM":
		case "MEETING_ROOM":
			return normalized;
		default:
			throw new AppError(400, "unitType ist ungültig");
	}
}

function parseStatus(value?: string): AdminUnitStatusFilter {
	const normalized = value?.trim().toLowerCase();

	if (!normalized) {
		return "active";
	}

	switch (normalized) {
		case "active":
		case "deactivated":
		case "all":
			return normalized;
		default:
			throw new AppError(400, "status ist ungültig");
	}
}

function normalizeSearch(value?: string): string | undefined {
	const normalized = value?.trim();
	return normalized && normalized.length > 0 ? normalized : undefined;
}

function assertNonEmpty(value: string, message: string): void {
	if (value.trim().length === 0) {
		throw new AppError(400, message);
	}
}

function assertPositiveInteger(value: number, message: string): void {
	if (!Number.isInteger(value) || value <= 0) {
		throw new AppError(400, message);
	}
}

function assertNonNegativeInteger(value: number, message: string): void {
	if (!Number.isInteger(value) || value < 0) {
		throw new AppError(400, message);
	}
}

function normalizeCreateInput(
	input: CreateAdminUnitInput,
): CreateAdminUnitInput {
	const trimmedAreaId = input.areaId?.trim();
	const areaId =
		trimmedAreaId && trimmedAreaId.length > 0 ? trimmedAreaId : undefined;

	return {
		...input,
		name: input.name.trim(),
		descriptionDe: input.descriptionDe.trim(),
		descriptionEn: input.descriptionEn.trim(),
		unitTypeId: input.unitTypeId.trim(),
		areaId,
	};
}

function normalizeUpdateInput(
	input: UpdateAdminUnitInput,
): UpdateAdminUnitInput {
	const normalized: UpdateAdminUnitInput = { id: input.id.trim() };

	if (input.name !== undefined) {
		normalized.name = input.name.trim();
	}

	if (input.descriptionDe !== undefined) {
		normalized.descriptionDe = input.descriptionDe.trim();
	}

	if (input.descriptionEn !== undefined) {
		normalized.descriptionEn = input.descriptionEn.trim();
	}

	if (input.unitTypeId !== undefined) {
		normalized.unitTypeId = input.unitTypeId.trim();
	}

	if (input.areaId !== undefined) {
		if (input.areaId === null) {
			normalized.areaId = null;
		} else {
			const trimmedAreaId = input.areaId.trim();
			normalized.areaId = trimmedAreaId.length > 0 ? trimmedAreaId : null;
		}
	}

	if (input.capacity !== undefined) {
		normalized.capacity = input.capacity;
	}

	if (input.displayOrder !== undefined) {
		normalized.displayOrder = input.displayOrder;
	}

	if (input.isActive !== undefined) {
		normalized.isActive = input.isActive;
	}

	return normalized;
}

function validateCreateInput(input: CreateAdminUnitInput): void {
	assertNonEmpty(input.name, "Unit-Name darf nicht leer sein");
	assertNonEmpty(
		input.descriptionDe,
		"Deutsche Beschreibung darf nicht leer sein",
	);
	assertNonEmpty(
		input.descriptionEn,
		"Englische Beschreibung darf nicht leer sein",
	);
	assertNonEmpty(input.unitTypeId, "UnitType ist erforderlich");
	assertPositiveInteger(input.capacity, "Kapazität muss größer als 0 sein");

	if (input.displayOrder !== undefined) {
		assertNonNegativeInteger(input.displayOrder, "displayOrder muss >= 0 sein");
	}

	if (input.areaId !== undefined && input.areaId.length > 0) {
		assertNonEmpty(input.areaId, "areaId ist ungültig");
	}
}

function validateUpdateInput(input: UpdateAdminUnitInput): void {
	if (input.name !== undefined) {
		assertNonEmpty(input.name, "Unit-Name darf nicht leer sein");
	}

	if (input.descriptionDe !== undefined) {
		assertNonEmpty(
			input.descriptionDe,
			"Deutsche Beschreibung darf nicht leer sein",
		);
	}

	if (input.descriptionEn !== undefined) {
		assertNonEmpty(
			input.descriptionEn,
			"Englische Beschreibung darf nicht leer sein",
		);
	}

	if (input.capacity !== undefined) {
		assertPositiveInteger(input.capacity, "Kapazität muss größer als 0 sein");
	}

	if (input.unitTypeId !== undefined) {
		assertNonEmpty(input.unitTypeId, "UnitType ist erforderlich");
	}

	if (input.displayOrder !== undefined) {
		assertNonNegativeInteger(input.displayOrder, "displayOrder muss >= 0 sein");
	}

	if (input.areaId !== undefined && input.areaId !== null) {
		assertNonEmpty(input.areaId, "areaId ist ungültig");
	}
}

export function createAdminUnitManagement(input: {
	source: AdminUnitManagementSource;
}) {
	const { source } = input;

	async function assertUnitExists(unitId: string): Promise<BookableUnit> {
		const existingUnit = await source.findUnitById(unitId);

		if (!existingUnit) {
			throw new AppError(404, "Unit wurde nicht gefunden");
		}

		return existingUnit;
	}

	async function assertAreaExists(areaId: string): Promise<void> {
		if (!(await source.doesAreaExist(areaId))) {
			throw new AppError(404, "Area wurde nicht gefunden");
		}
	}

	async function assertValidUnitTypeAndArea(
		unitTypeId: string,
		areaId: string | undefined,
	): Promise<void> {
		const unitType = await source.findUnitTypeById(unitTypeId);

		if (!unitType) {
			throw new AppError(404, "UnitType wurde nicht gefunden");
		}

		if (unitType.name === "HOT_DESK" && !areaId) {
			throw new AppError(400, "Hot Desk benötigt eine Area");
		}
	}

	return {
		async create(createInput: CreateAdminUnitInput): Promise<BookableUnit> {
			const normalizedInput = normalizeCreateInput(createInput);

			validateCreateInput(normalizedInput);
			await assertValidUnitTypeAndArea(
				normalizedInput.unitTypeId,
				normalizedInput.areaId,
			);

			if (normalizedInput.areaId) {
				await assertAreaExists(normalizedInput.areaId);
			}

			return source.createUnit({
				...normalizedInput,
				description: normalizedInput.descriptionDe,
			});
		},

		async deactivate(id: string): Promise<BookableUnit> {
			const unitId = id.trim();
			await assertUnitExists(unitId);
			return source.deactivateUnit(unitId);
		},

		async getContext(): Promise<AdminUnitContext> {
			const [unitTypes, areas] = await Promise.all([
				source.listUnitTypes(),
				source.listAreas(),
			]);

			return { unitTypes, areas };
		},

		async list(
			listInput: AdminUnitListInput = {},
		): Promise<UnitWithRelations[]> {
			return source.listUnits({
				status: parseStatus(listInput.status),
				unitType: parseOptionalUnitType(listInput.unitType),
				search: normalizeSearch(listInput.search),
			});
		},

		async update(updateInput: UpdateAdminUnitInput): Promise<BookableUnit> {
			const normalizedInput = normalizeUpdateInput(updateInput);
			const existingUnit = await assertUnitExists(normalizedInput.id);

			validateUpdateInput(normalizedInput);

			const hasAreaIdChange = "areaId" in normalizedInput;
			const effectiveUnitTypeId =
				normalizedInput.unitTypeId ?? existingUnit.unitTypeId;
			const effectiveAreaId = hasAreaIdChange
				? (normalizedInput.areaId ?? undefined)
				: (existingUnit.areaId ?? undefined);

			await assertValidUnitTypeAndArea(effectiveUnitTypeId, effectiveAreaId);

			if (
				normalizedInput.areaId !== undefined &&
				normalizedInput.areaId !== null
			) {
				await assertAreaExists(normalizedInput.areaId);
			}

			return source.updateUnit({
				...normalizedInput,
				...(normalizedInput.descriptionDe !== undefined
					? { description: normalizedInput.descriptionDe }
					: {}),
			});
		},
	};
}

const prismaAdminUnitManagementSource: AdminUnitManagementSource = {
	createUnit,
	deactivateUnit,
	doesAreaExist,
	findUnitById,
	findUnitTypeById,
	listAreas: listAreasForAdminContext,
	listUnits: listAdminUnitsWithRelations,
	listUnitTypes: listUnitTypesForAdminContext,
	updateUnit,
};

export const adminUnitManagement = createAdminUnitManagement({
	source: prismaAdminUnitManagementSource,
});
