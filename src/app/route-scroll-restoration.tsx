"use client";

import { usePathname } from "next/navigation";
import { type ReactElement, useEffect, useRef } from "react";

function hasHashTarget(): boolean {
	return window.location.hash.length > 1;
}

function scrollRouteStartIntoView(): void {
	if (hasHashTarget()) {
		return;
	}

	window.scrollTo({
		top: 0,
		left: 0,
		behavior: "auto",
	});
}

export function RouteScrollRestoration(): ReactElement | null {
	const pathname = usePathname();
	const previousPathnameRef = useRef(pathname);

	useEffect(() => {
		if (!("scrollRestoration" in window.history)) {
			return;
		}

		const previousScrollRestoration = window.history.scrollRestoration;
		window.history.scrollRestoration = "manual";

		return () => {
			window.history.scrollRestoration = previousScrollRestoration;
		};
	}, []);

	useEffect(() => {
		if (previousPathnameRef.current === pathname) {
			return;
		}

		previousPathnameRef.current = pathname;

		const frameId = window.requestAnimationFrame(scrollRouteStartIntoView);

		return () => window.cancelAnimationFrame(frameId);
	}, [pathname]);

	return null;
}
