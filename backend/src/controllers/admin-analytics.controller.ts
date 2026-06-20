import type { NextFunction, Request, Response } from "express";
import { getBookingDemandAnalytics } from "../services/admin-analytics.service.js";

function readStringQuery(value: unknown): string | undefined {
	if (typeof value !== "string") {
		return undefined;
	}

	const trimmed = value.trim();

	return trimmed.length > 0 ? trimmed : undefined;
}

function parseBookingDemandQuery(query: Request["query"]): {
	from?: string;
	to?: string;
} {
	return {
		from: readStringQuery(query.from),
		to: readStringQuery(query.to),
	};
}

export async function getBookingDemandAnalyticsController(
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> {
	try {
		const bookingDemand = await getBookingDemandAnalytics(
			parseBookingDemandQuery(req.query),
		);
		res.status(200).json({ bookingDemand });
	} catch (error) {
		next(error);
	}
}
