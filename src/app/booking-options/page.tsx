import { getPublicBookingOptions } from "@/entities/booking-option";
import { BookingOptionsList } from "@/widgets/booking-options-list";

export default async function BookingOptionsPage() {
	const bookingOptions = await getPublicBookingOptions();

	return (
		<main className="min-h-[calc(100svh-4.5rem)] bg-background px-4 py-6 text-text md:px-6">
			<div className="mx-auto w-full max-w-7xl">
				<h1 className="type-display-page max-w-4xl">
					Wähle deinen Arbeitsmodus
				</h1>

				<p className="type-body-lead mt-5 max-w-2xl text-muted">
					Vergleiche die öffentlichen BookingOptions und öffne danach die
					passende Detailauswahl für konkrete Areas oder BookableUnits.
				</p>

				<BookingOptionsList bookingOptions={bookingOptions} />
			</div>
		</main>
	);
}
