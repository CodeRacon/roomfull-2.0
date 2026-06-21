"use client";

import { clsx } from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type MouseEvent, useEffect, useRef, useState } from "react";
import { getAdminContactRequestUnreadCount } from "@/entities/contact-request";
import { useSession } from "@/entities/session";
import { ApiRequestError } from "@/shared/api";
import type { Dictionary, Locale } from "@/shared/i18n";
import { appRoutes } from "@/shared/routing";

const adminNavigationItems = [
	{ route: appRoutes.admin, labelKey: "dashboard" },
	{ route: appRoutes.adminBookings, labelKey: "bookings" },
	{ route: appRoutes.adminUnits, labelKey: "units" },
	{ route: appRoutes.adminContactRequests, labelKey: "contactRequests" },
] as const;

let shouldScrollAdminPageTopAfterNavigation = false;

function isPlainNavigationClick(event: MouseEvent<HTMLAnchorElement>): boolean {
	return (
		!event.defaultPrevented &&
		event.button === 0 &&
		!event.metaKey &&
		!event.altKey &&
		!event.ctrlKey &&
		!event.shiftKey
	);
}

function getAppHeaderHeight(): number {
	const appHeader = document.querySelector(".app-header");

	if (!(appHeader instanceof HTMLElement)) {
		return 0;
	}

	return appHeader.getBoundingClientRect().height;
}

function scrollAdminPageStartIntoView(adminNavigation: HTMLElement): void {
	const adminPage = adminNavigation.closest("main");

	if (!(adminPage instanceof HTMLElement)) {
		return;
	}

	const headerHeight = getAppHeaderHeight();
	const nextScrollTop = Math.max(
		0,
		window.scrollY + adminPage.getBoundingClientRect().top - headerHeight,
	);
	const prefersReducedMotion = window.matchMedia(
		"(prefers-reduced-motion: reduce)",
	).matches;

	window.scrollTo({
		top: nextScrollTop,
		behavior: prefersReducedMotion ? "auto" : "smooth",
	});
}

type AdminNavigationProps = {
	copy: Dictionary["adminShell"]["navigation"];
	locale: Locale;
};

export function AdminNavigation({ copy, locale }: AdminNavigationProps) {
	const pathname = usePathname();
	const { status, user, endSession } = useSession();
	const navigationRef = useRef<HTMLElement>(null);
	const previousPathnameRef = useRef<string | null>(null);
	const [unreadContactRequestCount, setUnreadContactRequestCount] = useState(0);

	useEffect(() => {
		if (status !== "authenticated" || user?.role !== "ADMIN") {
			setUnreadContactRequestCount(0);
			return;
		}

		async function loadUnreadContactRequestCount(): Promise<void> {
			try {
				const nextUnreadContactRequestCount =
					await getAdminContactRequestUnreadCount();
				setUnreadContactRequestCount(nextUnreadContactRequestCount);
			} catch (error) {
				setUnreadContactRequestCount(0);

				if (error instanceof ApiRequestError && error.status === 401) {
					endSession();
				}
			}
		}

		void loadUnreadContactRequestCount();
	}, [status, user?.role, endSession]);

	useEffect(() => {
		const previousPathname = previousPathnameRef.current;
		previousPathnameRef.current = pathname;

		if (!shouldScrollAdminPageTopAfterNavigation || !navigationRef.current) {
			return;
		}

		if (previousPathname === pathname) {
			return;
		}

		shouldScrollAdminPageTopAfterNavigation = false;
		scrollAdminPageStartIntoView(navigationRef.current);
	}, [pathname]);

	return (
		<nav
			ref={navigationRef}
			className="mt-6 grid border-2 border-primary bg-background sm:grid-cols-4"
			aria-label={copy.ariaLabel}
		>
			{adminNavigationItems.map((item) => {
				const href = item.route(locale);
				const isActive = pathname === href;

				return (
					<Link
						key={href}
						href={href}
						aria-current={isActive ? "page" : undefined}
						onClick={(event) => {
							if (!isActive && isPlainNavigationClick(event)) {
								shouldScrollAdminPageTopAfterNavigation = true;
							}
						}}
						className={clsx(
							"group relative min-w-0 border-t-2 border-primary px-4 py-3 text-sm font-bold transition-colors first:border-t-0 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus sm:border-l-2 sm:border-t-0 sm:first:border-l-0",
							isActive
								? "bg-primary text-background"
								: "bg-background text-primary hover:bg-primary/10",
						)}
					>
						<span
							className={clsx(
								"absolute inset-x-0 top-0 h-1",
								isActive ? "bg-background" : "bg-transparent",
							)}
							aria-hidden="true"
						/>
						<span className="flex min-w-0 items-center justify-between gap-2 pt-1">
							<span className="truncate">{copy[item.labelKey]}</span>
							{item.route === appRoutes.adminContactRequests &&
							unreadContactRequestCount > 0 ? (
								<span
									className={clsx(
										"shrink-0 border px-2 py-0.5 text-xs font-black tabular-nums",
										isActive
											? "border-background text-background"
											: "border-warning-text text-warning-text",
									)}
								>
									<span className="sr-only">{copy.unreadContactRequests} </span>
									{unreadContactRequestCount > 99
										? "99+"
										: unreadContactRequestCount}
								</span>
							) : null}
						</span>
					</Link>
				);
			})}
		</nav>
	);
}
