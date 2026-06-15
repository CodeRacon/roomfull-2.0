import { AccountPageClient } from "./AccountPageClient";

export default function AccountPage() {
	return (
		<main className="min-h-screen bg-background px-6 py-10 text-text">
			<div className="mx-auto w-full max-w-5xl">
				<h1 className="text-3xl font-semibold tracking-tight text-text">
					Mein Account
				</h1>
				<AccountPageClient />
			</div>
		</main>
	);
}
