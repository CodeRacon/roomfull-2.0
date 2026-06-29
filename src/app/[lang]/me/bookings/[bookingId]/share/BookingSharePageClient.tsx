"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
	type BookingShareContext,
	createBookingDateTimeFormatter,
	getBookingShareContext,
} from "@/entities/booking";
import { useSession } from "@/entities/session";
import {
	getCustomerTeamDetail,
	listCustomerTeams,
	type TeamDetail,
	type TeamMember,
	type TeamSummary,
} from "@/entities/team";
import { formatUnitTypeName } from "@/entities/unit";
import { RequireAuth } from "@/features/auth/require-auth";
import {
	buildTeamShareBccList,
	buildTeamShareFileName,
	buildTeamShareIcsContent,
	buildTeamShareMessage,
	buildTeamShareSubject,
} from "@/features/booking/share-booking-with-team";
import { ApiRequestError } from "@/shared/api";
import type { Dictionary, Locale } from "@/shared/i18n";
import { appRoutes } from "@/shared/routing";
import {
	Button,
	Checkbox,
	FeedbackBox,
	Field,
	Panel,
	Textarea,
} from "@/shared/ui";

type BookingSharePageClientProps = {
	bookingId: string;
	copy: Dictionary["bookingShare"];
	locale: Locale;
};

function sortTeams(teams: TeamSummary[], locale: Locale): TeamSummary[] {
	const collator = new Intl.Collator(locale, {
		usage: "sort",
		sensitivity: "base",
	});

	return [...teams].sort((firstTeam, secondTeam) =>
		collator.compare(firstTeam.name, secondTeam.name),
	);
}

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

function formatCapacityNotice(
	selectedMemberCount: number,
	capacity: number,
	copy: Dictionary["bookingShare"]["selection"]["capacityWarning"],
): string {
	return copy
		.replace("{selected}", String(selectedMemberCount))
		.replace("{capacity}", String(capacity));
}

function formatTeamOptionCount(
	team: TeamSummary,
	copy: Dictionary["bookingShare"]["selection"],
): string {
	if (team.memberCount === 0) {
		return copy.emptyTeam;
	}

	if (team.memberCount === 1) {
		return copy.memberOne;
	}

	return copy.membersMany.replace("{count}", String(team.memberCount));
}

function formatShareSummaryWindow(
	shareContext: BookingShareContext,
	copy: Dictionary["bookingShare"]["package"]["dateTime"],
): string {
	const start = new Date(shareContext.booking.startTime);
	const end = new Date(shareContext.booking.endTime);
	const dayFormatter = createBookingDateTimeFormatter(copy.locale, {
		weekday: "long",
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	});
	const timeFormatter = createBookingDateTimeFormatter(copy.locale, {
		hour: "2-digit",
		minute: "2-digit",
	});

	return copy.sameDay
		.replace("{date}", dayFormatter.format(start))
		.replace("{start}", timeFormatter.format(start))
		.replace("{end}", timeFormatter.format(end));
}

