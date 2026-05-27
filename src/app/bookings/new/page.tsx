import { Suspense } from "react";
import { RequireAuth } from "@/features/auth/require-auth";
import { CreateBookingContextGate } from "@/features/booking/create-booking";

export default function CreateBookingPage() {
	return (
		<main className="min-h-screen bg-background px-6 py-10 text-text">
			<div className="mx-auto w-full max-w-5xl">
				<h1 className="text-3xl font-semibold tracking-tight text-text">
					Buchung erstellen
				</h1>
				<RequireAuth>
					<Suspense
						fallback={
							<p className="mt-8 text-sm text-muted">
								Booking Context wird geladen...
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
