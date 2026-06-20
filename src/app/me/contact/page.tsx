import { ContactPageClient } from "./ContactPageClient";

export default function ContactPage() {
	return (
		<main className="min-h-screen bg-background px-6 py-10 text-text">
			<div className="mx-auto w-full max-w-5xl">
				<h1 className="type-section-title text-text">Kontakt</h1>
				<ContactPageClient />
			</div>
		</main>
	);
}
