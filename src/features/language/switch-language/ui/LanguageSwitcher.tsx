"use client";

import { clsx } from "clsx";
import { useRouter } from "next/navigation";
import { type Locale, locales } from "@/shared/i18n";
import { switchLocalePath } from "@/shared/routing";
import { setLocaleCookie } from "../lib/locale-cookie";

type LanguageSwitcherProps = {
	activeLocale: Locale;
	ariaLabel?: string;
	className?: string;
	labels?: Partial<Record<Locale, string>>;
};

const defaultLabels = {
	de: "DE",
	en: "EN",
} satisfies Record<Locale, string>;

export function LanguageSwitcher({
	activeLocale,
	ariaLabel = "Language",
	className,
	labels = defaultLabels,
}: LanguageSwitcherProps) {
	const router = useRouter();

	function switchLanguage(nextLocale: Locale): void {
		const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
		const nextPath = switchLocalePath(nextLocale, currentPath);

		setLocaleCookie(nextLocale);
		router.push(nextPath);
	}

	return (
		<fieldset
			aria-label={ariaLabel}
			className={clsx(
				"m-0 inline-flex items-center border-2 border-primary bg-background p-0 text-xs font-black text-primary",
				className,
			)}
		>
			{locales.map((locale) => {
				const isActive = locale === activeLocale;

				return (
					<button
						key={locale}
						type="button"
						aria-pressed={isActive}
						className={clsx(
							"min-h-9 px-3 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
							isActive
								? "bg-primary text-on-primary"
								: "bg-background text-primary hover:bg-primary hover:text-on-primary",
						)}
						onClick={() => switchLanguage(locale)}
					>
						{labels[locale] ?? defaultLabels[locale]}
					</button>
				);
			})}
		</fieldset>
	);
}
