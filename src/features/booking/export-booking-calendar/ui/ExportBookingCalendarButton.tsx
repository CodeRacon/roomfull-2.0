"use client";

import DownloadIcs from "@public/icons/general/ic-download-ics.svg";
import type { ReactNode } from "react";
import type { MyBooking } from "@/entities/booking";
import {
	buildBookingCalendarContent,
	buildBookingCalendarFileName,
} from "../lib/ics";

type ExportBookingCalendarButtonProps = {
	ariaLabel: string;
	booking: MyBooking;
	children?: ReactNode;
	className?: string;
	iconClassName?: string;
};

export function ExportBookingCalendarButton({
	ariaLabel,
	booking,
	children,
	className,
	iconClassName,
}: ExportBookingCalendarButtonProps) {
	function handleClick(): void {
		const calendarContent = buildBookingCalendarContent(booking);
		const fileName = buildBookingCalendarFileName(booking);
		const blob = new Blob([calendarContent], {
			type: "text/calendar;charset=utf-8",
		});
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");

		link.href = url;
		link.download = fileName;
		link.click();
		URL.revokeObjectURL(url);
	}

	return (
		<button
			type="button"
			onClick={handleClick}
			className={className}
			aria-label={ariaLabel}
		>
			<DownloadIcs className={iconClassName ?? "size-4"} />
			{children}
		</button>
	);
}
