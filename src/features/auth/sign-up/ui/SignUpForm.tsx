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
		<div className="mx-auto w-full max-w-md overflow-hidden border-2 border-primary bg-background">
			<form onSubmit={handleSubmit}>
				<div className="border-b-2 border-primary! bg-primary px-5 py-5 text-on-primary">
					<h1 className="text-4xl font-black leading-none tracking-normal text-pretty">
						Registrieren
					</h1>
					<p className="mt-3 text-sm font-semibold leading-6 text-on-primary/85">
						Erstelle ein Konto, um deine Buchung fortzusetzen.
					</p>
				</div>

				{errorMessage && (
					<div className="border-b-2 border-primary! px-5 py-4">
						<FeedbackBox variant="error">{errorMessage}</FeedbackBox>
					</div>
				)}

				<div className="px-5 py-4">
					<Field label="Name" htmlFor="name" className="py-2">
						<TextInput
							id="name"
							name="name"
							autoComplete="name"
							className="border-primary!"
							value={name}
							onChange={(event) => setName(event.target.value)}
							required
						/>
					</Field>

					<Field label="E-Mail" htmlFor="email" className="py-2">
						<TextInput
							id="email"
							name="email"
							type="email"
							autoComplete="email"
							spellCheck={false}
							className="border-primary!"
							value={email}
							onChange={(event) => setEmail(event.target.value)}
							required
						/>
					</Field>

					<Field
						label="Passwort"
						htmlFor="password"
						helperText="Mindestens 8 Zeichen"
						className="py-2"
					>
						<PasswordInput
							id="password"
							name="password"
							autoComplete="new-password"
							className="border-primary!"
							value={password}
							onChange={(event) => setPassword(event.target.value)}
							minLength={8}
							required
						/>
					</Field>
				</div>

				<div className="flex flex-col gap-3 border-t-2 border-primary! px-5 py-5">
					<Button type="submit" disabled={isSubmitting}>
						{isSubmitting ? "Registrieren…" : "Registrieren"}
					</Button>
					<Anchor
						variant="secondary"
						href={loginHref}
						className="justify-center border-2 border-primary! bg-background! text-primary"
					>
						Bereits ein Konto? Einloggen
					</Anchor>
				</div>
			</form>
		</div>
	);
}
