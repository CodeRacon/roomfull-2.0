import Link from "next/link";
import type { ReactElement } from "react";

export function Footer(): ReactElement {
	const linkClass =
		"font-semibold text-muted transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";

	return (
		<footer className="h-[var(--app-footer-height)] border-border border-t bg-background px-4 text-sm md:px-6">
			<nav
				aria-label="Rechtliches und Hilfe"
				className="mx-auto flex h-full w-full max-w-7xl items-center justify-end gap-5"
			>
				<Link href="/faq" className={linkClass}>
					FAQ
				</Link>
				<Link href="/privacy" className={linkClass}>
					Datenschutz
				</Link>
			</nav>
		</footer>
	);
}
