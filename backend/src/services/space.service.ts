import type { Space } from "@prisma/client";
import {
	type CreateSpaceInput,
	createSpace,
	deactivateSpace,
	doesSpaceTypeExist,
	findActiveSpaceById,
	findSpaceById,
	listActiveSpaces,
	type UpdateSpaceInput,
	updateSpace,
} from "../db/space.repository.js";
import { AppError } from "../lib/app-error.js";

const TIME_24H_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

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

function assertValidTime(time: string, fieldName: string): void {
	if (!TIME_24H_REGEX.test(time)) {
		throw new AppError(400, `${fieldName} muss im Format HH:mm sein`);
	}
}

function assertOpenBeforeClose(opensAt: string, closesAt: string): void {
	if (opensAt >= closesAt) {
		throw new AppError(400, "Öffnungszeit muss vor Schließzeit liegen");
	}
}

function normalizeCreateInput(input: CreateSpaceInput): CreateSpaceInput {
	return {
		...input,
		name: input.name.trim(),
		description: input.description.trim(),
		opensAt: input.opensAt.trim(),
		closesAt: input.closesAt.trim(),
		spaceTypeId: input.spaceTypeId.trim(),
	};
}

function normalizeUpdateInput(input: UpdateSpaceInput): UpdateSpaceInput {
	const normalized: UpdateSpaceInput = {
		id: input.id.trim(),
	};

	if (input.name !== undefined) {
		normalized.name = input.name.trim();
	}

	if (input.description !== undefined) {
		normalized.description = input.description.trim();
	}

	if (input.opensAt !== undefined) {
		normalized.opensAt = input.opensAt.trim();
	}

	if (input.closesAt !== undefined) {
		normalized.closesAt = input.closesAt.trim();
	}

	if (input.spaceTypeId !== undefined) {
		normalized.spaceTypeId = input.spaceTypeId.trim();
	}

	if (input.capacity !== undefined) {
		normalized.capacity = input.capacity;
	}

	if (input.isActive !== undefined) {
		normalized.isActive = input.isActive;
	}

	return normalized;
}

async function assertSpaceExists(spaceId: string): Promise<Space> {
	const existingSpace = await findSpaceById(spaceId);

	if (!existingSpace) {
		throw new AppError(404, "Space wurde nicht gefunden");
	}

	return existingSpace;
}

async function assertSpaceTypeExists(spaceTypeId: string): Promise<void> {
	const existingSpaceType = await doesSpaceTypeExist(spaceTypeId);

	if (!existingSpaceType) {
		throw new AppError(404, "Space-Typ wurde nicht gefunden");
	}
}

function validateCreateInput(input: CreateSpaceInput): void {
	assertNonEmpty(input.name, "Space-Name darf nicht leer sein");
	assertNonEmpty(input.description, "Beschreibung darf nicht leer sein");
	assertNonEmpty(input.opensAt, "Öffnungs- und Schließzeit sind erforderlich");
	assertNonEmpty(input.closesAt, "Öffnungs- und Schließzeit sind erforderlich");
	assertNonEmpty(input.spaceTypeId, "Space-Typ ist erforderlich");
	assertPositiveInteger(input.capacity, "Kapazität muss größer als 0 sein");

	assertValidTime(input.opensAt, "Öffnungszeit");
	assertValidTime(input.closesAt, "Schließzeit");
	assertOpenBeforeClose(input.opensAt, input.closesAt);
}

function validateUpdateInput(input: UpdateSpaceInput): void {
	if (input.name !== undefined) {
		assertNonEmpty(input.name, "Space-Name darf nicht leer sein");
	}

	if (input.description !== undefined) {
		assertNonEmpty(input.description, "Beschreibung darf nicht leer sein");
	}

	if (input.opensAt !== undefined) {
		assertNonEmpty(input.opensAt, "Öffnungszeit darf nicht leer sein");
		assertValidTime(input.opensAt, "Öffnungszeit");
	}

	if (input.closesAt !== undefined) {
		assertNonEmpty(input.closesAt, "Schließzeit darf nicht leer sein");
		assertValidTime(input.closesAt, "Schließzeit");
	}

	if (input.capacity !== undefined) {
		assertPositiveInteger(input.capacity, "Kapazität muss größer als 0 sein");
	}

	if (input.spaceTypeId !== undefined) {
		assertNonEmpty(input.spaceTypeId, "Space-Typ ist erforderlich");
	}
}

export async function createNewSpace(input: CreateSpaceInput): Promise<Space> {
	const normalizedInput = normalizeCreateInput(input);

	validateCreateInput(normalizedInput);
	await assertSpaceTypeExists(normalizedInput.spaceTypeId);

	return createSpace(normalizedInput);
}

export async function getPublicSpaces(): Promise<Space[]> {
	return listActiveSpaces();
}

export async function getPublicSpaceById(spaceId: string): Promise<Space> {
	const normalizedSpaceId = spaceId.trim();

	if (normalizedSpaceId.length === 0) {
		throw new AppError(400, "Ungültige Route-Parameter");
	}

	const existingSpace = await findActiveSpaceById(normalizedSpaceId);

	if (!existingSpace) {
		throw new AppError(404, "Space wurde nicht gefunden");
	}

	return existingSpace;
}

export async function updateExistingSpace(
	input: UpdateSpaceInput,
): Promise<Space> {
	const normalizedInput = normalizeUpdateInput(input);
	const existingSpace = await assertSpaceExists(normalizedInput.id);

	validateUpdateInput(normalizedInput);

	if (normalizedInput.spaceTypeId !== undefined) {
		await assertSpaceTypeExists(normalizedInput.spaceTypeId);
	}

	const opensAt = normalizedInput.opensAt ?? existingSpace.opensAt;
	const closesAt = normalizedInput.closesAt ?? existingSpace.closesAt;

	if (
		normalizedInput.opensAt !== undefined ||
		normalizedInput.closesAt !== undefined
	) {
		assertOpenBeforeClose(opensAt, closesAt);
	}

	return updateSpace(normalizedInput);
}

export async function deactivateExistingSpace(id: string): Promise<Space> {
	const spaceId = id.trim();

	await assertSpaceExists(spaceId);

	return deactivateSpace(spaceId);
}
