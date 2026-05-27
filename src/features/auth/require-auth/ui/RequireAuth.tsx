"use client";

import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";
import { useSession } from "@/entities/session";
import { Panel } from "@/shared/ui";

type RequireAuthProps = { children: ReactNode };

export function RequireAuth({ children }: RequireAuthProps): ReactNode {
	const router = useRouter();
	const pathname = usePathname();
	const { status } = useSession();

	useEffect(() => {
		if (status !== "anonymous") {
			return;
		}

		const encodedNextPath = encodeURIComponent(pathname);
		const loginPath = `/login?next=${encodedNextPath}`;

		router.replace(loginPath);
	}, [status, pathname, router]);

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

	return children;
}
