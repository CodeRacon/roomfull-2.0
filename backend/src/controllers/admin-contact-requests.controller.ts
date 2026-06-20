import type { NextFunction, Request, Response } from "express";
import { AppError } from "../lib/app-error.js";
import {
	getUnreadContactRequestCountForAdmin,
	listContactRequestsForAdmin,
	markContactRequestAsReadForAdmin,
} from "../services/contact-request.service.js";

function readStringQuery(value: unknown): string | undefined {
	if (typeof value !== "string") {
		return undefined;
	}

	const trimmed = value.trim();

	return trimmed.length > 0 ? trimmed : undefined;
}

function parseAdminContactRequestsQuery(query: Request["query"]): {
	readState?: string;
	sort?: string;
	type?: string;
} {
	return {
		readState: readStringQuery(query.readState),
		sort: readStringQuery(query.sort),
		type: readStringQuery(query.type),
	};
}

function parseContactRequestId(params: Request["params"]): string | null {
	const contactRequestId =
		typeof params.contactRequestId === "string"
			? params.contactRequestId.trim()
			: "";

	return contactRequestId.length > 0 ? contactRequestId : null;
}

export async function listAdminContactRequestsController(
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> {
	try {
		const contactRequests = await listContactRequestsForAdmin(
			parseAdminContactRequestsQuery(req.query),
		);
		res.status(200).json({ contactRequests });
	} catch (error) {
		next(error);
	}
}

export async function getAdminContactRequestUnreadCountController(
	_req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> {
	try {
		const unreadCount = await getUnreadContactRequestCountForAdmin();
		res.status(200).json({ unreadCount });
	} catch (error) {
		next(error);
	}
}

export async function markAdminContactRequestAsReadController(
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> {
	const contactRequestId = parseContactRequestId(req.params);

	if (!contactRequestId) {
		next(new AppError(400, "Ungültige Route-Parameter"));
		return;
	}

	try {
		const contactRequest = await markContactRequestAsReadForAdmin({
			contactRequestId,
		});
		res.status(200).json({ contactRequest });
	} catch (error) {
		next(error);
	}
}
