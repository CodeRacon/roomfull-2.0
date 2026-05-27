"use client";

import type { ReactElement, ReactNode } from "react";
import { SessionProvider } from "@/entities/session";

interface AppProvidersProps {
	children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps): ReactElement {
	return <SessionProvider>{children}</SessionProvider>;
}
