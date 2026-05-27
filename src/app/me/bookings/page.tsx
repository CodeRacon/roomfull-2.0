import { Suspense } from "react";
import { Panel } from "@/shared/ui";
import { MyBookingsPageClient } from "./MyBookingsPageClient";

export default function MyBookingsPage() {
	return (
		<main className="min-h-screen bg-background px-6 py-10 text-text">
			<div className="mx-auto w-full max-w-5xl">
				<h1 className="text-3xl font-semibold tracking-tight text-text">
					Meine Buchungen
				</h1>
				<Suspense
					fallback={
						<Panel className="mt-8 text-sm text-muted" padding="compact">
							Deine Buchungen werden vorbereitet...
						</Panel>
					}
				>
					<MyBookingsPageClient />
				</Suspense>
			</div>
		</main>
	);
}
