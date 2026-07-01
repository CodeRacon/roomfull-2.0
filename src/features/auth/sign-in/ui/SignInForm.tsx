"use client";

import { useRouter } from "next/navigation";
import { type ComponentPropsWithoutRef, useState } from "react";
import { useSession } from "@/entities/session";
import { ApiRequestError } from "@/shared/api";
import type { Dictionary, Locale } from "@/shared/i18n";
import { appRoutes, getSafeLocalizedNextPath } from "@/shared/routing";
import {
	Anchor,
	Button,
	FeedbackBox,
	Field,
	PasswordInput,
	TextInput,
} from "@/shared/ui";
import { signIn } from "../api";

type SignInFormProps = {
	copy: Dictionary["auth"]["signIn"];
	locale: Locale;
	nextPath: string;
};

type FormSubmitHandler = NonNullable<
	ComponentPropsWithoutRef<"form">["onSubmit"]
>;

export function SignInForm({ copy, locale, nextPath }: SignInFormProps) {
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
			const homePath = appRoutes.home(locale);
			const safeNextPath = getSafeLocalizedNextPath(nextPath, locale, homePath);
			router.replace(
				authResponse.user.role === "ADMIN" && safeNextPath === homePath
					? appRoutes.admin(locale)
					: safeNextPath,
			);
		} catch (error) {
			if (error instanceof ApiRequestError) {
				setErrorMessage(error.message);
			} else {
				setErrorMessage(copy.errorFallback);
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	const registerHref = appRoutes.register(locale, nextPath);

	return (
		<div className="mx-auto w-full max-w-md overflow-hidden border-2 border-primary bg-background">
			<form onSubmit={handleSubmit}>
				<div className="border-b-2 border-primary! bg-primary px-5 py-5 text-on-primary">
					<h1 className="text-4xl font-black leading-none tracking-normal text-pretty">
						{copy.title}
					</h1>
					<p className="mt-3 text-sm font-semibold leading-6 text-on-primary/85">
						{copy.intro}
					</p>
				</div>

				{errorMessage && (
					<div className="border-b-2 border-primary! px-5 py-4">
						<FeedbackBox variant="error">{errorMessage}</FeedbackBox>
					</div>
				)}

				<div className="px-5 py-4">
					<Field label={copy.emailLabel} htmlFor="email" className="py-2">
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

					<Field label={copy.passwordLabel} htmlFor="password" className="py-2">
						<PasswordInput
							id="password"
							name="password"
							autoComplete="current-password"
							className="border-primary!"
							value={password}
							onChange={(event) => setPassword(event.target.value)}
							required
						/>
					</Field>
				</div>

				<div className="flex flex-col gap-3 border-t-2 border-primary! px-5 py-5">
					<Button type="submit" disabled={isSubmitting}>
						{isSubmitting ? copy.submitPending : copy.submit}
					</Button>
					<Anchor
						variant="secondary"
						href={registerHref}
						className="justify-center border-2 border-primary! bg-background! text-primary hover:bg-primary!"
					>
						{copy.registerLink}
					</Anchor>
				</div>
			</form>
		</div>
	);
}
