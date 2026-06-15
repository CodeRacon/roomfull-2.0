"use client";

import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";
import { type SessionUserRole, useSession } from "@/entities/session";
import { Panel } from "@/shared/ui";

type RequireAuthProps = {
	allowedRoles?: SessionUserRole[];
	children: ReactNode;
};

export function RequireAuth({
	allowedRoles,
	children,
}: RequireAuthProps): ReactNode {
	const router = useRouter();
	const pathname = usePathname();
	const { status, user } = useSession();
	const isRoleAllowed =
		!allowedRoles || (user !== null && allowedRoles.includes(user.role));

	useEffect(() => {
		if (status !== "anonymous") {
			return;
		}

		const encodedNextPath = encodeURIComponent(pathname);
		const loginPath = `/login?next=${encodedNextPath}`;

		router.replace(loginPath);
	}, [status, pathname, router]);

	useEffect(() => {
		if (status !== "authenticated" || isRoleAllowed) {
			return;
		}

		router.replace("/");
	}, [status, isRoleAllowed, router]);

	if (status === "loading") {
		return (
			<Panel className="mt-8 text-sm text-muted" padding="compact">
				Session wird geprüft...
			</Panel>
		);
	}

	if (status === "anonymous") {
		return (
			<Panel className="mt-8 text-sm text-muted" padding="compact">
				Weiterleitung zum Login...
			</Panel>
		);
	}

	if (!isRoleAllowed) {
		return (
			<Panel className="mt-8 text-sm text-muted" padding="compact">
				Weiterleitung zur Startseite...
			</Panel>
		);
	}

	return children;
}
