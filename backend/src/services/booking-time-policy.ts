import { AppError } from "../lib/app-error.js";

export const COWORKING_TIME_ZONE = "Europe/Berlin";

const WEEKDAY_START = 1;
const WEEKDAY_END = 5;
const OPENING_MINUTES = 8 * 60;
const CLOSING_MINUTES = 22 * 60;

type LocalDateTimeParts = {
	year: number;
	month: number;
	day: number;
	hour: number;
	minute: number;
};

const berlinDateTimeFormatter = new Intl.DateTimeFormat("en-CA", {
	timeZone: COWORKING_TIME_ZONE,
	year: "numeric",
	month: "2-digit",
	day: "2-digit",
	hour: "2-digit",
	minute: "2-digit",
	hourCycle: "h23",
});

export function parseDateTime(value: string, fieldName: "start" | "end"): Date {
	const trimmed = value.trim();

	if (trimmed === "") {
		throw new AppError(400, `${fieldName} ist erforderlich`);
	}

	const date = new Date(trimmed);

	if (Number.isNaN(date.getTime())) {
		throw new AppError(400, `${fieldName} muss ein gültiges ISO-Datum sein`);
	}

	return date;
}

function getBerlinDateTimeParts(date: Date): LocalDateTimeParts {
	const parts = berlinDateTimeFormatter.formatToParts(date);
	const values = new Map(parts.map((part) => [part.type, part.value]));

	return {
		year: Number(values.get("year")),
		month: Number(values.get("month")),
		day: Number(values.get("day")),
		hour: Number(values.get("hour")),
		minute: Number(values.get("minute")),
	};
}

function getBerlinDateString(date: Date): string {
	const { year, month, day } = getBerlinDateTimeParts(date);
	return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function assertValidBerlinDateString(date: string): LocalDateTimeParts {
	const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date.trim());

	if (!match) {
		throw new AppError(400, "date muss im Format YYYY-MM-DD sein");
	}

	const year = Number(match[1]);
	const month = Number(match[2]);
	const day = Number(match[3]);
	const utcDate = new Date(Date.UTC(year, month - 1, day));

	if (
		utcDate.getUTCFullYear() !== year ||
		utcDate.getUTCMonth() !== month - 1 ||
		utcDate.getUTCDate() !== day
	) {
		throw new AppError(400, "date ist kein gültiges Kalenderdatum");
	}

	return { year, month, day, hour: 0, minute: 0 };
}

function addDays(
	dateParts: LocalDateTimeParts,
	days: number,
): LocalDateTimeParts {
	const utcDate = new Date(
		Date.UTC(dateParts.year, dateParts.month - 1, dateParts.day + days),
	);

	return {
		year: utcDate.getUTCFullYear(),
		month: utcDate.getUTCMonth() + 1,
		day: utcDate.getUTCDate(),
		hour: dateParts.hour,
		minute: dateParts.minute,
	};
}

function toUtcDateFromBerlinParts(dateParts: LocalDateTimeParts): Date {
	const initialUtcMs = Date.UTC(
		dateParts.year,
		dateParts.month - 1,
		dateParts.day,
		dateParts.hour,
		dateParts.minute,
	);
	const actualBerlinParts = getBerlinDateTimeParts(new Date(initialUtcMs));
	const desiredLocalMs = Date.UTC(
		dateParts.year,
		dateParts.month - 1,
		dateParts.day,
		dateParts.hour,
		dateParts.minute,
	);
	const actualLocalMs = Date.UTC(
		actualBerlinParts.year,
		actualBerlinParts.month - 1,
		actualBerlinParts.day,
		actualBerlinParts.hour,
		actualBerlinParts.minute,
	);

	return new Date(initialUtcMs - (actualLocalMs - desiredLocalMs));
}

function assertSameBerlinCalendarDay(
	startTime: Date,
	endTime: Date,
): LocalDateTimeParts {
	const start = getBerlinDateTimeParts(startTime);
	const end = getBerlinDateTimeParts(endTime);

	const isSameDate =
		start.year === end.year &&
		start.month === end.month &&
		start.day === end.day;

	if (!isSameDate) {
		throw new AppError(
			400,
			"Start und Ende müssen am selben Kalendertag liegen",
		);
	}

	return start;
}

function assertBerlinWeekday(dateParts: LocalDateTimeParts): void {
	const day = new Date(
		Date.UTC(dateParts.year, dateParts.month - 1, dateParts.day),
	).getUTCDay();

	if (day < WEEKDAY_START || day > WEEKDAY_END) {
		throw new AppError(400, "Zeitraum muss an einem Werktag liegen (Mo-Fr)");
	}
}

function toMinutesOfDay(dateParts: LocalDateTimeParts): number {
	return dateParts.hour * 60 + dateParts.minute;
}

function assertWithinBerlinOpeningHours(startTime: Date, endTime: Date): void {
	const startMinutes = toMinutesOfDay(getBerlinDateTimeParts(startTime));
	const endMinutes = toMinutesOfDay(getBerlinDateTimeParts(endTime));

	if (startMinutes < OPENING_MINUTES || endMinutes > CLOSING_MINUTES) {
		throw new AppError(
			400,
			"Zeitraum muss innerhalb der Öffnungszeiten liegen (Mo-Fr 08:00-22:00)",
		);
	}
}

export function assertBookableDateTimeRange(
	startTime: Date,
	endTime: Date,
): void {
	if (startTime.getTime() >= endTime.getTime()) {
		throw new AppError(400, "Startzeit muss vor Endzeit liegen");
	}

	const startDateParts = assertSameBerlinCalendarDay(startTime, endTime);

	if (startTime.getTime() <= Date.now()) {
		throw new AppError(400, "Nur zukünftige Zeiträume sind erlaubt");
	}

	assertBerlinWeekday(startDateParts);
	assertWithinBerlinOpeningHours(startTime, endTime);
}

export function getBookableBerlinDayRange(date: string): {
	date: string;
	startTime: Date;
	endTime: Date;
} {
	const dateParts = assertValidBerlinDateString(date);
	const normalizedDate = `${dateParts.year}-${String(dateParts.month).padStart(2, "0")}-${String(dateParts.day).padStart(2, "0")}`;

	if (normalizedDate < getBerlinDateString(new Date())) {
		throw new AppError(400, "date darf nicht in der Vergangenheit liegen");
	}

	assertBerlinWeekday(dateParts);

	return {
		date: normalizedDate,
		startTime: toUtcDateFromBerlinParts(dateParts),
		endTime: toUtcDateFromBerlinParts(addDays(dateParts, 1)),
	};
}
