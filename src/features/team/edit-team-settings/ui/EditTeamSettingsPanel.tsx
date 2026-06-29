"use client";

import { type ComponentPropsWithoutRef, useState } from "react";
import { useSession } from "@/entities/session";
import {
	deleteCustomerTeam,
	renameCustomerTeam,
	type TeamSummary,
} from "@/entities/team";
import { ApiRequestError } from "@/shared/api";
import type { Dictionary } from "@/shared/i18n";
import { Button, FeedbackBox, Field, Panel, TextInput } from "@/shared/ui";

type FormSubmitHandler = NonNullable<
	ComponentPropsWithoutRef<"form">["onSubmit"]
>;

type EditTeamSettingsPanelProps = {
	copy: Dictionary["myTeams"]["detail"]["settings"];
	team: TeamSummary;
	onTeamUpdated: (team: TeamSummary) => void;
	onTeamDeleted: () => void;
};

export function EditTeamSettingsPanel({
	copy,
	team,
	onTeamUpdated,
	onTeamDeleted,
}: EditTeamSettingsPanelProps) {
	const { endSession } = useSession();
	const [name, setName] = useState(team.name);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const isNameInvalid = name.trim().length === 0;

	const handleSubmit: FormSubmitHandler = async (event) => {
		event.preventDefault();
		setErrorMessage(null);
		setSuccessMessage(null);

		const trimmedName = name.trim();

		if (trimmedName.length === 0) {
			setErrorMessage(copy.rename.nameRequired);
			return;
		}

		setIsSubmitting(true);

		try {
			const updatedTeam = await renameCustomerTeam(team.id, {
				name: trimmedName,
			});
			setName(updatedTeam.name);
			onTeamUpdated(updatedTeam);
			setSuccessMessage(copy.rename.success);
		} catch (error) {
			if (error instanceof ApiRequestError && error.status === 401) {
				endSession();
				return;
			}

			if (error instanceof ApiRequestError && error.status === 400) {
				setErrorMessage(copy.rename.errors.badRequest);
				return;
			}

			if (error instanceof ApiRequestError && error.status === 403) {
				setErrorMessage(copy.rename.errors.forbidden);
				return;
			}

			if (error instanceof ApiRequestError && error.status === 404) {
				setErrorMessage(copy.rename.errors.notFound);
				return;
			}

			if (error instanceof ApiRequestError && error.status === 409) {
				setErrorMessage(copy.rename.errors.conflict);
				return;
			}

			setErrorMessage(copy.rename.errors.fallback);
		} finally {
			setIsSubmitting(false);
		}
	};

	async function handleDelete(): Promise<void> {
		const shouldDelete = window.confirm(copy.delete.confirmation);

		if (!shouldDelete) {
			return;
		}

		setErrorMessage(null);
		setSuccessMessage(null);
		setIsDeleting(true);

		try {
			await deleteCustomerTeam(team.id);
			onTeamDeleted();
		} catch (error) {
			if (error instanceof ApiRequestError && error.status === 401) {
				endSession();
				return;
			}

			if (error instanceof ApiRequestError && error.status === 403) {
				setErrorMessage(copy.delete.errors.forbidden);
				return;
			}

			if (error instanceof ApiRequestError && error.status === 404) {
				setErrorMessage(copy.delete.errors.notFound);
				return;
			}

			setErrorMessage(copy.delete.errors.fallback);
		} finally {
			setIsDeleting(false);
		}
	}

	return (
		<Panel>
			<div className="flex flex-wrap items-start justify-between gap-3">
				<div>
					<h2 className="text-2xl font-black leading-tight">{copy.title}</h2>
					<p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-muted">
						{copy.description}
					</p>
				</div>
				<Button
					variant="danger"
					onClick={() => {
						void handleDelete();
					}}
					disabled={isDeleting || isSubmitting}
				>
					{isDeleting ? copy.delete.pending : copy.delete.action}
				</Button>
			</div>

			{successMessage && (
				<FeedbackBox variant="success" className="mt-6">
					{successMessage}
				</FeedbackBox>
			)}

			{errorMessage && (
				<FeedbackBox variant="error" className="mt-6">
					{errorMessage}
				</FeedbackBox>
			)}

			<form onSubmit={handleSubmit} className="mt-6">
				<Field
					label={copy.rename.nameLabel}
					htmlFor="rename-team-name"
					errorText={
						isNameInvalid && errorMessage ? copy.rename.nameRequired : undefined
					}
				>
					<TextInput
						id="rename-team-name"
						name="name"
						value={name}
						onChange={(event) => setName(event.target.value)}
						placeholder={copy.rename.namePlaceholder}
						maxLength={80}
						disabled={isSubmitting || isDeleting}
					/>
				</Field>
				<div className="mt-3 flex justify-end">
					<Button type="submit" disabled={isSubmitting || isDeleting}>
						{isSubmitting ? copy.rename.pending : copy.rename.action}
					</Button>
				</div>
			</form>
		</Panel>
	);
}
