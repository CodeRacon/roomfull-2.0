import { AppError } from "../lib/app-error.js";

export const COWORKING_TIME_ZONE = "Europe/Berlin";

export type Clock = {
	now: () => Date;
};

type LocalDateTimeParts = {
	year: number;
	month: number;
	day: number;
	hour: number;
	minute: number;
	second: number;
};

const berlinDateTimeFormatter = new Intl.DateTimeFormat("en-CA", {
	timeZone: COWORKING_TIME_ZONE,
	year: "numeric",
	month: "2-digit",
	day: "2-digit",
	hour: "2-digit",
	minute: "2-digit",
	second: "2-digit",
	hourCycle: "h23",
});

function getDateTimeParts(date: Date): LocalDateTimeParts {
	const values = new Map(
		berlinDateTimeFormatter
			.formatToParts(date)
			.map((part) => [part.type, part.value]),
	);

	return {
		year: Number(values.get("year")),
		month: Number(values.get("month")),
		day: Number(values.get("day")),
		hour: Number(values.get("hour")),
		minute: Number(values.get("minute")),
		second: Number(values.get("second")),
	};
}

function formatDate(parts: Pick<LocalDateTimeParts, "year" | "month" | "day">) {
	return `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
}

function parseDate(value: string): LocalDateTimeParts {
	const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());

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

	return { year, month, day, hour: 0, minute: 0, second: 0 };
}

function parseMonth(value: string): { year: number; month: number } {
	const match = /^(\d{4})-(\d{2})$/.exec(value.trim());

	if (!match) {
		throw new AppError(400, "month muss im Format YYYY-MM sein");
	}

	const year = Number(match[1]);
	const month = Number(match[2]);

	if (month < 1 || month > 12) {
		throw new AppError(400, "month ist kein gültiger Kalendermonat");
	}

	return { year, month };
}

function addDays(parts: LocalDateTimeParts, days: number): LocalDateTimeParts {
	const date = new Date(
		Date.UTC(parts.year, parts.month - 1, parts.day + days),
	);
	return {
		...parts,
		year: date.getUTCFullYear(),
		month: date.getUTCMonth() + 1,
		day: date.getUTCDate(),
	};
}

function toUtcDate(parts: LocalDateTimeParts): Date {
	const initialUtc = Date.UTC(
		parts.year,
		parts.month - 1,
		parts.day,
		parts.hour,
		parts.minute,
		parts.second,
	);
	const actual = getDateTimeParts(new Date(initialUtc));
	const desiredLocal = Date.UTC(
		parts.year,
		parts.month - 1,
		parts.day,
		parts.hour,
		parts.minute,
		parts.second,
	);
	const actualLocal = Date.UTC(
		actual.year,
		actual.month - 1,
		actual.day,
		actual.hour,
		actual.minute,
		actual.second,
	);
	return new Date(initialUtc - (actualLocal - desiredLocal));
}

export function createCoworkingCalendar(
	clock: Clock = { now: () => new Date() },
) {
	return {
		now: (): Date => new Date(clock.now().getTime()),
		getDateString: (date: Date): string => formatDate(getDateTimeParts(date)),
		getTodayDate: (): string => formatDate(getDateTimeParts(clock.now())),
		getMinutesOfDay: (date: Date): number => {
			const parts = getDateTimeParts(date);
			return parts.hour * 60 + parts.minute;
		},
		getDayOfWeek: (date: string): number => {
			const parts = parseDate(date);
			return new Date(
				Date.UTC(parts.year, parts.month - 1, parts.day),
			).getUTCDay();
		},
		addDays: (date: string, days: number): string =>
			formatDate(addDays(parseDate(date), days)),
		getDayRange: (date: string) => {
			const parts = parseDate(date);
			return {
				date: formatDate(parts),
				startTime: toUtcDate(parts),
				endTime: toUtcDate(addDays(parts, 1)),
			};
		},
		getMonthRange: (value: string) => {
			const { year, month } = parseMonth(value);
			const normalizedMonth = `${year}-${String(month).padStart(2, "0")}`;
			const nextMonthParts = new Date(Date.UTC(year, month, 1));
			const nextMonth = `${nextMonthParts.getUTCFullYear()}-${String(
				nextMonthParts.getUTCMonth() + 1,
			).padStart(2, "0")}`;
			const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

			return {
				month: normalizedMonth,
				startTime: toUtcDate(parseDate(`${normalizedMonth}-01`)),
				endTime: toUtcDate(parseDate(`${nextMonth}-01`)),
				dates: Array.from(
					{ length: daysInMonth },
					(_, index) =>
						`${normalizedMonth}-${String(index + 1).padStart(2, "0")}`,
				),
			};
		},
		toUtcDateFromMinutes: (date: string, minutes: number): Date => {
			const parts = parseDate(date);
			return toUtcDate({
				...parts,
				hour: Math.floor(minutes / 60),
				minute: minutes % 60,
			});
		},
	};
}

export type CoworkingCalendar = ReturnType<typeof createCoworkingCalendar>;
export const coworkingCalendar = createCoworkingCalendar();
