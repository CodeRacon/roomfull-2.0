"use client";

import Link from "next/link";
import { RequireAuth } from "@/features/auth/require-auth";
import { Panel } from "@/shared/ui";

const dashboardLinks = [
	{
		href: "/admin/bookings",
		label: "Buchungsbetrieb",
		description:
			"Anstehende, heutige, abgeschlossene und stornierte Buchungen prüfen.",
	},
	{
		href: "/admin/units",
		label: "Unit-Inventar",
		description:
			"BookableUnits anlegen, bearbeiten, deaktivieren und reaktivieren.",
	},
];

export function AdminDashboardPageClient() {
	return (
		<RequireAuth allowedRoles={["ADMIN"]}>
			<div className="mt-8 grid gap-4 md:grid-cols-2">
				{dashboardLinks.map((dashboardLink) => (
					<Link
						key={dashboardLink.href}
						href={dashboardLink.href}
						className="block rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
					>
						<Panel className="h-full transition-colors hover:bg-surface-muted">
							<h2 className="text-lg font-semibold text-text">
								{dashboardLink.label}
							</h2>
							<p className="mt-2 text-sm leading-6 text-muted">
								{dashboardLink.description}
							</p>
						</Panel>
					</Link>
				))}
			</div>
		</RequireAuth>
	);
}
