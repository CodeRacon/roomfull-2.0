import { AdminContactInbox } from "@/widgets/admin-contact-inbox";
import { AdminNavigation } from "@/widgets/admin-navigation";

export default function AdminContactRequestsPage() {
	return (
		<main className="min-h-screen bg-background px-5 py-8 text-text sm:px-6 lg:py-12">
			<div className="mx-auto w-full max-w-5xl">
				<header className="border-b-2 border-primary pb-6">
					<p className="text-xs font-bold uppercase text-primary">Admin</p>
					<h1 className="mt-3 max-w-3xl text-5xl font-black leading-none text-pretty text-text sm:text-6xl">
						Contact Inbox
					</h1>
					<p className="mt-4 max-w-2xl text-base leading-7 text-muted">
						Lies eingegangene Customer-Nachrichten, filtere nach Anliegen und
						markiere bearbeitete Anfragen als gelesen.
					</p>
				</header>
				<AdminNavigation />
				<AdminContactInbox />
			</div>
		</main>
	);
}
