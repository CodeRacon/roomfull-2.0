import { useContext } from "react";
import { SessionContext } from "./session-context";
import type { SessionContextValue } from "./types";

export function useSession(): SessionContextValue {
	const session = useContext(SessionContext);

	if (session === null) {
		throw new Error("useSession must be used within SessionProvider");
	}
	return session;
}
