"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
	type Booking,
	listMyBookings,
	type MyBooking,
} from "@/entities/booking";
import { useSession } from "@/entities/session";
import { RequireAuth } from "@/features/auth/require-auth";
import { ApiRequestError } from "@/shared/api";
import { FeedbackBox, Panel } from "@/shared/ui";
import {
	MyBookingsList,
	type MyBookingsViewMode,
} from "@/widgets/my-bookings-list";

function parseMyBookingsViewMode(value: string | null): MyBookingsViewMode {
	if (value === "list" || value === "calendar") {
		return value;
	}

	return "cards";
}

export function MyBookingsPageClient() {
	const router = useRouter();
	const { status, endSession } = useSession();
	const searchParams = useSearchParams();
	const searchParamsString = searchParams.toString();
	const shouldShowCreatedSuccess = searchParams.get("created") === "1";
	const highlightedBookingId =
		searchParams.get("highlightBookingId")?.trim() || null;
	const viewMode = parseMyBookingsViewMode(searchParams.get("view"));
	const [bookings, setBookings] = useState<MyBooking[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [bookingActionError, setBookingActionError] = useState<string | null>(
		null,
	);
	const [bookingActionSuccess, setBookingActionSuccess] = useState<
		string | null
	>(null);
	const [isBookingActionSuccessVisible, setIsBookingActionSuccessVisible] =
		useState(false);
	const [hasBookingActionSuccessSlot, setHasBookingActionSuccessSlot] =
		useState(false);
	const [isCreatedSuccessVisible, setIsCreatedSuccessVisible] = useState(
		shouldShowCreatedSuccess,
	);
	const [hasCreatedSuccessSlot, setHasCreatedSuccessSlot] = useState(
		shouldShowCreatedSuccess,
	);

	useEffect(() => {
		if (status !== "authenticated") {
			return;
		}

		async function loadBookings(): Promise<void> {
			try {
				setIsLoading(true);
				setErrorMessage(null);
				const myBookings = await listMyBookings();
				setBookings(myBookings);
			} catch (error) {
				if (error instanceof ApiRequestError) {
					if (error.status === 401) {
						endSession();
						return;
					}

					setErrorMessage(error.message);
				} else {
					setErrorMessage("Deine Buchungen konnten nicht geladen werden.");
				}
			} finally {
				setIsLoading(false);
			}
		}

		void loadBookings();
	}, [status, endSession]);

	useEffect(() => {
		if (!shouldShowCreatedSuccess) {
			return;
		}

		setHasCreatedSuccessSlot(true);
		setIsCreatedSuccessVisible(true);

		const timeoutId = window.setTimeout(() => {
			setIsCreatedSuccessVisible(false);
			const nextParams = new URLSearchParams(searchParamsString);
			nextParams.delete("created");
			const nextQuery = nextParams.toString();
			router.replace(`/me/bookings${nextQuery ? `?${nextQuery}` : ""}`, {
				scroll: false,
			});
		}, 3500);

		return () => window.clearTimeout(timeoutId);
	}, [router, searchParamsString, shouldShowCreatedSuccess]);

	useEffect(() => {
		if (!bookingActionSuccess) {
			return;
		}

		setHasBookingActionSuccessSlot(true);
		setIsBookingActionSuccessVisible(true);

		const timeoutId = window.setTimeout(() => {
			setIsBookingActionSuccessVisible(false);
		}, 3500);

		return () => window.clearTimeout(timeoutId);
	}, [bookingActionSuccess]);

	function handleBookingCancelled(cancelledBooking: Booking): void {
		setBookingActionError(null);
		setBookingActionSuccess("Buchung wurde storniert.");
		setBookings((currentBookings) =>
			currentBookings.map((booking) =>
				booking.id === cancelledBooking.id
					? {
							...booking,
							endTime: cancelledBooking.endTime,
							startTime: cancelledBooking.startTime,
							status: cancelledBooking.status,
							updatedAt: cancelledBooking.updatedAt,
						}
					: booking,
			),
		);
	}

	function handleViewModeChange(nextViewMode: MyBookingsViewMode): void {
		const nextParams = new URLSearchParams(searchParamsString);

		if (nextViewMode === "cards") {
			nextParams.delete("view");
		} else {
			nextParams.set("view", nextViewMode);
		}

		const nextQuery = nextParams.toString();
		router.replace(`/me/bookings${nextQuery ? `?${nextQuery}` : ""}`, {
			scroll: false,
		});
	}

	return (
		<RequireAuth>
			{isLoading && (
				<Panel className="mt-8">Deine Buchungen werden geladen...</Panel>
			)}
			{errorMessage && (
				<FeedbackBox variant="error" className="mt-8">
					{errorMessage}
				</FeedbackBox>
			)}
			{!isLoading && !errorMessage && (
				<>
					{hasCreatedSuccessSlot && (
						<div className="mt-8 min-h-9">
							{isCreatedSuccessVisible && (
								<FeedbackBox variant="success" className="w-fit!">
									Buchung wurde erstellt
								</FeedbackBox>
							)}
						</div>
					)}
					{bookingActionError && (
						<FeedbackBox variant="error" className="mt-8">
							{bookingActionError}
						</FeedbackBox>
					)}
					{hasBookingActionSuccessSlot && (
						<div className="mt-8 min-h-9">
							{isBookingActionSuccessVisible && bookingActionSuccess && (
								<FeedbackBox variant="success" className="w-fit!">
									{bookingActionSuccess}
								</FeedbackBox>
							)}
						</div>
					)}
					<MyBookingsList
						bookings={bookings}
						highlightedBookingId={highlightedBookingId}
						onViewModeChange={handleViewModeChange}
						onBookingCancelled={handleBookingCancelled}
						onBookingCancelError={(message) => {
							setBookingActionSuccess(null);
							setBookingActionError(message);
						}}
						viewMode={viewMode}
					/>
				</>
			)}
		</RequireAuth>
	);
}
