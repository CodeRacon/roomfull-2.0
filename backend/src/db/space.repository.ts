import type { Space } from "@prisma/client";
import { prisma } from "./prisma.js";

export type CreateSpaceInput = {
	name: string;
	description: string;
	capacity: number;
	isActive?: boolean;
	opensAt: string;
	closesAt: string;
	spaceTypeId: string;
};

export type UpdateSpaceInput = { id: string } & Partial<CreateSpaceInput>;

export async function listActiveSpaces(): Promise<Space[]> {
	return prisma.space.findMany({
		where: { isActive: true },
		orderBy: { createdAt: "desc" },
	});
}

export async function findSpaceById(id: string): Promise<Space | null> {
	return prisma.space.findUnique({
		where: { id },
	});
}

export async function findActiveSpaceById(id: string): Promise<Space | null> {
	return prisma.space.findFirst({
		where: {
			id,
			isActive: true,
		},
	});
}

export async function doesSpaceTypeExist(id: string): Promise<boolean> {
	const spaceType = await prisma.spaceType.findUnique({
		where: { id },
		select: { id: true },
	});

	return spaceType !== null;
}

export async function createSpace(input: CreateSpaceInput): Promise<Space> {
	return prisma.space.create({
		data: {
			name: input.name,
			description: input.description,
			capacity: input.capacity,
			isActive: input.isActive ?? true,
			opensAt: input.opensAt,
			closesAt: input.closesAt,
			spaceTypeId: input.spaceTypeId,
		},
	});
}

export async function updateSpace(input: UpdateSpaceInput): Promise<Space> {
	const { id, ...data } = input;
	return prisma.space.update({
		where: { id },
		data,
	});
}

export async function deactivateSpace(id: string): Promise<Space> {
	return prisma.space.update({
		where: { id },
		data: { isActive: false },
	});
}
