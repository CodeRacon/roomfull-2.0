"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "@/entities/session";
import {
	getCustomerTeamDetail,
	type TeamDetail,
	type TeamSummary,
} from "@/entities/team";
import { RequireAuth } from "@/features/auth/require-auth";
import { EditTeamSettingsPanel } from "@/features/team/edit-team-settings";
import { ManageTeamMembersPanel } from "@/features/team/manage-team-members";
import { ApiRequestError } from "@/shared/api";
import type { Dictionary, Locale } from "@/shared/i18n";
import { appRoutes } from "@/shared/routing";
import { FeedbackBox, Panel } from "@/shared/ui";

type TeamDetailPageClientProps = {
	copy: Dictionary["myTeams"]["detail"];
	locale: Locale;
	teamId: string;
};

export function TeamDetailPageClient({
	copy,
	locale,
	teamId,
}: TeamDetailPageClientProps) {
	const router = useRouter();
	const { status, endSession } = useSession();
	const [team, setTeam] = useState<TeamDetail | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	useEffect(() => {
		if (status !== "authenticated") {
			return;
		}

		async function loadTeam(): Promise<void> {
			try {
				setIsLoading(true);
				setErrorMessage(null);
				const customerTeam = await getCustomerTeamDetail(teamId);
				setTeam(customerTeam);
			} catch (error) {
				if (error instanceof ApiRequestError && error.status === 401) {
					endSession();
					return;
				}

				if (error instanceof ApiRequestError && error.status === 404) {
					setErrorMessage(copy.client.notFound);
					return;
				}

				setErrorMessage(copy.client.loadError);
			} finally {
				setIsLoading(false);
			}
		}

		void loadTeam();
	}, [status, endSession, teamId, copy.client.loadError, copy.client.notFound]);

	function handleTeamUpdated(updatedTeam: TeamSummary): void {
		setTeam((currentTeam) =>
			currentTeam
				? {
						...currentTeam,
						name: updatedTeam.name,
					}
				: currentTeam,
		);
	}

	function handleMembersChanged(members: TeamDetail["members"]): void {
		setTeam((currentTeam) =>
			currentTeam
				? {
						...currentTeam,
						members,
					}
				: currentTeam,
		);
	}

	function handleTeamDeleted(): void {
		router.replace(appRoutes.myTeams(locale));
	}

	return (
		<RequireAuth allowedRoles={["CUSTOMER"]}>
			<div className="mt-8">
				<Link
					href={appRoutes.myTeams(locale)}
					className="text-sm font-black text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
				>
					{copy.page.back}
				</Link>
			</div>

			{isLoading && (
				<p className="mt-8 bg-primary/10 px-3 py-2 text-sm font-semibold text-muted">
					{copy.client.loading}
				</p>
			)}

			{errorMessage && (
				<FeedbackBox variant="error" className="mt-8">
					{errorMessage}
				</FeedbackBox>
			)}

			{!isLoading && !errorMessage && team && (
				<div className="mt-8 grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
					<div className="space-y-4">
						<Panel className="border-primary!">
							<p className="text-sm font-medium text-muted">
								{copy.summary.eyebrow}
							</p>
							<h2 className="mt-2 text-3xl font-black leading-tight">
								{team.name}
							</h2>
							<p className="mt-4 text-sm font-semibold leading-6 text-muted">
								{copy.summary.memberCount.replace(
									"{count}",
									String(team.members.length),
								)}
							</p>
						</Panel>

						<Panel variant="muted">
							<h2 className="text-lg font-semibold">{copy.notice.title}</h2>
							<p className="mt-3 text-sm font-semibold leading-6 text-muted">
								{copy.notice.description}
							</p>
						</Panel>
					</div>

					<div className="space-y-4">
						<EditTeamSettingsPanel
							copy={copy.settings}
							team={{
								id: team.id,
								name: team.name,
								memberCount: team.members.length,
							}}
							onTeamUpdated={handleTeamUpdated}
							onTeamDeleted={handleTeamDeleted}
						/>
						<ManageTeamMembersPanel
							copy={copy.members}
							locale={locale}
							team={team}
							onMembersChanged={handleMembersChanged}
						/>
					</div>
				</div>
			)}
		</RequireAuth>
	);
}
