"use client";

import { clsx } from "clsx";
import { useEffect, useMemo, useState } from "react";
import {
	type AdminContactRequest,
	type AdminContactRequestReadState,
	type AdminContactRequestSort,
	type ContactRequestType,
	listAdminContactRequests,
	markAdminContactRequestRead,
} from "@/entities/contact-request";
import { useSession } from "@/entities/session";
import { RequireAuth } from "@/features/auth/require-auth";
import { ApiRequestError } from "@/shared/api";
import { Badge, Button, FeedbackBox } from "@/shared/ui";

type TypeFilter = "all" | ContactRequestType;

const typeFilters: { label: string; value: TypeFilter }[] = [
	{ label: "Alle Typen", value: "all" },
	{ label: "Frage", value: "QUESTION" },
	{ label: "Feedback", value: "FEEDBACK" },
	{ label: "Kritik", value: "CRITICISM" },
];

const readStateFilters: {
	label: string;
	value: AdminContactRequestReadState;
}[] = [
	{ label: "Ungelesen", value: "unread" },
	{ label: "Gelesen", value: "read" },
	{ label: "Alle", value: "all" },
];

const sortOptions: { label: string; value: AdminContactRequestSort }[] = [
	{ label: "Neueste zuerst", value: "received_desc" },
	{ label: "Älteste zuerst", value: "received_asc" },
];

const receivedAtFormatter = new Intl.DateTimeFormat("de-DE", {
	dateStyle: "medium",
	timeStyle: "short",
});

function formatContactRequestType(type: ContactRequestType): string {
	switch (type) {
		case "QUESTION":
			return "Frage";
		case "FEEDBACK":
			return "Feedback";
		case "CRITICISM":
			return "Kritik";
	}
}

function getTypeBadgeVariant(
	type: ContactRequestType,
): "danger" | "neutral" | "success" | "warning" {
	switch (type) {
		case "QUESTION":
			return "neutral";
		case "FEEDBACK":
			return "success";
		case "CRITICISM":
			return "warning";
	}
}

function getReadStateLabel(readState: AdminContactRequestReadState): string {
	return (
		readStateFilters.find((filter) => filter.value === readState)?.label ??
		"Ungelesen"
	);
}

function getUnreadCount(contactRequests: AdminContactRequest[]): number {
	return contactRequests.filter((contactRequest) => !contactRequest.isRead)
		.length;
}

