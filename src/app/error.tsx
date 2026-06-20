"use client";

import { ErrorPage } from "@/shared/ui";

type ErrorProps = {
	error: Error & { digest?: string };
	reset: () => void;
};

export default function AppError({ error }: ErrorProps) {
	console.error(error);

	return (
		<ErrorPage
			statusCode={500}
			title="Oops! Diese Seite ist gerade nicht erreichbar."
		/>
	);
}
