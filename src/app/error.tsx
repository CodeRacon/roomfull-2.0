"use client";

import { LocalizedErrorPage } from "./LocalizedErrorPage";

type ErrorProps = {
	error: Error & { digest?: string };
	reset: () => void;
};

export default function AppError({ error }: ErrorProps) {
	console.error(error);

	return <LocalizedErrorPage kind="internal" />;
}
