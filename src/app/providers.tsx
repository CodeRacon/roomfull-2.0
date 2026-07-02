"use client";

import type { ReactElement, ReactNode } from "react";
import { SessionProvider } from "@/entities/session";
import { PageTransitionProvider } from "./page-transition";
import { RouteScrollRestoration } from "./route-scroll-restoration";

interface AppProvidersProps {
	children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps): ReactElement {
	return (
		<PageTransitionProvider>
			<RouteScrollRestoration />
			<SessionProvider>{children}</SessionProvider>
		</PageTransitionProvider>
	);
}
