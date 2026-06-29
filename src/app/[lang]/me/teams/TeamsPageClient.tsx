"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "@/entities/session";
import { listCustomerTeams, type TeamSummary } from "@/entities/team";
import { RequireAuth } from "@/features/auth/require-auth";
import { CreateTeamForm } from "@/features/team/create-team";
import { ApiRequestError } from "@/shared/api";
import type { Dictionary, Locale } from "@/shared/i18n";
import { appRoutes } from "@/shared/routing";
import { FeedbackBox, Panel } from "@/shared/ui";

type TeamsPageClientProps = {
	copy: Dictionary["myTeams"];
	locale: Locale;
};

function formatMemberCount(
	memberCount: number,
	copy: Dictionary["myTeams"]["list"],
): string {
	if (memberCount === 1) {
		return copy.memberOne;
	}

	return copy.membersMany.replace("{count}", String(memberCount));
}

function getTeamHref(locale: Locale, teamId: string): string {
	return appRoutes.myTeamDetail(locale, teamId);
}

export function TeamsPageClient({ copy, locale }: TeamsPageClientProps) {
	const { status, endSession } = useSession();
	const [teams, setTeams] = useState<TeamSummary[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	useEffect(() => {
		if (status !== "authenticated") {
			return;
		}

		async function loadTeams(): Promise<void> {
			try {
				setIsLoading(true);
				setErrorMessage(null);
				const customerTeams = await listCustomerTeams();
				setTeams(customerTeams);
			} catch (error) {
				if (error instanceof ApiRequestError && error.status === 401) {
					endSession();
					return;
				}

				setErrorMessage(copy.client.loadError);
			} finally {
				setIsLoading(false);
			}
		}

		void loadTeams();
	}, [status, endSession, copy.client.loadError]);

	const collator = new Intl.Collator(locale, {
		usage: "sort",
		sensitivity: "base",
	});
	const sortedTeams = [...teams].sort((firstTeam, secondTeam) =>
		collator.compare(firstTeam.name, secondTeam.name),
	);

	return (
		<RequireAuth allowedRoles={["CUSTOMER"]}>
			<div className="mt-8 grid gap-4 lg:grid-cols-[0.72fr_1fr]">
				<div className="space-y-4">
					<Panel className="border-primary!">
						<p className="text-sm font-medium text-muted">
							{copy.intro.eyebrow}
						</p>
						<h2 className="mt-2 text-2xl font-black leading-tight">
							{copy.intro.title}
						</h2>
						<p className="mt-4 text-sm font-semibold leading-6 text-muted">
							{copy.intro.description}
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
					<CreateTeamForm
						copy={copy.form}
						onTeamCreated={(team) => {
							setTeams((currentTeams) => [...currentTeams, team]);
						}}
					/>

					<Panel>
						<div className="flex flex-wrap items-start justify-between gap-3">
							<div>
								<h2 className="text-2xl font-black leading-tight">
									{copy.list.title}
								</h2>
								<p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-muted">
									{copy.list.description}
								</p>
							</div>
						</div>

						{isLoading && (
							<p className="mt-6 text-sm font-semibold text-muted">
								{copy.client.loading}
							</p>
						)}

						{errorMessage && (
							<FeedbackBox variant="error" className="mt-6">
								{errorMessage}
							</FeedbackBox>
						)}

						{!isLoading && !errorMessage && sortedTeams.length === 0 && (
							<Panel variant="muted" className="mt-6">
								<p className="text-sm font-semibold leading-6 text-muted">
									{copy.list.empty}
								</p>
							</Panel>
						)}

						{!isLoading && !errorMessage && sortedTeams.length > 0 && (
							<ul className="mt-6 grid gap-3">
								{sortedTeams.map((team) => (
									<li key={team.id}>
										<Link
											href={getTeamHref(locale, team.id)}
											className="block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
										>
											<Panel
												padding="compact"
												className="border-primary/45! transition-colors hover:border-primary!"
											>
												<div className="flex flex-wrap items-center justify-between gap-3">
													<div>
														<h3 className="text-lg font-black leading-tight">
															{team.name}
														</h3>
														<p className="mt-2 text-sm font-semibold text-muted">
															{formatMemberCount(team.memberCount, copy.list)}
														</p>
													</div>
													<span className="text-sm font-black text-primary">
														{copy.list.openTeam}
													</span>
												</div>
											</Panel>
										</Link>
									</li>
								))}
							</ul>
						)}
					</Panel>
				</div>
			</div>
		</RequireAuth>
	);
}
