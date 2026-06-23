"use client";

import { type ComponentPropsWithoutRef, useState } from "react";
import {
	type ContactRequestType,
	createContactRequest,
} from "@/entities/contact-request";
import { useSession } from "@/entities/session";
import { ApiRequestError } from "@/shared/api";
import type { Dictionary } from "@/shared/i18n";
import { Button, FeedbackBox, Field } from "@/shared/ui";

type FormSubmitHandler = NonNullable<
	ComponentPropsWithoutRef<"form">["onSubmit"]
>;

type ContactRequestTypeOption = {
	value: ContactRequestType;
};

const contactRequestTypeOptions: ContactRequestTypeOption[] = [
	{ value: "QUESTION" },
	{ value: "FEEDBACK" },
	{ value: "CRITICISM" },
];

type CreateContactRequestFormProps = {
	copy: Dictionary["contact"]["form"];
};

export function CreateContactRequestForm({
	copy,
}: CreateContactRequestFormProps) {
	const { endSession } = useSession();
	const [type, setType] = useState<ContactRequestType>("QUESTION");
	const [message, setMessage] = useState("");
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const isMessageInvalid = message.trim().length === 0;

	const handleSubmit: FormSubmitHandler = async (event) => {
		event.preventDefault();
		setErrorMessage(null);
		setSuccessMessage(null);

		const trimmedMessage = message.trim();

		if (trimmedMessage.length === 0) {
			setErrorMessage(copy.emptyMessage);
			return;
		}

		setIsSubmitting(true);

		try {
			await createContactRequest({
				type,
				message: trimmedMessage,
			});

			setMessage("");
			setType("QUESTION");
			setSuccessMessage(copy.success);
		} catch (error) {
			if (error instanceof ApiRequestError && error.status === 401) {
				endSession();
				return;
			}

			if (error instanceof ApiRequestError && error.status === 400) {
				setErrorMessage(copy.errors.badRequest);
				return;
			}

			if (error instanceof ApiRequestError && error.status === 403) {
				setErrorMessage(copy.errors.forbidden);
				return;
			}

			setErrorMessage(copy.errors.fallback);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="overflow-hidden border-2 border-primary bg-background"
		>
			<div className="border-b-2 border-primary! bg-primary px-5 py-5 text-on-primary">
				<h2 className="text-3xl font-black leading-none tracking-normal text-pretty">
					{copy.title}
				</h2>
				<p className="mt-3 text-sm font-semibold leading-6 text-on-primary/85">
					{copy.description}
				</p>
			</div>

			{successMessage && (
				<div className="border-b-2 border-primary! px-5 py-4">
					<FeedbackBox variant="success">{successMessage}</FeedbackBox>
				</div>
			)}

			{errorMessage && (
				<div className="border-b-2 border-primary! px-5 py-4">
					<FeedbackBox variant="error">{errorMessage}</FeedbackBox>
				</div>
			)}

			<div className="px-5 py-4">
				<Field label={copy.typeLabel}>
					<div className="grid gap-2 sm:grid-cols-3">
						{contactRequestTypeOptions.map((option) => (
							<label
								key={option.value}
								className="flex min-h-11 cursor-pointer items-center gap-3 border-2 border-primary bg-background px-3 py-2 text-sm font-black text-primary transition-colors has-checked:border-primary has-checked:bg-primary has-checked:text-on-primary hover:border-primary"
							>
								<input
									type="radio"
									name="contactRequestType"
									value={option.value}
									checked={type === option.value}
									onChange={() => setType(option.value)}
									className="size-4 accent-accent"
								/>
								<span>{copy.types[option.value]}</span>
							</label>
						))}
					</div>
				</Field>

				<Field
					label={copy.messageLabel}
					htmlFor="contact-message"
					errorText={
						isMessageInvalid && errorMessage ? copy.messageRequired : undefined
					}
				>
					<textarea
						id="contact-message"
						name="message"
						value={message}
						onChange={(event) => setMessage(event.target.value)}
						required
						rows={7}
						className="min-h-40 w-full resize-y border-2 border-primary bg-background px-3 py-2 text-sm font-semibold leading-6 text-text transition-colors placeholder:text-muted hover:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-muted disabled:opacity-70"
						placeholder={copy.messagePlaceholder}
						disabled={isSubmitting}
					/>
				</Field>
			</div>

			<div className="flex justify-end px-5 pb-5">
				<Button type="submit" disabled={isSubmitting}>
					{isSubmitting ? copy.submitPending : copy.submit}
				</Button>
			</div>
		</form>
	);
}
