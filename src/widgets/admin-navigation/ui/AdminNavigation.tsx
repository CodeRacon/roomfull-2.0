"use client";

import { clsx } from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";

const adminNavigationItems = [
	{ href: "/admin", label: "Dashboard" },
	{ href: "/admin/bookings", label: "Buchungsbetrieb" },
	{ href: "/admin/units", label: "Unit-Inventar" },
];

export function AdminNavigation() {
	const pathname = usePathname();

	return (
		<nav className="mt-8 flex flex-wrap gap-2" aria-label="Admin Navigation">
			{adminNavigationItems.map((item) => {
				const isActive = pathname === item.href;

				return (
					<Link
						key={item.href}
						href={item.href}
						aria-current={isActive ? "page" : undefined}
						className={clsx(
							"rounded-md border px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
							isActive
								? "border-primary bg-primary text-white"
								: "border-border bg-surface text-primary hover:bg-surface-muted",
						)}
					>
						{item.label}
					</Link>
				);
			})}
		</nav>
	);
}
