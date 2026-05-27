"use client";

import { useRouter } from "next/navigation";
import { type ComponentPropsWithoutRef, useState } from "react";
import { useSession } from "@/entities/session";
import { ApiRequestError } from "@/shared/api";
import { getSafeNextPath } from "@/shared/lib";
import {
	Anchor,
	Button,
	FeedbackBox,
	Field,
	Panel,
	PasswordInput,
	TextInput,
} from "@/shared/ui";
import { signIn } from "../api";

type SignInFormProps = {
	nextPath: string;
};

type FormSubmitHandler = NonNullable<
	ComponentPropsWithoutRef<"form">["onSubmit"]
>;

export function SignInForm({ nextPath }: SignInFormProps) {
	const router = useRouter();

	const { startSession } = useSession();

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit: FormSubmitHandler = async (event) => {
		event.preventDefault();
		setErrorMessage(null);
		setIsSubmitting(true);

		try {
			const authResponse = await signIn({ email, password });
			startSession(authResponse);
			router.replace(getSafeNextPath(nextPath));
		} catch (error) {
			if (error instanceof ApiRequestError) {
				setErrorMessage(error.message);
			} else {
				setErrorMessage("Login ist fehlgeschlagen. Bitte versuche es erneut.");
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	const registerHref = `/register?next=${encodeURIComponent(nextPath)}`;

	return (
		<Panel className="mx-auto w-full max-w-md">
			<form onSubmit={handleSubmit} className="space-y-2">
				<div className="px-4 pb-2">
					<h1 className="text-2xl font-semibold tracking-tight">Einloggen</h1>
					<p className="mt-2 text-sm leading-6 text-muted">
						Melde dich an, um mit deiner Buchung fortzufahren.
					</p>
				</div>

				{errorMessage && (
					<FeedbackBox variant="error" className="w-fit! mx-4 ml-auto">
						{errorMessage}
					</FeedbackBox>
				)}

				<Field label="E-Mail" htmlFor="email">
					<TextInput
						id="email"
						name="email"
						type="email"
						autoComplete="email"
						value={email}
						onChange={(event) => setEmail(event.target.value)}
						required
					/>
				</Field>

				<Field label="Passwort" htmlFor="password">
					<PasswordInput
						id="password"
						name="password"
						autoComplete="current-password"
						value={password}
						onChange={(event) => setPassword(event.target.value)}
						required
					/>
				</Field>

				<div className="flex flex-col gap-3 px-4 pt-2">
					<Button type="submit" disabled={isSubmitting}>
						{isSubmitting ? "Einloggen..." : "Einloggen"}
					</Button>
					<Anchor variant="secondary" href={registerHref}>
						Noch kein Konto? Registrieren
					</Anchor>
				</div>
			</form>
		</Panel>
	);
}
