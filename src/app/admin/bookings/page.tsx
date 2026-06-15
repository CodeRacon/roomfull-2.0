import { AdminNavigation } from "@/widgets/admin-navigation";
import { AdminBookingsPageClient } from "./AdminBookingsPageClient";

export default function AdminBookingsPage() {
	return (
		<main className="min-h-screen bg-background px-6 py-10 text-text">
			<div className="mx-auto w-full max-w-5xl">
				<h1 className="text-3xl font-semibold tracking-tight text-text">
					Buchungsbetrieb
				</h1>
				<p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
					Prüfe anstehende, heutige und abgeschlossene Buchungen im laufenden
					Betrieb.
				</p>
				<AdminNavigation />
				<AdminBookingsPageClient />
			</div>
		</main>
	);
}
