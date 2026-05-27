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
import { signUp } from "../api";

type SignUpFormProps = {
	nextPath: string;
};

type FormSubmitHandler = NonNullable<
	ComponentPropsWithoutRef<"form">["onSubmit"]
>;

export function SignUpForm({ nextPath }: SignUpFormProps) {
	const router = useRouter();

	const { startSession } = useSession();

	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit: FormSubmitHandler = async (event) => {
		event.preventDefault();
		setErrorMessage(null);
		setIsSubmitting(true);

		try {
			const authResponse = await signUp({ name, email, password });
			startSession(authResponse);
			router.replace(getSafeNextPath(nextPath));
		} catch (error) {
			if (error instanceof ApiRequestError) {
				setErrorMessage(error.message);
			} else {
				setErrorMessage(
					"Registrierung ist fehlgeschlagen. Bitte versuche es erneut.",
				);
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	const loginHref = `/login?next=${encodeURIComponent(nextPath)}`;

	return (
		<Panel className="mx-auto w-full max-w-md">
			<form onSubmit={handleSubmit} className="space-y-2">
				<div className="px-4 pb-2">
					<h1 className="text-2xl font-semibold tracking-tight">
						Registrieren
					</h1>
					<p className="mt-2 text-sm leading-6 text-muted">
						Erstelle ein Konto, um deine Buchung fortzusetzen.
					</p>
				</div>

				{errorMessage && (
					<FeedbackBox variant="error" className="mx-4">
						{errorMessage}
					</FeedbackBox>
				)}

				<Field label="Name" htmlFor="name">
					<TextInput
						id="name"
						name="name"
						autoComplete="name"
						value={name}
						onChange={(event) => setName(event.target.value)}
						required
					/>
				</Field>

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

				<Field
					label="Passwort"
					htmlFor="password"
					helperText="Mindestens 8 Zeichen"
				>
					<PasswordInput
						id="password"
						name="password"
						autoComplete="new-password"
						value={password}
						onChange={(event) => setPassword(event.target.value)}
						minLength={8}
						required
					/>
				</Field>

				<div className="flex flex-col gap-3 px-4 pt-2">
					<Button type="submit" disabled={isSubmitting}>
						{isSubmitting ? "Registrieren..." : "Registrieren"}
					</Button>
					<Anchor variant="secondary" href={loginHref}>
						Bereits ein Konto? Einloggen
					</Anchor>
				</div>
			</form>
		</Panel>
	);
}
