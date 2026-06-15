import { AdminNavigation } from "@/widgets/admin-navigation";
import { AdminUnitsPageClient } from "./AdminUnitsPageClient";

export default function AdminUnitsPage() {
	return (
		<main className="min-h-screen bg-background px-6 py-10 text-text">
			<div className="mx-auto w-full max-w-5xl">
				<h1 className="text-3xl font-semibold tracking-tight text-text">
					Unit-Inventar
				</h1>
				<p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
					Verwalte aktive und deaktivierte BookableUnits für den
					Buchungsbetrieb.
				</p>
				<AdminNavigation />
				<AdminUnitsPageClient />
			</div>
		</main>
	);
}
