"use client";

import CancelBooking from "@public/icons/general/ic-trash.svg";
import { clsx } from "clsx";
import { useState } from "react";
import type { Booking } from "@/entities/booking";
import { cancelBooking } from "@/entities/booking";
import { useSession } from "@/entities/session";
import { ApiRequestError } from "@/shared/api";

type CancelBookingButtonProps = {
	bookingId: string;
	className?: string;
	disabled?: boolean;
	onCancelled: (booking: Booking) => void;
	onError: (message: string) => void;
	onSubmittingChange?: (isSubmitting: boolean) => void;
};

function getCancelBookingErrorMessage(error: ApiRequestError): string {
	if (error.status === 401) {
		return "Bitte melde dich erneut an.";
	}
	if (error.status === 403) {
		return "Du darfst diese Buchung nicht stornieren.";
	}
	if (error.status === 404) {
		return "Diese Buchung wurde nicht gefunden.";
	}
	if (error.status === 409) {
		return "Diese Buchung kann nicht mehr storniert werden.";
	}

	return error.message;
}

export function CancelBookingButton({
	bookingId,
	className,
	disabled = false,
	onCancelled,
	onError,
	onSubmittingChange,
}: CancelBookingButtonProps) {
	const { endSession } = useSession();
	const [isSubmitting, setIsSubmitting] = useState(false);

	function updateSubmitting(nextIsSubmitting: boolean): void {
		setIsSubmitting(nextIsSubmitting);
		onSubmittingChange?.(nextIsSubmitting);
	}

	async function handleClick(): Promise<void> {
		if (isSubmitting) {
			return;
		}

		try {
			updateSubmitting(true);
			const cancelledBooking = await cancelBooking(bookingId);
			onCancelled(cancelledBooking);
		} catch (error) {
			if (error instanceof ApiRequestError) {
				if (error.status === 401) {
					endSession();
				}

				onError(getCancelBookingErrorMessage(error));
				return;
			}

			onError("Buchung konnte nicht storniert werden.");
		} finally {
			updateSubmitting(false);
		}
	}

	return (
		<button
			type="button"
			onClick={handleClick}
			disabled={disabled || isSubmitting}
			aria-label="Buchung stornieren"
			className={clsx("bg-danger-bg rounded-full p-2 shadow-xs", className)}
		>
			<CancelBooking className="size-4 text-danger-text" />
		</button>
	);
}
