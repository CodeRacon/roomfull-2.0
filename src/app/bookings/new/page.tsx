import { Suspense } from "react";
import { RequireAuth } from "@/features/auth/require-auth";
import { CreateBookingContextGate } from "@/features/booking/create-booking";

export default function CreateBookingPage() {
	return (
		<main className="min-h-[calc(100svh-4.5rem)] bg-background px-4 py-6 text-text md:px-6">
			<div className="mx-auto w-full max-w-7xl">
				<h1 className="type-display-page max-w-4xl">Buchung erstellen</h1>
				<p className="type-body-lead mt-5 max-w-2xl text-muted">
					Lege Datum und Uhrzeit für deine konkrete BookableUnit fest.
				</p>
				<RequireAuth>
					<Suspense
						fallback={
							<p className="mt-8 bg-primary/10 px-3 py-2 text-sm font-semibold text-muted">
								Booking Context wird geladen…
							</p>
						}
					>
						<CreateBookingContextGate />
					</Suspense>
				</RequireAuth>
			</div>
		</main>
	);
}
