"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type {
	BookingContext,
	GetBookingContextInput,
} from "@/entities/booking";
import { getBookingContext } from "@/entities/booking";
import { useSession } from "@/entities/session";
import { ApiRequestError } from "@/shared/api";
import type { Dictionary, Locale } from "@/shared/i18n";
import { FeedbackBox, Panel } from "@/shared/ui";
import { CreateBookingForm } from "./CreateBookingForm";

type CreateBookingContextGateProps = {
	copy: Dictionary["createBooking"];
	locale: Locale;
};

function parseBookingContextInput(
	searchParams: URLSearchParams,
): GetBookingContextInput | null {
	const unitId = searchParams.get("unitId")?.trim() ?? "";
	const unitType = searchParams.get("unitType")?.trim() ?? "";
	const areaId = searchParams.get("areaId")?.trim() ?? "";

	if (unitId.length > 0 && unitType === "" && areaId === "") {
		return { unitId };
	}

	if (unitType === "HOT_DESK" && areaId.length > 0 && unitId === "") {
		return { unitType: "HOT_DESK", areaId };
	}

	return null;
}

export function CreateBookingContextGate({
	copy,
	locale,
}: CreateBookingContextGateProps) {
	const searchParams = useSearchParams();
	const { status, endSession } = useSession();
	const searchParamsString = searchParams.toString();
	const bookingContextInput = useMemo(
		() => parseBookingContextInput(new URLSearchParams(searchParamsString)),
		[searchParamsString],
	);

	const [bookingContext, setBookingContext] = useState<BookingContext | null>(
		null,
	);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		if (bookingContextInput === null || status !== "authenticated") {
			return;
		}

		const input = bookingContextInput;

		async function loadBookingContext(): Promise<void> {
			try {
				setIsLoading(true);
				setErrorMessage(null);
				const context = await getBookingContext(input, locale);

				setBookingContext(context);
			} catch (error) {
				if (error instanceof ApiRequestError) {
					if (error.status === 401) {
						endSession();
						return;
					}

					if (error.status === 400) {
						setErrorMessage(copy.gate.invalidContext);
						return;
					}

					if (error.status === 404) {
						setErrorMessage(copy.gate.contextUnavailable);
						return;
					}

					setErrorMessage(copy.gate.contextError);
				} else {
					setErrorMessage(copy.gate.unknownError);
				}
			} finally {
				setIsLoading(false);
			}
		}

		void loadBookingContext();
	}, [
		status,
		endSession,
		bookingContextInput,
		locale,
		copy.gate.unknownError,
		copy.gate.invalidContext,
		copy.gate.contextUnavailable,
		copy.gate.contextError,
	]);

	if (bookingContextInput === null) {
		return (
			<FeedbackBox variant="error" className="mt-8">
				{copy.gate.invalidContext}
			</FeedbackBox>
		);
	}

	if (isLoading) {
		return <Panel className="mt-8">{copy.gate.loadingContext}</Panel>;
	}

	if (errorMessage) {
		return (
			<FeedbackBox variant="error" className="mt-8">
				{errorMessage}
			</FeedbackBox>
		);
	}

	if (bookingContext === null) {
		return <Panel className="mt-8">{copy.gate.preparingContext}</Panel>;
	}

	return (
		<CreateBookingForm
			bookingContext={bookingContext}
			copy={copy}
			locale={locale}
		/>
	);
}
