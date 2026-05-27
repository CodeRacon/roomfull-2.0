"use client";

import {
	type ReactNode,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from "react";
import { ApiRequestError, setApiAuthTokenResolver } from "@/shared/api";
import { getCurrentSessionUser } from "../api";
import {
	clearAuthToken,
	getAuthToken,
	saveAuthToken,
} from "./auth-token-storage";
import { SessionContext } from "./session-context";
import type {
	SessionContextValue,
	SessionStatus,
	SessionUser,
	StartSessionInput,
} from "./types";

type SessionProviderProps = { children: ReactNode };

setApiAuthTokenResolver(getAuthToken);

export function SessionProvider({ children }: SessionProviderProps) {
	const [status, setStatus] = useState<SessionStatus>("anonymous");
	const [user, setUser] = useState<SessionUser | null>(null);

	const startSession = useCallback((input: StartSessionInput): void => {
		saveAuthToken(input.token);
		setUser(input.user);
		setStatus("authenticated");
	}, []);

	const endSession = useCallback((): void => {
		clearAuthToken();
		setUser(null);
		setStatus("anonymous");
	}, []);

	const value = useMemo<SessionContextValue>(
		() => ({
			status,
			user,
			startSession,
			endSession,
		}),
		[status, user, startSession, endSession],
	);

	useEffect(() => {
		async function initializeSession(): Promise<void> {
			const token = getAuthToken();

			if (!token) {
				setStatus("anonymous");
				setUser(null);
				return;
			}
			setStatus("loading");

			try {
				const currentUser = await getCurrentSessionUser(token);
				setUser(currentUser);
				setStatus("authenticated");
			} catch (error) {
				if (error instanceof ApiRequestError && error.status === 401) {
					endSession();
					return;
				}
				setUser(null);
				setStatus("anonymous");
			}
		}

		void initializeSession();
	}, [endSession]);

	return (
		<SessionContext.Provider value={value}>{children}</SessionContext.Provider>
	);
}
