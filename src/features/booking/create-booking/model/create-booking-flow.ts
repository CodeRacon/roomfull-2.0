import type {
	BookingContext,
	BookingContextUnitType,
	CreateBookingInput,
} from "@/entities/booking";
import { ApiRequestError } from "@/shared/api";
import type { Dictionary } from "@/shared/i18n";

export type BookingSelection = {
	date: string;
	startTime: string;
	endTime: string;
};

export type BookingContextView = {
	capacityCount: number;
	capacityKind: "desk" | "person";
	description: string;
	selectionMode: BookingContext["mode"];
	title: string;
	unitType: BookingContextUnitType;
};

export type BookingSummaryView = {
	date: string;
	duration: string;
	target: string;
	time: string;
};

export type CreateBookingSubmitError =
	| { type: "message"; message: string }
	| { type: "unauthorized" };

type CreateBookingSummaryCopy = Dictionary["createBooking"]["summary"];
type CreateBookingErrorCopy = Dictionary["createBooking"]["errors"];

export function getBookingContextView(input: {
	bookingContext: BookingContext;
	fallbackAreaDescription: string;
}): BookingContextView {
	if (input.bookingContext.mode === "DIRECT") {
		return {
			capacityCount: input.bookingContext.unit.capacity,
			capacityKind: "person",
			description: input.bookingContext.unit.description,
			selectionMode: "DIRECT",
			title: input.bookingContext.unit.name,
			unitType: input.bookingContext.unit.unitType,
		};
	}

	return {
		capacityCount: input.bookingContext.area.seatCount,
		capacityKind: "desk",
		description:
			input.bookingContext.area.description ?? input.fallbackAreaDescription,
		selectionMode: "AUTO_ASSIGN",
		title: input.bookingContext.area.name,
		unitType: input.bookingContext.unitType,
	};
}

export function isBookingSelectionComplete(
	selection: BookingSelection,
): boolean {
	return (
		selection.date !== "" &&
		selection.startTime !== "" &&
		selection.endTime !== ""
	);
}

export function resetBookingSelectionDate(
	selection: BookingSelection,
	date: string,
): BookingSelection {
	return {
		...selection,
		date,
		startTime: "",
		endTime: "",
	};
}

export function resetBookingSelectionStartTime(
	selection: BookingSelection,
	startTime: string,
): BookingSelection {
	return {
		...selection,
		startTime,
		endTime: "",
	};
}

export function createBookingInputFromSelection(
	bookingContext: BookingContext,
	selection: BookingSelection,
): CreateBookingInput | null {
	if (!isBookingSelectionComplete(selection)) {
		return null;
	}

	if (bookingContext.mode === "DIRECT") {
		return {
			unitId: bookingContext.unit.id,
			date: selection.date,
			startTime: selection.startTime,
			endTime: selection.endTime,
		};
	}

	return {
		areaId: bookingContext.area.id,
		unitType: "HOT_DESK",
		date: selection.date,
		startTime: selection.startTime,
		endTime: selection.endTime,
	};
}

export function buildBookingSummary(input: {
	selection: BookingSelection;
	target: string;
	copy: CreateBookingSummaryCopy;
}): BookingSummaryView | null {
	if (!isBookingSelectionComplete(input.selection)) {
		return null;
	}

	return {
		date: formatBookingSummaryDate(input.selection.date, input.copy),
		duration: formatBookingSummaryDuration(
			input.selection.startTime,
			input.selection.endTime,
			input.copy.duration,
		),
		target: input.target,
		time: formatTemplate(input.copy.timeRange, {
			start: input.selection.startTime,
			end: input.selection.endTime,
		}),
	};
}

export function resolveCreateBookingSubmitError(
	error: unknown,
	copy: CreateBookingErrorCopy,
): CreateBookingSubmitError {
	if (error instanceof ApiRequestError) {
		if (error.status === 400) {
			return { type: "message", message: copy.badRequest };
		}

		if (error.status === 401) {
			return { type: "unauthorized" };
		}

		if (error.status === 404) {
			return { type: "message", message: copy.notFound };
		}

		if (error.status === 409) {
			return { type: "message", message: copy.conflict };
		}

		return { type: "message", message: error.message };
	}

	return { type: "message", message: copy.createFallback };
}

function parseDate(date: string): Date {
	const [year, month, day] = date.split("-").map(Number);
	return new Date(Date.UTC(year, month - 1, day));
}

function parseTimeToMinutes(time: string): number {
	const [hours, minutes] = time.split(":").map(Number);
	return hours * 60 + minutes;
}

function formatTemplate(
	template: string,
	values: Record<string, string | number>,
): string {
	return Object.entries(values).reduce(
		(result, [key, value]) => result.replace(`{${key}}`, String(value)),
		template,
	);
}

function formatDuration(
	minutes: number,
	copy: CreateBookingSummaryCopy["duration"],
): string {
	const hours = Math.floor(minutes / 60);
	const remainingMinutes = minutes % 60;

	if (hours === 0) {
		return formatTemplate(copy.minutes, { count: remainingMinutes });
	}

	if (remainingMinutes === 0) {
		return formatTemplate(copy.hours, { count: hours });
	}

	return formatTemplate(copy.hoursAndMinutes, {
		hours,
		minutes: remainingMinutes,
	});
}

function formatBookingSummaryDate(
	date: string,
	copy: CreateBookingSummaryCopy,
): string {
	const bookingSummaryDateFormatter = new Intl.DateTimeFormat(copy.dateLocale, {
		timeZone: "UTC",
		weekday: "long",
		day: "2-digit",
		month: "long",
	});
	const formattedDate = bookingSummaryDateFormatter.format(parseDate(date));

	return formatTemplate(copy.date, { date: formattedDate });
}

function formatBookingSummaryDuration(
	startTime: string,
	endTime: string,
	copy: CreateBookingSummaryCopy["duration"],
): string {
	const durationMinutes =
		parseTimeToMinutes(endTime) - parseTimeToMinutes(startTime);

	if (durationMinutes <= 0) {
		return "";
	}

	return formatDuration(durationMinutes, copy);
}
