import type { BookedInterval } from "../db/booking.repository.js";
import { AppError } from "../lib/app-error.js";
import {
	type CoworkingCalendar,
	coworkingCalendar,
} from "./coworking-calendar.js";

const BOOKING_TIME_GRID_MINUTES = 15;
const OPENING_MINUTES = 8 * 60;
const CLOSING_MINUTES = 22 * 60;

type MinuteInterval = { start: number; end: number };

function parseTime(value: string, fieldName: "startTime" | "endTime"): number {
	const match = /^(\d{2}):(\d{2})$/.exec(value.trim());

	if (!match) {
		throw new AppError(400, `${fieldName} muss im Format HH:mm sein`);
	}

	const hours = Number(match[1]);
	const minutes = Number(match[2]);

	if (hours > 23 || minutes > 59) {
		throw new AppError(400, `${fieldName} ist keine gültige Uhrzeit`);
	}

	return hours * 60 + minutes;
}

function formatMinutes(minutes: number): string {
	return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

function roundUpToGrid(minutes: number): number {
	const remainder = minutes % BOOKING_TIME_GRID_MINUTES;
	return remainder === 0
		? minutes
		: minutes + BOOKING_TIME_GRID_MINUTES - remainder;
}

function roundDownToGrid(minutes: number): number {
	return minutes - (minutes % BOOKING_TIME_GRID_MINUTES);
}

function overlaps(
	left: { startTime: Date; endTime: Date },
	right: { startTime: Date; endTime: Date },
): boolean {
	return left.startTime < right.endTime && left.endTime > right.startTime;
}

export function createBookingTimePolicy(calendar: CoworkingCalendar) {
	function assertBookableDate(date: string): string {
		const normalizedDate = calendar.getDayRange(date).date;

		if (normalizedDate < calendar.getTodayDate()) {
			throw new AppError(400, "date darf nicht in der Vergangenheit liegen");
		}

		const dayOfWeek = calendar.getDayOfWeek(normalizedDate);
		if (dayOfWeek < 1 || dayOfWeek > 5) {
			throw new AppError(400, "Zeitraum muss an einem Werktag liegen (Mo-Fr)");
		}

		return normalizedDate;
	}

	function listSlots(input: {
		date: string;
		minDurationMinutes: number;
		maxDurationMinutes: number;
		applyTodayRule: boolean;
	}) {
		const minDuration = roundUpToGrid(input.minDurationMinutes);
		const maxDuration = roundDownToGrid(input.maxDurationMinutes);
		let firstStart = OPENING_MINUTES;

		if (input.applyTodayRule && input.date === calendar.getTodayDate()) {
			const now = calendar.now();
			firstStart = Math.max(
				OPENING_MINUTES,
				roundUpToGrid(calendar.getMinutesOfDay(now) + 1),
			);
		}

		const slots = [];
		for (
			let start = firstStart;
			start + minDuration <= CLOSING_MINUTES;
			start += BOOKING_TIME_GRID_MINUTES
		) {
			for (
				let end = start + minDuration;
				end <= CLOSING_MINUTES && end - start <= maxDuration;
				end += BOOKING_TIME_GRID_MINUTES
			) {
				slots.push({
					start: formatMinutes(start),
					end: formatMinutes(end),
					startTime: calendar.toUtcDateFromMinutes(input.date, start),
					endTime: calendar.toUtcDateFromMinutes(input.date, end),
				});
			}
		}
		return slots;
	}

	function getBookingDayPlan(input: {
		date: string;
		minDurationMinutes: number;
		maxDurationMinutes: number;
		applyTodayRule?: boolean;
	}) {
		const date = assertBookableDate(input.date);
		const dayRange = calendar.getDayRange(date);
		return {
			date,
			startTime: dayRange.startTime,
			endTime: dayRange.endTime,
			openingHours: { start: "08:00", end: "22:00" },
			timeGridMinutes: BOOKING_TIME_GRID_MINUTES,
			slots: listSlots({
				...input,
				date,
				applyTodayRule: input.applyTodayRule ?? true,
			}),
		};
	}

	return {
		resolveBookingTimeInput(input: {
			date: string;
			startTime: string;
			endTime: string;
			minDurationMinutes: number;
			maxDurationMinutes: number;
		}) {
			const date = assertBookableDate(input.date);
			const startMinutes = parseTime(input.startTime, "startTime");
			const endMinutes = parseTime(input.endTime, "endTime");

			if (startMinutes >= endMinutes) {
				throw new AppError(400, "Startzeit muss vor Endzeit liegen");
			}
			if (
				startMinutes % BOOKING_TIME_GRID_MINUTES !== 0 ||
				endMinutes % BOOKING_TIME_GRID_MINUTES !== 0
			) {
				throw new AppError(
					400,
					"Start und Ende müssen auf dem 15-Minuten-Zeitraster liegen",
				);
			}
			if (startMinutes < OPENING_MINUTES || endMinutes > CLOSING_MINUTES) {
				throw new AppError(
					400,
					"Zeitraum muss innerhalb der Öffnungszeiten liegen (Mo-Fr 08:00-22:00)",
				);
			}

			const startTime = calendar.toUtcDateFromMinutes(date, startMinutes);
			const endTime = calendar.toUtcDateFromMinutes(date, endMinutes);
			if (startTime <= calendar.now()) {
				throw new AppError(400, "Nur zukünftige Zeiträume sind erlaubt");
			}

			const durationMinutes = endMinutes - startMinutes;
			if (
				durationMinutes < input.minDurationMinutes ||
				durationMinutes > input.maxDurationMinutes
			) {
				throw new AppError(
					400,
					`Buchungsdauer muss zwischen ${input.minDurationMinutes} und ${input.maxDurationMinutes} Minuten liegen`,
				);
			}

			return { date, startTime, endTime };
		},

		getBookingDayPlan,

		hasDurationValidSlot(input: {
			date: string;
			minDurationMinutes: number;
			maxDurationMinutes: number;
			blockingIntervals: BookedInterval[];
		}) {
			const plan = getBookingDayPlan({ ...input, applyTodayRule: false });
			return plan.slots.some(
				(slot) =>
					!input.blockingIntervals.some((interval) => overlaps(interval, slot)),
			);
		},

		toBlockedIntervals(intervals: BookedInterval[]) {
			const ranges = intervals
				.map((interval) => ({
					start: Math.max(
						OPENING_MINUTES,
						roundDownToGrid(calendar.getMinutesOfDay(interval.startTime)),
					),
					end: Math.min(
						CLOSING_MINUTES,
						roundUpToGrid(calendar.getMinutesOfDay(interval.endTime)),
					),
				}))
				.filter((range) => range.end > range.start)
				.sort((left, right) => left.start - right.start);
			const merged: MinuteInterval[] = [];

			for (const range of ranges) {
				const last = merged.at(-1);
				if (!last || range.start > last.end) merged.push({ ...range });
				else last.end = Math.max(last.end, range.end);
			}

			return merged.map((range) => ({
				start: formatMinutes(range.start),
				end: formatMinutes(range.end),
			}));
		},
	};
}

export type BookingTimePolicy = ReturnType<typeof createBookingTimePolicy>;
export const bookingTimePolicy = createBookingTimePolicy(coworkingCalendar);
