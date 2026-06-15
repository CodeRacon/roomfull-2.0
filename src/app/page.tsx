import { getPublicBookingOptions } from "@/entities/booking-option";
import { HomePageClient } from "./HomePageClient";

export default async function HomePage() {
	const bookingOptions = await getPublicBookingOptions();

	return <HomePageClient bookingOptions={bookingOptions} />;
}
