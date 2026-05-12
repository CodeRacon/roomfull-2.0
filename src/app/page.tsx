import { getPublicBookingOptions } from "@/entities/booking-option";
import { BookingOptionsList } from "@/widgets/booking-options-list";

export default async function HomePage() {
	const bookingOptions = await getPublicBookingOptions();

	return (
		<main className="min-h-screen bg-background px-6 py-10 text-text">
			<div className="mx-auto w-full max-w-5xl">
				<h1 className="text-3xl font-semibold tracking-tight text-text">
					Willkommen bei RoomFull 2.0
				</h1>

				<p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
					Wähle, was du buchen möchtest: Hot Desk, Booth, Team Room oder Meeting
					Room.
				</p>

				<BookingOptionsList bookingOptions={bookingOptions} />
			</div>
		</main>
	);
}
