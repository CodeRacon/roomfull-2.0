import type { Area } from "@prisma/client";
import { prisma } from "./prisma.js";

export async function findAreaById(id: string): Promise<Area | null> {
	return prisma.area.findUnique({
		where: { id },
	});
}

export async function findActiveAreaById(id: string): Promise<Area | null> {
	return prisma.area.findFirst({
		where: {
			id,
			isActive: true,
		},
	});
}

export async function doesAreaExist(id: string): Promise<boolean> {
	const area = await prisma.area.findUnique({
		where: { id },
		select: { id: true },
	});

	return area !== null;
}

export async function listAreasForAdminContext(): Promise<Area[]> {
	return prisma.area.findMany({
		orderBy: { name: "asc" },
	});
}
