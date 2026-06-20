import { type ContactRequestType, Prisma } from "@prisma/client";
import { prisma } from "./prisma.js";

export type CreateContactRequestInput = {
	userId: string;
	type: ContactRequestType;
	message: string;
	isRead: boolean;
};

export type ContactRequestRecord = {
	id: string;
	userId: string;
	type: ContactRequestType;
	message: string;
	isRead: boolean;
	createdAt: Date;
};

export type AdminContactRequestRecord = ContactRequestRecord & {
	user: {
		id: string;
		name: string;
		email: string;
	};
};

type ListContactRequestsInput = {
	isRead?: boolean;
	orderBy: Prisma.ContactRequestOrderByWithRelationInput;
	type?: ContactRequestType;
};

type MarkContactRequestAsReadInput = {
	contactRequestId: string;
};

export async function countUnreadContactRequests(): Promise<number> {
	return prisma.contactRequest.count({
		where: { isRead: false },
	});
}

export async function createContactRequest(
	input: CreateContactRequestInput,
): Promise<ContactRequestRecord> {
	return prisma.contactRequest.create({
		data: {
			userId: input.userId,
			type: input.type,
			message: input.message,
			isRead: input.isRead,
		},
		select: {
			id: true,
			userId: true,
			type: true,
			message: true,
			isRead: true,
			createdAt: true,
		},
	});
}

export async function listContactRequests(
	input: ListContactRequestsInput,
): Promise<AdminContactRequestRecord[]> {
	return prisma.contactRequest.findMany({
		where: {
			isRead: input.isRead,
			type: input.type,
		},
		select: {
			id: true,
			userId: true,
			type: true,
			message: true,
			isRead: true,
			createdAt: true,
			user: {
				select: {
					id: true,
					name: true,
					email: true,
				},
			},
		},
		orderBy: input.orderBy,
	});
}

export async function markContactRequestAsRead(
	input: MarkContactRequestAsReadInput,
): Promise<AdminContactRequestRecord | null> {
	try {
		return await prisma.contactRequest.update({
			where: { id: input.contactRequestId },
			data: { isRead: true },
			select: {
				id: true,
				userId: true,
				type: true,
				message: true,
				isRead: true,
				createdAt: true,
				user: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
			},
		});
	} catch (error) {
		if (
			error instanceof Prisma.PrismaClientKnownRequestError &&
			error.code === "P2025"
		) {
			return null;
		}

		throw error;
	}
}
