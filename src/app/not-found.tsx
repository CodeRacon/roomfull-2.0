import { ErrorPage } from "@/shared/ui";

export default function NotFound() {
	return (
		<ErrorPage statusCode={404} title="Oops! Diese Seite existiert nicht." />
	);
}
