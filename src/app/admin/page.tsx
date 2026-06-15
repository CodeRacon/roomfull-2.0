import { AdminNavigation } from "@/widgets/admin-navigation";
import { AdminDashboardPageClient } from "./AdminDashboardPageClient";

export default function AdminPage() {
	return (
		<main className="min-h-screen bg-background px-6 py-10 text-text">
			<div className="mx-auto w-full max-w-5xl">
				<h1 className="text-3xl font-semibold tracking-tight text-text">
					Admin Dashboard
				</h1>
				<p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
					Steuere den Buchungsbetrieb und verwalte das buchbare Inventar.
				</p>
				<AdminNavigation />
				<AdminDashboardPageClient />
			</div>
		</main>
	);
}
