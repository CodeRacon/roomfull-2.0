"use client";

import {
	type ComponentPropsWithoutRef,
	startTransition,
	useState,
} from "react";
import { useSession } from "@/entities/session";
import { createCustomerTeam, type TeamSummary } from "@/entities/team";
import { ApiRequestError } from "@/shared/api";
import type { Dictionary } from "@/shared/i18n";
import { Button, FeedbackBox, Field, TextInput } from "@/shared/ui";

type FormSubmitHandler = NonNullable<
	ComponentPropsWithoutRef<"form">["onSubmit"]
>;

type CreateTeamFormProps = {
	copy: Dictionary["myTeams"]["form"];
	onTeamCreated: (team: TeamSummary) => void;
};

export function CreateTeamForm({ copy, onTeamCreated }: CreateTeamFormProps) {
	const { endSession } = useSession();
	const [name, setName] = useState("");
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const isNameInvalid = name.trim().length === 0;

	const handleSubmit: FormSubmitHandler = async (event) => {
		event.preventDefault();
		setErrorMessage(null);
		setSuccessMessage(null);

		const trimmedName = name.trim();

		if (trimmedName.length === 0) {
			setErrorMessage(copy.nameRequired);
			return;
		}

		setIsSubmitting(true);

		try {
			const team = await createCustomerTeam({ name: trimmedName });

			startTransition(() => {
				onTeamCreated(team);
			});
			setName("");
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

			if (error instanceof ApiRequestError && error.status === 409) {
				setErrorMessage(copy.errors.conflict);
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
			<div className="border-b-2 border-primary bg-primary px-5 py-5 text-on-primary">
				<h2 className="text-3xl font-black leading-none tracking-normal text-pretty">
					{copy.title}
				</h2>
				<p className="mt-3 text-sm font-semibold leading-6 text-on-primary/85">
					{copy.description}
				</p>
			</div>

			{successMessage && (
				<div className="border-b-2 border-primary px-5 py-4">
					<FeedbackBox variant="success">{successMessage}</FeedbackBox>
				</div>
			)}

			{errorMessage && (
				<div className="border-b-2 border-primary px-5 py-4">
					<FeedbackBox variant="error">{errorMessage}</FeedbackBox>
				</div>
			)}

			<div className="px-5 py-4">
				<Field
					label={copy.nameLabel}
					htmlFor="team-name"
					errorText={
						isNameInvalid && errorMessage ? copy.nameRequired : undefined
					}
				>
					<TextInput
						id="team-name"
						name="name"
						autoComplete="off"
						value={name}
						onChange={(event) => setName(event.target.value)}
						maxLength={80}
						required
						placeholder={copy.namePlaceholder}
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
