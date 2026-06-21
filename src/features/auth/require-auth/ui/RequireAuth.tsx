"use client";

import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";
import { type SessionUserRole, useSession } from "@/entities/session";
import { defaultLocale, parseLocale } from "@/shared/i18n";
import { appRoutes } from "@/shared/routing";
import { Panel } from "@/shared/ui";

type RequireAuthProps = {
	allowedRoles?: SessionUserRole[];
	children: ReactNode;
};

const statusCopy = {
	de: {
		checkingSession: "Session wird geprüft...",
		redirectingToLogin: "Weiterleitung zum Login...",
		redirectingHome: "Weiterleitung zur Startseite...",
	},
	en: {
		checkingSession: "Checking session...",
		redirectingToLogin: "Redirecting to sign-in...",
		redirectingHome: "Redirecting home...",
	},
} as const;

export function RequireAuth({
	allowedRoles,
	children,
}: RequireAuthProps): ReactNode {
	const router = useRouter();
	const pathname = usePathname();
	const { status, user } = useSession();
	const locale = parseLocale(pathname.split("/")[1]) ?? defaultLocale;
	const copy = statusCopy[locale];
	const isRoleAllowed =
		!allowedRoles || (user !== null && allowedRoles.includes(user.role));

	useEffect(() => {
		if (status !== "anonymous") {
			return;
		}

		const nextPath = `${pathname}${window.location.search}`;
		const loginPath = appRoutes.login(locale, nextPath);

		router.replace(loginPath);
	}, [status, pathname, locale, router]);

	useEffect(() => {
		if (status !== "authenticated" || isRoleAllowed) {
			return;
		}

		router.replace(appRoutes.home(locale));
	}, [status, isRoleAllowed, locale, router]);

	if (status === "loading") {
		return (
			<Panel className="mt-8 text-sm text-muted" padding="compact">
				{copy.checkingSession}
			</Panel>
		);
	}

	if (status === "anonymous") {
		return (
			<Panel className="mt-8 text-sm text-muted" padding="compact">
				{copy.redirectingToLogin}
			</Panel>
		);
	}

	if (!isRoleAllowed) {
		return (
			<Panel className="mt-8 text-sm text-muted" padding="compact">
				{copy.redirectingHome}
			</Panel>
		);
	}

	return children;
}
