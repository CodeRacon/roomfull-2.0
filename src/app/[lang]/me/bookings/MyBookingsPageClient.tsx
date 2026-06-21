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
import type { Dictionary, Locale } from "@/shared/i18n";
import { appRoutes } from "@/shared/routing";
import { FeedbackBox } from "@/shared/ui";
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

type MyBookingsPageClientProps = {
	copy: Dictionary["myBookings"];
	locale: Locale;
};

export function MyBookingsPageClient({
	copy,
	locale,
}: MyBookingsPageClientProps) {
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

					setErrorMessage(copy.client.loadError);
				} else {
					setErrorMessage(copy.client.loadError);
				}
			} finally {
				setIsLoading(false);
			}
		}

		void loadBookings();
	}, [status, endSession, copy.client.loadError]);

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
			router.replace(
				`${appRoutes.myBookings(locale)}${nextQuery ? `?${nextQuery}` : ""}`,
				{
					scroll: false,
				},
			);
		}, 3500);

		return () => window.clearTimeout(timeoutId);
	}, [router, searchParamsString, shouldShowCreatedSuccess, locale]);

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
		setBookingActionSuccess(copy.client.cancelledSuccess);
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
		router.replace(
			`${appRoutes.myBookings(locale)}${nextQuery ? `?${nextQuery}` : ""}`,
			{
				scroll: false,
			},
		);
	}

	return (
		<RequireAuth>
			{isLoading && (
				<p className="mt-8 bg-primary/10 px-3 py-2 text-sm font-semibold text-muted">
					{copy.client.loading}
				</p>
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
									{copy.client.createdSuccess}
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
						copy={copy}
						highlightedBookingId={highlightedBookingId}
						locale={locale}
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
