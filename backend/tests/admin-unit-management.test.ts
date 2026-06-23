import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { BookableUnit, UnitTypeName } from "@prisma/client";
import { AppError } from "../src/lib/app-error.js";
import {
	type AdminUnitManagementSource,
	createAdminUnitManagement,
} from "../src/services/admin-unit-management.js";

const timestamp = new Date("2026-06-22T08:00:00.000Z");

function createUnit(overrides: Partial<BookableUnit> = {}): BookableUnit {
	return {
		id: "unit-1",
		name: "Booth Eins",
		description: "Ruhiger Einzelplatz",
		descriptionDe: null,
		descriptionEn: null,
		capacity: 1,
		isActive: true,
		unitTypeId: "type-booth",
		areaId: null,
		displayOrder: 0,
		createdAt: timestamp,
		updatedAt: timestamp,
		...overrides,
	};
}

function createHarness(input?: {
	areas?: Array<{
		id: string;
		name: string;
		description: string | null;
		isActive: boolean;
	}>;
	unitTypes?: Array<{ id: string; name: UnitTypeName }>;
	units?: BookableUnit[];
}) {
	const areas = input?.areas ?? [
		{
			id: "area-open-world",
			name: "Open World",
			description: "Open World",
			isActive: true,
		},
	];
	const unitTypes = input?.unitTypes ?? [
		{ id: "type-booth", name: "BOOTH" as const },
		{ id: "type-hot-desk", name: "HOT_DESK" as const },
	];
	const units = [...(input?.units ?? [])];
	const listScopes: unknown[] = [];

	const source: AdminUnitManagementSource = {
		createUnit: async (unitInput) => {
			const unit = createUnit({
				...unitInput,
				id: `unit-${units.length + 1}`,
				areaId: unitInput.areaId ?? null,
				isActive: unitInput.isActive ?? true,
				displayOrder: unitInput.displayOrder ?? 0,
			});
			units.push(unit);
			return unit;
		},
		deactivateUnit: async (id) => {
			const index = units.findIndex((unit) => unit.id === id);
			const unit = { ...units[index], isActive: false };
			units[index] = unit;
			return unit;
		},
		doesAreaExist: async (id) => areas.some((area) => area.id === id),
		findUnitById: async (id) => units.find((unit) => unit.id === id) ?? null,
		findUnitTypeById: async (id) =>
			unitTypes.find((unitType) => unitType.id === id) ?? null,
		listAreas: async () => areas,
		listUnitTypes: async () => unitTypes,
		listUnits: async (scope) => {
			listScopes.push(scope);
			return [];
		},
		updateUnit: async ({ id, ...changes }) => {
			const index = units.findIndex((unit) => unit.id === id);
			const unit = { ...units[index], ...changes };
			units[index] = unit;
			return unit;
		},
	};

	return {
		listScopes,
		management: createAdminUnitManagement({ source }),
		units,
	};
}

function assertAppError(
	action: () => Promise<unknown>,
	statusCode: number,
): Promise<void> {
	return assert.rejects(
		action,
		(error: unknown) =>
			error instanceof AppError && error.statusCode === statusCode,
	);
}

