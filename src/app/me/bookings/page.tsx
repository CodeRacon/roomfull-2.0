import { Suspense } from "react";
import { MyBookingsPageClient } from "./MyBookingsPageClient";

export default function MyBookingsPage() {
	return (
		<main className="min-h-[calc(100svh-4.5rem)] bg-background px-4 py-6 text-text md:px-6">
			<div className="mx-auto w-full max-w-7xl">
				<h1 className="type-display-page max-w-4xl">Meine Buchungen</h1>
				<p className="type-body-lead mt-5 max-w-2xl text-muted">
					Behalte deine kommenden Termine, Kalender-Downloads und Stornierungen
					an einem Ort im Blick.
				</p>
				<Suspense
					fallback={
						<p className="mt-8 bg-primary/10 px-3 py-2 text-sm font-semibold text-muted">
							Deine Buchungen werden vorbereitet…
						</p>
					}
				>
					<MyBookingsPageClient />
				</Suspense>
			</div>
		</main>
	);
}
