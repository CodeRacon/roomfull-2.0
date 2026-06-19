"use client";

import type { ReactElement, ReactNode } from "react";
import { SessionProvider } from "@/entities/session";
import { PageTransitionProvider } from "./page-transition";

interface AppProvidersProps {
	children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps): ReactElement {
	return (
		<PageTransitionProvider>
			<SessionProvider>{children}</SessionProvider>
		</PageTransitionProvider>
	);
}
