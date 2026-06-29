"use client";

import { type ComponentPropsWithoutRef, useState } from "react";
import { useSession } from "@/entities/session";
import {
	addCustomerTeamMember,
	deleteCustomerTeamMember,
	type TeamDetail,
	type TeamMember,
	updateCustomerTeamMember,
} from "@/entities/team";
import { ApiRequestError } from "@/shared/api";
import type { Dictionary, Locale } from "@/shared/i18n";
import { Button, FeedbackBox, Field, Panel, TextInput } from "@/shared/ui";

type FormSubmitHandler = NonNullable<
	ComponentPropsWithoutRef<"form">["onSubmit"]
>;

type TeamMemberFormState = {
	name: string;
	email: string;
};

type ManageTeamMembersPanelProps = {
	copy: Dictionary["myTeams"]["detail"]["members"];
	locale: Locale;
	team: TeamDetail;
	onMembersChanged: (members: TeamMember[]) => void;
};

function sortMembers(members: TeamMember[], locale: Locale): TeamMember[] {
	const collator = new Intl.Collator(locale, {
		usage: "sort",
		sensitivity: "base",
	});

	return [...members].sort((firstMember, secondMember) => {
		const nameCompare = collator.compare(firstMember.name, secondMember.name);

		if (nameCompare !== 0) {
			return nameCompare;
		}

		return collator.compare(firstMember.email, secondMember.email);
	});
}

function resolveMemberErrorMessage(
	error: unknown,
	copy: Dictionary["myTeams"]["detail"]["members"]["errors"],
	endSession: () => void,
): string | null {
	if (error instanceof ApiRequestError && error.status === 401) {
		endSession();
		return null;
	}

	if (error instanceof ApiRequestError && error.status === 400) {
		return copy.badRequest;
	}

	if (error instanceof ApiRequestError && error.status === 403) {
		return copy.forbidden;
	}

	if (error instanceof ApiRequestError && error.status === 404) {
		return copy.notFound;
	}

	if (error instanceof ApiRequestError && error.status === 409) {
		return copy.conflict;
	}

	return copy.fallback;
}

