import type { NextFunction, Request, Response } from "express";
import { AppError } from "../lib/app-error.js";
import { parseContentLocale } from "../lib/content-locale.js";
import {
	cancelBookingForUser,
	createBookingForUser,
	getBookingContext,
	listAllBookingsForAdmin,
	listUnitDayBookings,
	listUserBookings,
} from "../services/booking.service.js";
import { getBookingAvailability } from "../services/booking-availability.js";

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

type CreateBookingBody = {
	start: string;
	end: string;
	unitId?: string;
	areaId?: string;
	unitType?: string;
};

function fail(next: NextFunction, statusCode: number, message: string): void {
	next(new AppError(statusCode, message));
}

function parseAuthUserId(auth: Request["auth"]): string | null {
	const userId = auth?.userId?.trim() ?? "";
	return userId.length > 0 ? userId : null;
}

function parseCreateBookingBody(body: unknown): CreateBookingBody | null {
	if (!isRecord(body)) {
		return null;
	}

	const start = typeof body.start === "string" ? body.start.trim() : "";
	const end = typeof body.end === "string" ? body.end.trim() : "";

	const unitId =
		typeof body.unitId === "string" ? body.unitId.trim() : undefined;

	const areaId =
		typeof body.areaId === "string" ? body.areaId.trim() : undefined;

	const unitType =
		typeof body.unitType === "string" ? body.unitType.trim() : undefined;

	if (start.length === 0 || end.length === 0) {
		return null;
	}

	return {
		start,
		end,
		unitId,
		areaId,
		unitType,
	};
}

function readStringQuery(value: unknown): string | undefined {
	if (typeof value !== "string") {
		return undefined;
	}

	const trimmed = value.trim();

	return trimmed.length > 0 ? trimmed : undefined;
}

function parseBookingContextQuery(query: Request["query"]): {
	unitId?: string;
	areaId?: string;
	unitType?: string;
	locale?: ReturnType<typeof parseContentLocale>;
} {
	const unitId = readStringQuery(query.unitId);
	const areaId = readStringQuery(query.areaId);
	const unitType = readStringQuery(query.unitType);
	const locale = parseContentLocale(readStringQuery(query.locale));

	return { unitId, areaId, unitType, locale };
}

function parseBookingAvailabilityQuery(query: Request["query"]): {
	areaId?: string;
	date?: string;
	unitId?: string;
	unitType?: string;
} {
	return {
		areaId: readStringQuery(query.areaId),
		date: readStringQuery(query.date),
		unitId: readStringQuery(query.unitId),
		unitType: readStringQuery(query.unitType),
	};
}

export async function getBookingContextController(
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> {
	const userId = parseAuthUserId(req.auth);

	if (!userId) {
		fail(next, 401, "Nicht eingeloggt");
		return;
	}

	const input = parseBookingContextQuery(req.query);

	try {
		const bookingContext = await getBookingContext(input);
		res.status(200).json({ bookingContext });
	} catch (error) {
		next(error);
	}
}

export async function createBookingController(
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> {
	const userId = parseAuthUserId(req.auth);

	if (!userId) {
		fail(next, 401, "Nicht eingeloggt");
		return;
	}

	const input = parseCreateBookingBody(req.body);

	if (!input) {
		fail(next, 400, "Ungültiger Request Body");
		return;
	}

	try {
		const booking = await createBookingForUser({
			userId,
			start: input.start,
			end: input.end,
			unitId: input.unitId,
			areaId: input.areaId,
			unitType: input.unitType,
		});

		res.status(201).json({ booking });
	} catch (error) {
		next(error);
	}
}

export async function getBookingAvailabilityController(
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> {
	const userId = parseAuthUserId(req.auth);

	if (!userId) {
		fail(next, 401, "Nicht eingeloggt");
		return;
	}

	try {
		const availability = await getBookingAvailability(
			parseBookingAvailabilityQuery(req.query),
		);
		res.status(200).json({ availability });
	} catch (error) {
		next(error);
	}
}

export async function listMyBookingsController(
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> {
	const userId = parseAuthUserId(req.auth);

	if (!userId) {
		fail(next, 401, "Nicht eingeloggt");
		return;
	}

	try {
		const bookings = await listUserBookings({
			userId,
		});

		res.status(200).json({ bookings });
	} catch (error) {
		next(error);
	}
}

type BookingParams = { bookingId: string };
type UnitParams = { unitId: string };

function parseBookingId(params: Request["params"]): string | null {
	const bookingId =
		typeof params.bookingId === "string" ? params.bookingId.trim() : "";
	return bookingId.length > 0 ? bookingId : null;
}

function parseUnitId(params: Request["params"]): string | null {
	const unitId = typeof params.unitId === "string" ? params.unitId.trim() : "";
	return unitId.length > 0 ? unitId : null;
}

function parseDateQuery(query: Request["query"]): string | null {
	const date = typeof query.date === "string" ? query.date.trim() : "";
	return date.length > 0 ? date : null;
}

function parseAdminBookingsQuery(query: Request["query"]): {
	from?: string;
	limit?: string;
	search?: string;
	status?: string;
	to?: string;
} {
	return {
		from: readStringQuery(query.from),
		limit: readStringQuery(query.limit),
		search: readStringQuery(query.search),
		status: readStringQuery(query.status),
		to: readStringQuery(query.to),
	};
}

export async function cancelBookingController(
	req: Request<BookingParams>,
	res: Response,
	next: NextFunction,
): Promise<void> {
	const userId = parseAuthUserId(req.auth);
	if (!userId) {
		fail(next, 401, "Nicht eingeloggt");
		return;
	}

	const bookingId = parseBookingId(req.params);
	if (!bookingId) {
		fail(next, 400, "Ungültige Route-Parameter");
		return;
	}

	try {
		const booking = await cancelBookingForUser({ userId, bookingId });
		res.status(200).json({ booking });
	} catch (error) {
		next(error);
	}
}

export async function listAdminBookingsController(
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> {
	try {
		const bookings = await listAllBookingsForAdmin(
			parseAdminBookingsQuery(req.query),
		);
		res.status(200).json({ bookings });
	} catch (error) {
		next(error);
	}
}

export async function listUnitDayBookingsController(
	req: Request<UnitParams>,
	res: Response,
	next: NextFunction,
): Promise<void> {
	const unitId = parseUnitId(req.params);

	if (!unitId) {
		fail(next, 400, "Ungültige Route-Parameter");
		return;
	}

	const date = parseDateQuery(req.query);

	if (!date) {
		fail(next, 400, "date Query-Parameter ist erforderlich");
		return;
	}

	try {
		const dayBookings = await listUnitDayBookings({ unitId, date });
		res.status(200).json({ dayBookings });
	} catch (error) {
		next(error);
	}
}