export function BookingSharePageClient({
	bookingId,
	copy,
	locale,
}: BookingSharePageClientProps) {
	const { status, endSession } = useSession();
	const [shareContext, setShareContext] = useState<BookingShareContext | null>(
		null,
	);
	const [teams, setTeams] = useState<TeamSummary[]>([]);
	const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
	const [selectedTeamDetail, setSelectedTeamDetail] =
		useState<TeamDetail | null>(null);
	const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
	const [personalMessage, setPersonalMessage] = useState("");
	const [loadErrorMessage, setLoadErrorMessage] = useState<string | null>(null);
	const [teamLoadErrorMessage, setTeamLoadErrorMessage] = useState<
		string | null
	>(null);
	const [packageFeedback, setPackageFeedback] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isTeamDetailLoading, setIsTeamDetailLoading] = useState(false);

	useEffect(() => {
		if (status !== "authenticated") {
			return;
		}

		async function loadPageData(): Promise<void> {
			try {
				setIsLoading(true);
				setLoadErrorMessage(null);
				const [nextShareContext, nextTeams] = await Promise.all([
					getBookingShareContext(bookingId),
					listCustomerTeams(),
				]);
				setShareContext(nextShareContext);
				setTeams(sortTeams(nextTeams, locale));
			} catch (error) {
				if (error instanceof ApiRequestError && error.status === 401) {
					endSession();
					return;
				}

				if (error instanceof ApiRequestError && error.status === 404) {
					setLoadErrorMessage(copy.errors.notFound);
					return;
				}

				if (error instanceof ApiRequestError && error.status === 409) {
					setLoadErrorMessage(copy.errors.conflict);
					return;
				}

				setLoadErrorMessage(copy.errors.fallback);
			} finally {
				setIsLoading(false);
			}
		}

		void loadPageData();
	}, [status, endSession, bookingId, copy.errors, locale]);

	useEffect(() => {
		if (!selectedTeamId) {
			setSelectedTeamDetail(null);
			setSelectedMemberIds([]);
			setTeamLoadErrorMessage(null);
			return;
		}

		const selectedTeam = teams.find((team) => team.id === selectedTeamId);

		if (!selectedTeam || selectedTeam.memberCount === 0) {
			setSelectedTeamDetail(null);
			setSelectedMemberIds([]);
			return;
		}

		const teamId = selectedTeamId;

		async function loadTeamDetail(): Promise<void> {
			try {
				setIsTeamDetailLoading(true);
				setTeamLoadErrorMessage(null);
				const detail = await getCustomerTeamDetail(teamId);
				const sortedMembers = sortMembers(detail.members, locale);
				setSelectedTeamDetail({
					...detail,
					members: sortedMembers,
				});
				setSelectedMemberIds(sortedMembers.map((member) => member.id));
			} catch (error) {
				if (error instanceof ApiRequestError && error.status === 401) {
					endSession();
					return;
				}

				setTeamLoadErrorMessage(copy.errors.teamLoad);
				setSelectedTeamDetail(null);
				setSelectedMemberIds([]);
			} finally {
				setIsTeamDetailLoading(false);
			}
		}

		void loadTeamDetail();
	}, [selectedTeamId, teams, locale, endSession, copy.errors.teamLoad]);

	const selectedMembers = useMemo(() => {
		if (!selectedTeamDetail) {
			return [];
		}

		return selectedTeamDetail.members.filter((member) =>
			selectedMemberIds.includes(member.id),
		);
	}, [selectedTeamDetail, selectedMemberIds]);

	const isCapacityExceeded =
		shareContext !== null &&
		selectedMembers.length > shareContext.unit.capacity;

	function toggleMember(memberId: string): void {
		setSelectedMemberIds((currentMemberIds) =>
			currentMemberIds.includes(memberId)
				? currentMemberIds.filter(
						(currentMemberId) => currentMemberId !== memberId,
					)
				: [...currentMemberIds, memberId],
		);
	}

	async function copyText(
		value: string,
		successMessage: string,
	): Promise<void> {
		try {
			await navigator.clipboard.writeText(value);
			setPackageFeedback(successMessage);
		} catch {
			setPackageFeedback(copy.package.copyFallback);
		}
	}

	function downloadIcs(): void {
		if (!shareContext) {
			return;
		}

		const calendarContent = buildTeamShareIcsContent({
			copy: copy.package,
			locale,
			shareContext,
		});
		const fileName = buildTeamShareFileName(shareContext);
		const blob = new Blob([calendarContent], {
			type: "text/calendar;charset=utf-8",
		});
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");

		link.href = url;
		link.download = fileName;
		link.click();
		URL.revokeObjectURL(url);
		setPackageFeedback(copy.package.icsSuccess);
	}

	return (
		<RequireAuth allowedRoles={["CUSTOMER"]}>
			<div className="mt-8">
				<Link
					href={appRoutes.myBookings(locale)}
					className="text-sm font-black text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
				>
					{copy.page.back}
				</Link>
			</div>

			{isLoading && (
				<p className="mt-8 bg-primary/10 px-3 py-2 text-sm font-semibold text-muted">
					{copy.loading.page}
				</p>
			)}

			{loadErrorMessage && (
				<FeedbackBox variant="error" className="mt-8">
					{loadErrorMessage}
				</FeedbackBox>
			)}

			{!isLoading && !loadErrorMessage && shareContext && (
				<div className="mt-8 grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
					<div className="space-y-4">
						<Panel className="border-primary!">
							<p className="text-sm font-medium text-muted">
								{copy.summary.eyebrow}
							</p>
							<h2 className="mt-2 text-3xl font-black leading-tight">
								{shareContext.unit.name}
							</h2>
							<p className="mt-3 text-sm font-semibold leading-6 text-muted">
								{copy.summary.unitType.replace(
									"{unitType}",
									formatUnitTypeName(shareContext.unit.unitType.name),
								)}
							</p>
							<p className="mt-3 text-sm font-semibold leading-6 text-muted">
								{copy.summary.capacity.replace(
									"{capacity}",
									String(shareContext.unit.capacity),
								)}
							</p>
							<p className="mt-3 text-sm font-semibold leading-6 text-muted">
								{copy.summary.time.replace(
									"{time}",
									formatShareSummaryWindow(shareContext, copy.package.dateTime),
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
						<Panel>
							<h2 className="text-2xl font-black leading-tight">
								{copy.selection.title}
							</h2>
							<p className="mt-3 text-sm font-semibold leading-6 text-muted">
								{copy.selection.description}
							</p>

							{teams.length === 0 && (
								<Panel variant="muted" className="mt-6">
									<p className="text-sm font-semibold leading-6 text-muted">
										{copy.selection.noTeams}
									</p>
									<Link
										href={appRoutes.myTeams(locale)}
										className="mt-4 inline-flex text-sm font-black text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
									>
										{copy.selection.openTeams}
									</Link>
								</Panel>
							)}

							{teams.length > 0 && (
								<div className="mt-6 grid gap-3">
									{teams.map((team) => {
										const isSelected = selectedTeamId === team.id;
										const isDisabled = team.memberCount === 0;

										return (
											<div
												key={team.id}
												className={`border-2 p-4 ${
													isSelected
														? "border-primary bg-primary/10"
														: "border-primary/35 bg-background"
												} ${isDisabled ? "opacity-65" : ""}`}
											>
												<div className="flex flex-wrap items-center justify-between gap-3">
													<div>
														<h3 className="text-lg font-black leading-tight">
															{team.name}
														</h3>
														<p className="mt-2 text-sm font-semibold text-muted">
															{formatTeamOptionCount(team, copy.selection)}
														</p>
													</div>
													{isDisabled ? (
														<Link
															href={appRoutes.myTeamDetail(locale, team.id)}
															className="text-sm font-black text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
														>
															{copy.selection.manageEmptyTeam}
														</Link>
													) : (
														<Button
															variant={isSelected ? "primary" : "secondary"}
															onClick={() => {
																setPackageFeedback(null);
																setSelectedTeamId(team.id);
															}}
														>
															{isSelected
																? copy.selection.selected
																: copy.selection.select}
														</Button>
													)}
												</div>
											</div>
										);
									})}
								</div>
							)}

							{isTeamDetailLoading && (
								<p className="mt-6 text-sm font-semibold text-muted">
									{copy.loading.team}
								</p>
							)}

							{teamLoadErrorMessage && (
								<FeedbackBox variant="error" className="mt-6">
									{teamLoadErrorMessage}
								</FeedbackBox>
							)}

							{selectedTeamDetail && !isTeamDetailLoading && (
								<div className="mt-6">
									<h3 className="text-lg font-black leading-tight">
										{copy.selection.membersTitle.replace(
											"{teamName}",
											selectedTeamDetail.name,
										)}
									</h3>
									<p className="mt-3 text-sm font-semibold leading-6 text-muted">
										{copy.selection.membersDescription}
									</p>
									<div className="mt-4 grid gap-3">
										{selectedTeamDetail.members.map((member) => (
											<div
												key={member.id}
												className="border-2 border-primary/35 bg-background px-4 py-3"
											>
												<Checkbox
													checked={selectedMemberIds.includes(member.id)}
													onChange={() => toggleMember(member.id)}
													label={
														<span className="flex flex-col">
															<span className="font-black">{member.name}</span>
															<span className="text-muted">{member.email}</span>
														</span>
													}
												/>
											</div>
										))}
									</div>
								</div>
							)}

							<Field
								label={copy.selection.messageLabel}
								htmlFor="booking-share-message"
								helperText={copy.selection.messageHint.replace(
									"{remaining}",
									String(500 - personalMessage.length),
								)}
								className="mt-6"
							>
								<Textarea
									id="booking-share-message"
									value={personalMessage}
									onChange={(event) =>
										setPersonalMessage(event.target.value.slice(0, 500))
									}
									placeholder={copy.selection.messagePlaceholder}
									maxLength={500}
									rows={6}
								/>
							</Field>

							{isCapacityExceeded && (
								<FeedbackBox variant="warning" className="mt-4">
									{formatCapacityNotice(
										selectedMembers.length,
										shareContext.unit.capacity,
										copy.selection.capacityWarning,
									)}
								</FeedbackBox>
							)}
						</Panel>

						<Panel>
							<h2 className="text-2xl font-black leading-tight">
								{copy.package.title}
							</h2>
							<p className="mt-3 text-sm font-semibold leading-6 text-muted">
								{copy.package.description}
							</p>

							{packageFeedback && (
								<FeedbackBox variant="success" className="mt-6">
									{packageFeedback}
								</FeedbackBox>
							)}

							<div className="mt-6 grid gap-3 sm:grid-cols-2">
								<Button
									disabled={selectedMembers.length === 0}
									onClick={() => {
										void copyText(
											buildTeamShareBccList(selectedMembers),
											copy.package.bccSuccess,
										);
									}}
								>
									{copy.package.copyBcc}
								</Button>
								<Button
									disabled={selectedMembers.length === 0}
									onClick={() => {
										void copyText(
											buildTeamShareSubject(shareContext, locale, copy.package),
											copy.package.subjectSuccess,
										);
									}}
								>
									{copy.package.copySubject}
								</Button>
								<Button
									disabled={selectedMembers.length === 0}
									onClick={() => {
										void copyText(
											buildTeamShareMessage({
												copy: copy.package,
												locale,
												personalMessage,
												shareContext,
											}),
											copy.package.messageSuccess,
										);
									}}
								>
									{copy.package.copyMessage}
								</Button>
								<Button
									disabled={selectedMembers.length === 0}
									onClick={downloadIcs}
								>
									{copy.package.downloadIcs}
								</Button>
							</div>

							<p className="mt-6 text-sm font-semibold leading-6 text-muted">
								{copy.package.bccHint}
							</p>
						</Panel>
					</div>
				</div>
			)}
		</RequireAuth>
	);
}
