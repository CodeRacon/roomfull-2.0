"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSession } from "@/entities/session";
import { ApiRequestError } from "@/shared/api";
import type { Dictionary, Locale } from "@/shared/i18n";
import { appRoutes } from "@/shared/routing";
import { Button, FeedbackBox } from "@/shared/ui";
import { demoLogin } from "../api";

type DemoLoginButtonProps = {
	copy: Dictionary["auth"]["demoLogin"];
	locale: Locale;
};

export function DemoLoginButton({ copy, locale }: DemoLoginButtonProps) {
	const router = useRouter();
	const { startSession } = useSession();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	async function handleDemoLogin() {
		setErrorMessage(null);
		setIsSubmitting(true);

		try {
			const authResponse = await demoLogin();
			startSession(authResponse);
			router.replace(appRoutes.myBookings(locale));
		} catch (error) {
			if (error instanceof ApiRequestError) {
				setErrorMessage(error.message);
			} else {
				setErrorMessage(copy.errorFallback);
			}
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<section
			className="mx-auto w-full max-w-md border-2 border-primary bg-background px-5 py-5"
			aria-label={copy.title}
		>
			<div className="flex flex-col gap-3">
				<div>
					<h2 className="text-lg font-black leading-tight text-primary">
						{copy.title}
					</h2>
					<p className="mt-1 text-sm font-semibold leading-6 text-muted">
						{copy.intro}
					</p>
				</div>

				{errorMessage && (
					<FeedbackBox variant="error">{errorMessage}</FeedbackBox>
				)}

				<Button
					type="button"
					variant="secondary"
					disabled={isSubmitting}
					onClick={handleDemoLogin}
				>
					{isSubmitting ? copy.submitPending : copy.submit}
				</Button>
			</div>
		</section>
	);
}
