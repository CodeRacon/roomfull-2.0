import Link from "next/link";
import type { ReactElement } from "react";
import type { Dictionary, Locale } from "@/shared/i18n";
import { appRoutes } from "@/shared/routing";

type FooterProps = {
	copy: Dictionary["navigation"];
	locale: Locale;
};

export function Footer({ copy, locale }: FooterProps): ReactElement {
	const linkClass =
		"font-semibold text-muted transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";

	return (
		<footer className="h-[var(--app-footer-height)] border-border border-t bg-background px-4 text-sm md:px-6">
			<nav
				aria-label={copy.legalAndHelp}
				className="mx-auto flex h-full w-full max-w-7xl items-center justify-end gap-5"
			>
				<Link href={appRoutes.faq(locale)} className={linkClass}>
					{copy.faq}
				</Link>
				<Link href={appRoutes.privacy(locale)} className={linkClass}>
					{copy.privacy}
				</Link>
			</nav>
		</footer>
	);
}
