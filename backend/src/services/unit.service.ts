import type { UnitTypeName } from "@prisma/client";
import {
	findActiveUnitByIdWithRelations,
	listActiveUnitsWithRelations,
	listActiveUnitsWithRelationsByUnitType,
	listUnitTypesForBookingOptions,
	type UnitTypeForBookingOption,
	type UnitWithRelations,
} from "../db/unit.repository.js";
import { AppError } from "../lib/app-error.js";
import {
	type ContentLocale,
	defaultContentLocale,
	resolveLocalizedDescription,
} from "../lib/content-locale.js";

export type BookingMode = "AUTO_ASSIGN" | "CHOOSE_UNIT";
export type AreaSelectionMode = "REQUIRED" | "NOT_APPLICABLE";
export type BookingOptionStatus = "AVAILABLE" | "UNAVAILABLE";

export type BookingOptionArea = {
	id: string;
	name: string;
	activeUnitCount: number;
};

export type BookingOptionUnit = {
	id: string;
	name: string;
};

type PublicUnitArea = Omit<
	NonNullable<UnitWithRelations["area"]>,
	"description" | "descriptionDe" | "descriptionEn"
> & {
	description: string | null;
};

export type PublicUnit = Omit<
	UnitWithRelations,
	"description" | "descriptionDe" | "descriptionEn" | "area"
> & {
	description: string;
	area: PublicUnitArea | null;
};

export type BookingOption = {
	key: UnitTypeName;
	unitType: {
		id: string;
		name: UnitTypeName;
		minDurationMinutes: number;
		maxDurationMinutes: number;
	};
	bookingMode: BookingMode;
	areaSelection: AreaSelectionMode;
	status: BookingOptionStatus;
	totalActiveUnits: number;
	maxCapacity: number;
	areas: BookingOptionArea[];
	units: BookingOptionUnit[];
};

export const BOOKING_OPTION_UNIT_TYPES: UnitTypeName[] = [
	"HOT_DESK",
	"BOOTH",
	"TEAM_ROOM",
	"MEETING_ROOM",
];

function parseOptionalUnitType(value?: string): UnitTypeName | undefined {
	const normalized = value?.trim().toUpperCase();

	if (!normalized) {
		return undefined;
	}

	switch (normalized) {
		case "HOT_DESK":
			return "HOT_DESK";
		case "BOOTH":
			return "BOOTH";
		case "TEAM_ROOM":
			return "TEAM_ROOM";
		case "MEETING_ROOM":
			return "MEETING_ROOM";
		default:
			throw new AppError(400, "unitType ist ungültig");
	}
}

function getBookingOptionStatus(totalActiveUnits: number): BookingOptionStatus {
	return totalActiveUnits > 0 ? "AVAILABLE" : "UNAVAILABLE";
}

function buildHotDeskAreas(
	unitType: UnitTypeForBookingOption,
): BookingOptionArea[] {
	const areaCounts = new Map<string, BookingOptionArea>();

	for (const unit of unitType.units) {
		const area = unit.area;
		if (!area) {
			continue;
		}

		let existing = areaCounts.get(area.id);
		if (!existing) {
			existing = {
				id: area.id,
				name: area.name,
				activeUnitCount: 0,
			};
			areaCounts.set(area.id, existing);
		}

		existing.activeUnitCount += 1;
	}

	return Array.from(areaCounts.values());
}

function buildBookingOption(unitType: UnitTypeForBookingOption): BookingOption {
	const isHotDesk = unitType.name === "HOT_DESK";

	const areas = isHotDesk ? buildHotDeskAreas(unitType) : [];
	const units = isHotDesk
		? []
		: unitType.units.map((unit) => ({ id: unit.id, name: unit.name }));

	const totalActiveUnits = isHotDesk
		? areas.reduce((sum, area) => sum + area.activeUnitCount, 0)
		: unitType.units.length;

	const maxCapacity = unitType.units.reduce(
		(max, unit) => Math.max(max, unit.capacity),
		0,
	);

	return {
		key: unitType.name,
		unitType: {
			id: unitType.id,
			name: unitType.name,
			minDurationMinutes: unitType.minDurationMinutes,
			maxDurationMinutes: unitType.maxDurationMinutes,
		},
		bookingMode: isHotDesk ? "AUTO_ASSIGN" : "CHOOSE_UNIT",
		areaSelection: isHotDesk ? "REQUIRED" : "NOT_APPLICABLE",
		status: getBookingOptionStatus(totalActiveUnits),
		totalActiveUnits,
		maxCapacity,
		areas,
		units,
	};
}

function localizeArea(
	area: UnitWithRelations["area"],
	locale: ContentLocale,
): PublicUnitArea | null {
	if (!area) {
		return null;
	}

	const { descriptionDe, descriptionEn, ...areaWithoutLocalizedDescriptions } =
		area;

	return {
		...areaWithoutLocalizedDescriptions,
		description: resolveLocalizedDescription(
			{
				description: area.description,
				descriptionDe,
				descriptionEn,
			},
			locale,
		),
	};
}

function localizeUnit(
	unit: UnitWithRelations,
	locale: ContentLocale,
): PublicUnit {
	const { area, descriptionDe, descriptionEn, ...unitWithoutArea } = unit;

	return {
		...unitWithoutArea,
		description:
			resolveLocalizedDescription(
				{
					description: unit.description,
					descriptionDe,
					descriptionEn,
				},
				locale,
			) ?? unit.description,
		area: localizeArea(area, locale),
	};
}

export async function getPublicUnits(input?: {
	locale?: ContentLocale;
	unitType?: string;
}): Promise<PublicUnit[]> {
	const unitType = parseOptionalUnitType(input?.unitType);
	const locale = input?.locale ?? defaultContentLocale;

	const units = unitType
		? await listActiveUnitsWithRelationsByUnitType(unitType)
		: await listActiveUnitsWithRelations();

	return units.map((unit) => localizeUnit(unit, locale));
}

type PublicBookingOptionsSource = {
	listUnitTypesForBookingOptions: typeof listUnitTypesForBookingOptions;
};

export function createGetPublicBookingOptions(
	source: PublicBookingOptionsSource,
): () => Promise<BookingOption[]> {
	return async () => {
		const unitTypes = await source.listUnitTypesForBookingOptions(
			BOOKING_OPTION_UNIT_TYPES,
		);
		const unitTypesByName = new Map(
			unitTypes.map((unitType) => [unitType.name, unitType]),
		);

		return BOOKING_OPTION_UNIT_TYPES.map((unitTypeName) => {
			const unitType = unitTypesByName.get(unitTypeName);

			if (!unitType) {
				throw new AppError(500, "BookingOption UnitType fehlt");
			}

			return buildBookingOption(unitType);
		});
	};
}

export const getPublicBookingOptions = createGetPublicBookingOptions({
	listUnitTypesForBookingOptions,
});

export async function getPublicUnitById(
	unitId: string,
	locale = defaultContentLocale,
): Promise<PublicUnit> {
	const normalizedUnitId = unitId.trim();

	if (normalizedUnitId.length === 0) {
		throw new AppError(400, "Ungültige Route-Parameter");
	}

	const existingUnit = await findActiveUnitByIdWithRelations(normalizedUnitId);

	if (!existingUnit) {
		throw new AppError(404, "Unit wurde nicht gefunden");
	}

	return localizeUnit(existingUnit, locale);
}
