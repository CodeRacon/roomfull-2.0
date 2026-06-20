"use client";

import { RequireAuth } from "@/features/auth/require-auth";
import { CreateContactRequestForm } from "@/features/contact/create-contact-request";
import { Panel } from "@/shared/ui";

export function ContactPageClient() {
	return (
		<RequireAuth allowedRoles={["CUSTOMER"]}>
			<div className="mt-8 grid gap-4 md:grid-cols-[0.75fr_1fr]">
				<Panel>
					<p className="text-sm font-medium text-muted">
						Customer Self-Service
					</p>
					<h2 className="mt-2 text-2xl font-black leading-tight">
						Fragen, Feedback und Kritik zu RoomFull.
					</h2>
					<p className="mt-4 text-sm font-semibold leading-6 text-muted">
						Teile uns kurz mit, was du brauchst. Deine Nachricht wird deinem
						Customer-Konto zugeordnet.
					</p>
				</Panel>
				<CreateContactRequestForm />
			</div>
		</RequireAuth>
	);
}
