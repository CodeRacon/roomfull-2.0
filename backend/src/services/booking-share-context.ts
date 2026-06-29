import { BookingStatus } from "@prisma/client";
import {
	type BookingShareContextRecord,
	findBookingShareContext,
} from "../db/booking.repository.js";
import { AppError } from "../lib/app-error.js";
import { coworkingCalendar } from "./coworking-calendar.js";

export type BookingShareContext = {
	booking: {
		id: string;
		startTime: Date;
		endTime: Date;
	};
	unit: {
		id: string;
		name: string;
		capacity: number;
		unitType: {
			name: BookingShareContextRecord["unit"]["unitType"]["name"];
		};
	};
};

export type BookingShareContextSource = {
	findBookingShareContext(input: {
		bookingId: string;
	}): Promise<BookingShareContextRecord | null>;
};

type BookingShareContextClock = {
	now(): Date;
};

export function createBookingShareContextService(input: {
	source: BookingShareContextSource;
	clock: BookingShareContextClock;
}) {
	return {
		async get(getInput: {
			customerId: string;
			bookingId: string;
		}): Promise<BookingShareContext> {
			const customerId = getInput.customerId.trim();
			if (customerId.length === 0) {
				throw new AppError(400, "customerId ist erforderlich");
			}

			const bookingId = getInput.bookingId.trim();
			if (bookingId.length === 0) {
				throw new AppError(400, "bookingId ist erforderlich");
			}

			const booking = await input.source.findBookingShareContext({ bookingId });

			if (!booking || booking.userId !== customerId) {
				throw new AppError(404, "Buchung wurde nicht gefunden");
			}

			if (
				booking.status !== BookingStatus.ACTIVE ||
				booking.endTime < input.clock.now()
			) {
				throw new AppError(409, "Buchung ist nicht mehr teilbar");
			}

			return {
				booking: {
					id: booking.id,
					startTime: booking.startTime,
					endTime: booking.endTime,
				},
				unit: {
					id: booking.unit.id,
					name: booking.unit.name,
					capacity: booking.unit.capacity,
					unitType: {
						name: booking.unit.unitType.name,
					},
				},
			};
		},
	};
}

export type BookingShareContextService = ReturnType<
	typeof createBookingShareContextService
>;

export const bookingShareContextService = createBookingShareContextService({
	source: { findBookingShareContext },
	clock: coworkingCalendar,
});