export function AdminContactInbox() {
	const { status, endSession } = useSession();
	const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
	const [readStateFilter, setReadStateFilter] =
		useState<AdminContactRequestReadState>("unread");
	const [sort, setSort] = useState<AdminContactRequestSort>("received_desc");
	const [contactRequests, setContactRequests] = useState<AdminContactRequest[]>(
		[],
	);
	const [isLoading, setIsLoading] = useState(true);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [updatingContactRequestId, setUpdatingContactRequestId] = useState<
		string | null
	>(null);

	const unreadCount = useMemo(
		() => getUnreadCount(contactRequests),
		[contactRequests],
	);

	useEffect(() => {
		if (status !== "authenticated") {
			return;
		}

		async function loadContactRequests(): Promise<void> {
			try {
				setIsLoading(true);
				setErrorMessage(null);

				const nextContactRequests = await listAdminContactRequests({
					readState: readStateFilter,
					sort,
					type: typeFilter === "all" ? undefined : typeFilter,
				});

				setContactRequests(nextContactRequests);
			} catch (error) {
				if (error instanceof ApiRequestError) {
					if (error.status === 401) {
						endSession();
						return;
					}

					if (error.status === 403) {
						setErrorMessage("Du hast keine Berechtigung für diesen Bereich.");
						return;
					}

					setErrorMessage(error.message);
					return;
				}

				setErrorMessage("Die Kontaktanfragen konnten nicht geladen werden.");
			} finally {
				setIsLoading(false);
			}
		}

		void loadContactRequests();
	}, [status, typeFilter, readStateFilter, sort, endSession]);

	async function handleMarkAsRead(contactRequestId: string): Promise<void> {
		try {
			setUpdatingContactRequestId(contactRequestId);
			setErrorMessage(null);

			const updatedContactRequest =
				await markAdminContactRequestRead(contactRequestId);

			setContactRequests((currentContactRequests) =>
				currentContactRequests.map((contactRequest) =>
					contactRequest.id === updatedContactRequest.id
						? updatedContactRequest
						: contactRequest,
				),
			);
		} catch (error) {
			if (error instanceof ApiRequestError) {
				if (error.status === 401) {
					endSession();
					return;
				}

				setErrorMessage(error.message);
				return;
			}

			setErrorMessage("Die Kontaktanfrage konnte nicht aktualisiert werden.");
		} finally {
			setUpdatingContactRequestId(null);
		}
	}

	return (
		<RequireAuth allowedRoles={["ADMIN"]}>
			<div className="mt-8 grid gap-3 sm:grid-cols-2 md:inline-grid md:grid-cols-[10rem_10rem]">
				<div className="border-2 border-primary bg-background p-3">
					<p className="text-xs font-black uppercase text-muted">Aktuell</p>
					<p className="mt-2 text-3xl font-black leading-none tabular-nums text-primary">
						{contactRequests.length}
					</p>
					<p className="mt-2 text-xs font-semibold text-muted">
						{getReadStateLabel(readStateFilter)}
					</p>
				</div>
				<div className="border-2 border-primary bg-background p-3">
					<p className="text-xs font-black uppercase text-muted">Ungelesen</p>
					<p className="mt-2 text-3xl font-black leading-none tabular-nums text-warning-text">
						{unreadCount}
					</p>
					<p className="mt-2 text-xs font-semibold text-muted">
						Im geladenen Filter
					</p>
				</div>
			</div>

			<div className="mt-6 grid gap-4 border-2 border-primary bg-background p-5">
				<div>
					<p className="mb-2 text-xs font-black uppercase text-muted">
						Lesestatus
					</p>
					<div className="grid border-2 border-primary sm:grid-cols-3">
						{readStateFilters.map((filter) => {
							const isSelected = readStateFilter === filter.value;

							return (
								<button
									key={filter.value}
									type="button"
									className={clsx(
										"h-14 border-primary border-t-2 px-3 py-2 text-sm font-black transition-colors first:border-t-0 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-focus sm:border-l-2 sm:border-t-0 sm:first:border-l-0",
										isSelected
											? "bg-primary text-on-primary"
											: "bg-background text-primary hover:bg-primary/10",
									)}
									aria-pressed={isSelected}
									onClick={() => setReadStateFilter(filter.value)}
								>
									{filter.label}
								</button>
							);
						})}
					</div>
				</div>

				<div>
					<p className="mb-2 text-xs font-black uppercase text-muted">
						Anliegen-Typ
					</p>
					<div className="grid border-2 border-primary sm:grid-cols-4">
						{typeFilters.map((filter) => {
							const isSelected = typeFilter === filter.value;

							return (
								<button
									key={filter.value}
									type="button"
									className={clsx(
										"h-14 border-primary border-t-2 px-3 py-2 text-sm font-black transition-colors first:border-t-0 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-focus sm:border-l-2 sm:border-t-0 sm:first:border-l-0",
										isSelected
											? "bg-primary text-on-primary"
											: "bg-background text-primary hover:bg-primary/10",
									)}
									aria-pressed={isSelected}
									onClick={() => setTypeFilter(filter.value)}
								>
									{filter.label}
								</button>
							);
						})}
					</div>
				</div>

				<div>
					<p className="mb-2 text-xs font-black uppercase text-muted">
						Sortierung
					</p>
					<div className="grid border-2 border-primary sm:grid-cols-2">
						{sortOptions.map((option) => {
							const isSelected = sort === option.value;

							return (
								<button
									key={option.value}
									type="button"
									className={clsx(
										"h-14 border-primary border-t-2 px-3 py-2 text-sm font-black transition-colors first:border-t-0 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-focus sm:border-l-2 sm:border-t-0 sm:first:border-l-0",
										isSelected
											? "bg-primary text-on-primary"
											: "bg-background text-primary hover:bg-primary/10",
									)}
									aria-pressed={isSelected}
									onClick={() => setSort(option.value)}
								>
									{option.label}
								</button>
							);
						})}
					</div>
				</div>
			</div>

			{isLoading && (
				<p className="mt-8 bg-primary/10 px-3 py-2 text-sm font-semibold text-muted">
					Kontaktanfragen werden geladen...
				</p>
			)}
			{errorMessage && (
				<FeedbackBox variant="error" className="mt-8">
					{errorMessage}
				</FeedbackBox>
			)}
			{!isLoading && !errorMessage && contactRequests.length === 0 && (
				<FeedbackBox variant="empty" className="mt-8 w-fit!">
					Keine Kontaktanfragen im gewählten Filter.
				</FeedbackBox>
			)}
			{!isLoading && !errorMessage && contactRequests.length > 0 && (
				<section className="mt-8">
					<div className="border-primary border-y-4 bg-primary">
						<div className="grid md:grid-cols-[minmax(0,1fr)_auto]">
							<div className="flex min-h-16 min-w-0 items-center bg-primary px-4 py-3 text-on-primary">
								<h2 className="min-w-0 text-xl font-black leading-tight text-pretty md:text-2xl">
									Kontaktanfragen
								</h2>
							</div>
							<div className="mx-1 mb-0 flex min-h-14 items-center bg-on-primary px-4 py-3 text-sm font-black text-primary md:mx-0 md:mr-1">
								{contactRequests.length}
							</div>
						</div>
					</div>

					<div className="mt-4 grid gap-3">
						{contactRequests.map((contactRequest) => (
							<article
								key={contactRequest.id}
								className={clsx(
									"grid gap-4 border-2 border-primary bg-background p-4 md:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)_auto]",
									!contactRequest.isRead && "bg-warning-bg/20",
								)}
							>
								<div className="min-w-0">
									<div className="flex flex-wrap items-center gap-2">
										<Badge variant={getTypeBadgeVariant(contactRequest.type)}>
											{formatContactRequestType(contactRequest.type)}
										</Badge>
										<Badge
											variant={contactRequest.isRead ? "muted" : "warning"}
										>
											{contactRequest.isRead ? "Gelesen" : "Ungelesen"}
										</Badge>
									</div>
									<p className="mt-4 truncate text-sm font-black text-text">
										{contactRequest.user.name}
									</p>
									<p className="mt-1 truncate text-xs font-semibold text-muted">
										{contactRequest.user.email}
									</p>
									<p className="mt-3 text-xs font-semibold text-muted">
										{receivedAtFormatter.format(
											new Date(contactRequest.createdAt),
										)}
									</p>
								</div>

								<p className="whitespace-pre-wrap break-words text-sm font-semibold leading-6 text-text">
									{contactRequest.message}
								</p>

								<div className="flex items-start justify-end">
									<Button
										type="button"
										variant="secondary"
										disabled={
											contactRequest.isRead ||
											updatingContactRequestId === contactRequest.id
										}
										onClick={() => void handleMarkAsRead(contactRequest.id)}
									>
										{updatingContactRequestId === contactRequest.id
											? "Speichern..."
											: "Als gelesen markieren"}
									</Button>
								</div>
							</article>
						))}
					</div>
				</section>
			)}
		</RequireAuth>
	);
}
