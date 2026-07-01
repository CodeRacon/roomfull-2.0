"use client";

import {
	type ReactNode,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from "react";
import { ApiRequestError } from "@/shared/api";
import { endCurrentSession, getCurrentSessionUser } from "../api";
import { SessionContext } from "./session-context";
import type {
	SessionContextValue,
	SessionStatus,
	SessionUser,
	StartSessionInput,
} from "./types";

type SessionProviderProps = { children: ReactNode };

export function SessionProvider({ children }: SessionProviderProps) {
	const [status, setStatus] = useState<SessionStatus>("loading");
	const [user, setUser] = useState<SessionUser | null>(null);

	const startSession = useCallback((input: StartSessionInput): void => {
		setUser(input.user);
		setStatus("authenticated");
	}, []);

	const endSession = useCallback((): void => {
		void endCurrentSession().catch(() => undefined);
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
			setStatus("loading");

			try {
				const currentUser = await getCurrentSessionUser();
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
