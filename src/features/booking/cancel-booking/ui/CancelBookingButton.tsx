"use client";

import CancelBooking from "@public/icons/general/ic-trash.svg";
import { clsx } from "clsx";
import type { ReactNode } from "react";
import { useState } from "react";
import type { Booking } from "@/entities/booking";
import { cancelBooking } from "@/entities/booking";
import { useSession } from "@/entities/session";
import { ApiRequestError } from "@/shared/api";

type CancelBookingButtonProps = {
	ariaLabel: string;
	bookingId: string;
	children?: ReactNode;
	className?: string;
	disabled?: boolean;
	errorCopy: CancelBookingErrorCopy;
	iconClassName?: string;
	onCancelled: (booking: Booking) => void;
	onError: (message: string) => void;
	onSubmittingChange?: (isSubmitting: boolean) => void;
};

type CancelBookingErrorCopy = {
	conflict: string;
	fallback: string;
	forbidden: string;
	notFound: string;
	unauthorized: string;
};

function getCancelBookingErrorMessage(
	error: ApiRequestError,
	copy: CancelBookingErrorCopy,
): string {
	if (error.status === 401) {
		return copy.unauthorized;
	}
	if (error.status === 403) {
		return copy.forbidden;
	}
	if (error.status === 404) {
		return copy.notFound;
	}
	if (error.status === 409) {
		return copy.conflict;
	}

	return copy.fallback;
}

export function CancelBookingButton({
	ariaLabel,
	bookingId,
	children,
	className,
	disabled = false,
	errorCopy,
	iconClassName,
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

				onError(getCancelBookingErrorMessage(error, errorCopy));
				return;
			}

			onError(errorCopy.fallback);
		} finally {
			updateSubmitting(false);
		}
	}

	return (
		<button
			type="button"
			onClick={handleClick}
			disabled={disabled || isSubmitting}
			aria-label={ariaLabel}
			className={clsx(className ?? "bg-danger-bg rounded-full p-2 shadow-xs")}
		>
			<CancelBooking className={iconClassName ?? "size-4 text-danger-text"} />
			{children}
		</button>
	);
}