export function ManageTeamMembersPanel({
	copy,
	locale,
	team,
	onMembersChanged,
}: ManageTeamMembersPanelProps) {
	const { endSession } = useSession();
	const [createState, setCreateState] = useState<TeamMemberFormState>({
		name: "",
		email: "",
	});
	const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
	const [editState, setEditState] = useState<TeamMemberFormState>({
		name: "",
		email: "",
	});
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);
	const [isCreating, setIsCreating] = useState(false);
	const [isUpdatingMemberId, setIsUpdatingMemberId] = useState<string | null>(
		null,
	);
	const [isDeletingMemberId, setIsDeletingMemberId] = useState<string | null>(
		null,
	);

	const sortedMembers = sortMembers(team.members, locale);

	const handleCreateMember: FormSubmitHandler = async (event) => {
		event.preventDefault();
		setErrorMessage(null);
		setSuccessMessage(null);

		const trimmedName = createState.name.trim();
		const trimmedEmail = createState.email.trim();

		if (trimmedName.length === 0 || trimmedEmail.length === 0) {
			setErrorMessage(copy.required);
			return;
		}

		setIsCreating(true);

		try {
			const member = await addCustomerTeamMember({
				teamId: team.id,
				name: trimmedName,
				email: trimmedEmail,
			});
			onMembersChanged(sortMembers([...team.members, member], locale));
			setCreateState({ name: "", email: "" });
			setSuccessMessage(copy.create.success);
		} catch (error) {
			const message = resolveMemberErrorMessage(error, copy.errors, endSession);

			if (message) {
				setErrorMessage(message);
			}
		} finally {
			setIsCreating(false);
		}
	};

	function startEditing(member: TeamMember): void {
		setEditingMemberId(member.id);
		setEditState({
			name: member.name,
			email: member.email,
		});
		setErrorMessage(null);
		setSuccessMessage(null);
	}

	function stopEditing(): void {
		setEditingMemberId(null);
		setEditState({ name: "", email: "" });
	}

	async function handleUpdateMember(memberId: string): Promise<void> {
		const trimmedName = editState.name.trim();
		const trimmedEmail = editState.email.trim();

		if (trimmedName.length === 0 || trimmedEmail.length === 0) {
			setErrorMessage(copy.required);
			return;
		}

		setErrorMessage(null);
		setSuccessMessage(null);
		setIsUpdatingMemberId(memberId);

		try {
			const updatedMember = await updateCustomerTeamMember({
				teamId: team.id,
				memberId,
				name: trimmedName,
				email: trimmedEmail,
			});
			onMembersChanged(
				sortMembers(
					team.members.map((member) =>
						member.id === memberId ? updatedMember : member,
					),
					locale,
				),
			);
			stopEditing();
			setSuccessMessage(copy.update.success);
		} catch (error) {
			const message = resolveMemberErrorMessage(error, copy.errors, endSession);

			if (message) {
				setErrorMessage(message);
			}
		} finally {
			setIsUpdatingMemberId(null);
		}
	}

	async function handleDeleteMember(member: TeamMember): Promise<void> {
		const shouldDelete = window.confirm(
			copy.delete.confirmation.replace("{name}", member.name),
		);

		if (!shouldDelete) {
			return;
		}

		setErrorMessage(null);
		setSuccessMessage(null);
		setIsDeletingMemberId(member.id);

		try {
			await deleteCustomerTeamMember({
				teamId: team.id,
				memberId: member.id,
			});
			onMembersChanged(
				team.members.filter((currentMember) => currentMember.id !== member.id),
			);
			if (editingMemberId === member.id) {
				stopEditing();
			}
			setSuccessMessage(copy.delete.success.replace("{name}", member.name));
		} catch (error) {
			const message = resolveMemberErrorMessage(error, copy.errors, endSession);

			if (message) {
				setErrorMessage(message);
			}
		} finally {
			setIsDeletingMemberId(null);
		}
	}

	return (
		<Panel>
			<h2 className="text-2xl font-black leading-tight">{copy.title}</h2>
			<p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-muted">
				{copy.description}
			</p>

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

			<form
				onSubmit={handleCreateMember}
				className="mt-6 grid gap-3 md:grid-cols-2"
			>
				<Field label={copy.create.nameLabel} htmlFor="create-team-member-name">
					<TextInput
						id="create-team-member-name"
						value={createState.name}
						onChange={(event) =>
							setCreateState((currentState) => ({
								...currentState,
								name: event.target.value,
							}))
						}
						placeholder={copy.create.namePlaceholder}
						maxLength={100}
						disabled={isCreating}
					/>
				</Field>
				<Field
					label={copy.create.emailLabel}
					htmlFor="create-team-member-email"
				>
					<TextInput
						id="create-team-member-email"
						type="email"
						value={createState.email}
						onChange={(event) =>
							setCreateState((currentState) => ({
								...currentState,
								email: event.target.value,
							}))
						}
						placeholder={copy.create.emailPlaceholder}
						maxLength={254}
						disabled={isCreating}
					/>
				</Field>
				<div className="md:col-span-2 md:flex md:justify-end">
					<Button type="submit" disabled={isCreating}>
						{isCreating ? copy.create.pending : copy.create.action}
					</Button>
				</div>
			</form>

			{sortedMembers.length === 0 && (
				<Panel variant="muted" className="mt-6">
					<p className="text-sm font-semibold leading-6 text-muted">
						{copy.empty}
					</p>
				</Panel>
			)}

			{sortedMembers.length > 0 && (
				<ul className="mt-6 grid gap-3">
					{sortedMembers.map((member) => {
						const isEditing = editingMemberId === member.id;
						const isUpdating = isUpdatingMemberId === member.id;
						const isDeleting = isDeletingMemberId === member.id;

						return (
							<li key={member.id}>
								<Panel padding="compact" className="border-primary/45!">
									{isEditing ? (
										<div className="grid gap-3 md:grid-cols-2">
											<Field
												label={copy.update.nameLabel}
												htmlFor={`edit-team-member-name-${member.id}`}
											>
												<TextInput
													id={`edit-team-member-name-${member.id}`}
													value={editState.name}
													onChange={(event) =>
														setEditState((currentState) => ({
															...currentState,
															name: event.target.value,
														}))
													}
													maxLength={100}
													disabled={isUpdating || isDeleting}
												/>
											</Field>
											<Field
												label={copy.update.emailLabel}
												htmlFor={`edit-team-member-email-${member.id}`}
											>
												<TextInput
													id={`edit-team-member-email-${member.id}`}
													type="email"
													value={editState.email}
													onChange={(event) =>
														setEditState((currentState) => ({
															...currentState,
															email: event.target.value,
														}))
													}
													maxLength={254}
													disabled={isUpdating || isDeleting}
												/>
											</Field>
											<div className="flex flex-wrap justify-end gap-3 md:col-span-2">
												<Button
													variant="secondary"
													onClick={stopEditing}
													disabled={isUpdating || isDeleting}
												>
													{copy.update.cancel}
												</Button>
												<Button
													onClick={() => {
														void handleUpdateMember(member.id);
													}}
													disabled={isUpdating || isDeleting}
												>
													{isUpdating
														? copy.update.pending
														: copy.update.action}
												</Button>
											</div>
										</div>
									) : (
										<div className="flex flex-wrap items-start justify-between gap-3">
											<div>
												<h3 className="text-lg font-black leading-tight">
													{member.name}
												</h3>
												<p className="mt-2 text-sm font-semibold text-muted">
													{member.email}
												</p>
											</div>
											<div className="flex flex-wrap gap-3">
												<Button
													variant="secondary"
													onClick={() => startEditing(member)}
													disabled={isDeleting}
												>
													{copy.update.start}
												</Button>
												<Button
													variant="danger"
													onClick={() => {
														void handleDeleteMember(member);
													}}
													disabled={isDeleting}
												>
													{isDeleting
														? copy.delete.pending
														: copy.delete.action}
												</Button>
											</div>
										</div>
									)}
								</Panel>
							</li>
						);
					})}
				</ul>
			)}
		</Panel>
	);
}
