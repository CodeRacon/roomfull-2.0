import { getPublicBookingOptions } from "@/entities/booking-option";
import { BookingOptionsList } from "@/widgets/booking-options-list";

export default async function BookingOptionsPage() {
	const bookingOptions = await getPublicBookingOptions();

	return (
		<main className="min-h-screen bg-background px-6 py-10 text-text">
			<div className="mx-auto w-full max-w-5xl">
				<h1 className="text-3xl font-semibold tracking-tight text-text">
					Was möchtest du buchen?
				</h1>

				<p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
					Wähle zuerst die passende Art von Platz oder Raum. Danach suchst du
					dir den konkreten Ort und die Zeit aus.
				</p>

				<BookingOptionsList bookingOptions={bookingOptions} />
			</div>
		</main>
	);
}
