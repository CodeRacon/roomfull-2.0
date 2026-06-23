"use client";

import { RequireAuth } from "@/features/auth/require-auth";
import { CreateContactRequestForm } from "@/features/contact/create-contact-request";
import type { Dictionary } from "@/shared/i18n";
import { Panel } from "@/shared/ui";

type ContactPageClientProps = {
	copy: Dictionary["contact"];
};

export function ContactPageClient({ copy }: ContactPageClientProps) {
	return (
		<RequireAuth allowedRoles={["CUSTOMER"]}>
			<div className="mt-8 grid gap-4 md:grid-cols-[0.75fr_1fr]">
				<Panel className="border-primary!">
					<p className="text-sm font-medium text-muted">{copy.intro.eyebrow}</p>
					<h2 className="mt-2 text-2xl font-black leading-tight">
						{copy.intro.title}
					</h2>
					<p className="mt-4 text-sm font-semibold leading-6 text-muted">
						{copy.intro.description}
					</p>
				</Panel>
				<CreateContactRequestForm copy={copy.form} />
			</div>
		</RequireAuth>
	);
}