describe("Admin Unit Management", () => {
	it("creates a BookableUnit from normalized input", async () => {
		const { management, units } = createHarness();

		const created = await management.create({
			name: "  Booth Zwei  ",
			descriptionDe: "  Ruhiger Fensterplatz  ",
			descriptionEn: "  Quiet window seat  ",
			capacity: 2,
			unitTypeId: "  type-booth  ",
		});

		assert.equal(created, units[0]);
		assert.deepEqual(
			{
				name: created.name,
				description: created.description,
				descriptionDe: created.descriptionDe,
				descriptionEn: created.descriptionEn,
				capacity: created.capacity,
				unitTypeId: created.unitTypeId,
				isActive: created.isActive,
				displayOrder: created.displayOrder,
			},
			{
				name: "Booth Zwei",
				description: "Ruhiger Fensterplatz",
				descriptionDe: "Ruhiger Fensterplatz",
				descriptionEn: "Quiet window seat",
				capacity: 2,
				unitTypeId: "type-booth",
				isActive: true,
				displayOrder: 0,
			},
		);
	});

	it("rejects a Hot Desk without an Area", async () => {
		const { management } = createHarness();

		await assertAppError(
			() =>
				management.create({
					name: "Desk Eins",
					descriptionDe: "Flex Desk",
					descriptionEn: "Flex desk",
					capacity: 1,
					unitTypeId: "type-hot-desk",
				}),
			400,
		);
	});

	it("rejects unknown UnitTypes and Areas", async () => {
		const { management } = createHarness();
		const validInput = {
			name: "Desk Eins",
			descriptionDe: "Flex Desk",
			descriptionEn: "Flex desk",
			capacity: 1,
			unitTypeId: "type-hot-desk",
		};

		await assertAppError(
			() => management.create({ ...validInput, unitTypeId: "missing" }),
			404,
		);
		await assertAppError(
			() => management.create({ ...validInput, areaId: "missing" }),
			404,
		);
	});

	it("validates partial updates as the effective BookableUnit state", async () => {
		const hotDesk = createUnit({
			id: "desk-1",
			unitTypeId: "type-hot-desk",
			areaId: "area-open-world",
		});
		const booth = createUnit({ id: "booth-1" });
		const { management } = createHarness({ units: [hotDesk, booth] });

		const renamed = await management.update({
			id: "desk-1",
			name: "  Desk am Fenster  ",
		});
		assert.equal(renamed.name, "Desk am Fenster");
		await assertAppError(
			() => management.update({ id: "desk-1", areaId: null }),
			400,
		);
		await assertAppError(
			() =>
				management.update({
					id: "booth-1",
					unitTypeId: "type-hot-desk",
				}),
			400,
		);
	});

	it("updates localized descriptions and keeps the legacy fallback in sync", async () => {
		const existing = createUnit({
			description: "Alte Beschreibung",
			descriptionDe: "Alte Beschreibung",
			descriptionEn: "Old description",
		});
		const { management } = createHarness({ units: [existing] });

		const updated = await management.update({
			id: existing.id,
			descriptionDe: "  Neue Beschreibung  ",
			descriptionEn: "  New description  ",
		});

		assert.equal(updated.description, "Neue Beschreibung");
		assert.equal(updated.descriptionDe, "Neue Beschreibung");
		assert.equal(updated.descriptionEn, "New description");
	});

	it("deactivates the existing BookableUnit without replacing it", async () => {
		const existing = createUnit();
		const { management } = createHarness({ units: [existing] });

		const deactivated = await management.deactivate("  unit-1  ");

		assert.equal(deactivated.id, existing.id);
		assert.equal(deactivated.isActive, false);
		assert.equal(deactivated.name, existing.name);
		assert.equal(deactivated.unitTypeId, existing.unitTypeId);
	});

	it("normalizes inventory filters and rejects invalid values", async () => {
		const { listScopes, management } = createHarness();

		await management.list();
		await management.list({
			status: "all",
			unitType: " booth ",
			search: "  Fenster  ",
		});

		assert.deepEqual(listScopes, [
			{ status: "active", unitType: undefined, search: undefined },
			{ status: "all", unitType: "BOOTH", search: "Fenster" },
		]);
		await assertAppError(() => management.list({ status: "archived" }), 400);
		await assertAppError(() => management.list({ unitType: "DESK" }), 400);
	});

	it("returns UnitTypes and Areas as one Admin Unit Context", async () => {
		const { management } = createHarness();

		const context = await management.getContext();

		assert.deepEqual(context, {
			unitTypes: [
				{ id: "type-booth", name: "BOOTH" },
				{ id: "type-hot-desk", name: "HOT_DESK" },
			],
			areas: [
				{
					id: "area-open-world",
					name: "Open World",
					description: "Open World",
					isActive: true,
				},
			],
		});
	});
});
