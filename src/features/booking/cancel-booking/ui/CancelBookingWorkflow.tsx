"use client";

import TrashIcon from "@public/icons/general/ic-trash.svg";
import { createContext, type ReactNode, use, useState } from "react";
import type { Booking } from "@/entities/booking";
import { cancelBooking } from "@/entities/booking";
import { useSession } from "@/entities/session";
import { ApiRequestError } from "@/shared/api";
import type { Dictionary } from "@/shared/i18n";
import { Button, TextInput } from "@/shared/ui";

type CancelBookingCopy = Dictionary["myBookings"];

type CancelBookingWorkflowProps = {
	children: ReactNode;
	copy: CancelBookingCopy;
	onCancelled: (booking: Booking) => void;
	onError: (message: string) => void;
};

type CancelBookingWorkflowValue = {
	activeBookingId: string | null;
	closeConfirmation: () => void;
	confirmationInput: string;
	copy: CancelBookingCopy;
	isSubmitting: boolean;
	openConfirmation: (bookingId: string) => void;
	setConfirmationInput: (value: string) => void;
	submit: (bookingId: string) => Promise<void>;
};

const CancelBookingWorkflowContext =
	createContext<CancelBookingWorkflowValue | null>(null);

const cancelTriggerButtonClassName =
	"inline-flex min-h-10 items-center justify-center gap-2 border-2 border-danger-text bg-background px-3 py-2 text-sm font-black text-danger-text transition-colors hover:bg-danger-bg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-60";
const cancelConfirmButtonClassName =
	"inline-flex min-h-10 items-center justify-center gap-2 border-2 border-danger-text bg-danger-text px-3 py-2 text-sm font-black text-danger-bg transition-colors hover:bg-danger-text/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-60";

function formatTemplate(
	template: string,
	values: Record<string, string | number>,
): string {
	return Object.entries(values).reduce(
		(result, [key, value]) => result.replace(`{${key}}`, String(value)),
		template,
	);
}

function getCancelBookingErrorMessage(
	error: ApiRequestError,
	copy: CancelBookingCopy["cancelErrors"],
): string {
	if (error.status === 401) {
		return copy.unauthorized;
	}
	if (error.status === 403) {
		return copy.forbidden;
	}
	if (error.status === 404) {
		return copy.notFound;
	}
	if (error.status === 409) {
		return copy.conflict;
	}

	return copy.fallback;
}

function useCancelBookingWorkflow(): CancelBookingWorkflowValue {
	const workflow = use(CancelBookingWorkflowContext);

	if (!workflow) {
		throw new Error(
			"Cancel booking actions must be rendered inside CancelBookingWorkflow",
		);
	}

	return workflow;
}

export function CancelBookingWorkflow({
	children,
	copy,
	onCancelled,
	onError,
}: CancelBookingWorkflowProps) {
	const { endSession } = useSession();
	const [activeBookingId, setActiveBookingId] = useState<string | null>(null);
	const [confirmationInput, setConfirmationInput] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	function resetConfirmation(): void {
		setActiveBookingId(null);
		setConfirmationInput("");
	}

	function openConfirmation(bookingId: string): void {
		if (isSubmitting) {
			return;
		}

		setActiveBookingId(bookingId);
		setConfirmationInput("");
	}

	function closeConfirmation(): void {
		if (!isSubmitting) {
			resetConfirmation();
		}
	}

	async function submit(bookingId: string): Promise<void> {
		const canSubmit =
			activeBookingId === bookingId &&
			confirmationInput.trim() === copy.actions.cancelKeyword;

		if (!canSubmit || isSubmitting) {
			return;
		}

		try {
			setIsSubmitting(true);
			const cancelledBooking = await cancelBooking(bookingId);
			resetConfirmation();
			onCancelled(cancelledBooking);
		} catch (error) {
			if (error instanceof ApiRequestError) {
				if (error.status === 401) {
					endSession();
				}

				onError(getCancelBookingErrorMessage(error, copy.cancelErrors));
			} else {
				onError(copy.cancelErrors.fallback);
			}
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<CancelBookingWorkflowContext
			value={{
				activeBookingId,
				closeConfirmation,
				confirmationInput,
				copy,
				isSubmitting,
				openConfirmation,
				setConfirmationInput,
				submit,
			}}
		>
			{children}
		</CancelBookingWorkflowContext>
	);
}

export function CancelBookingCardAction({ bookingId }: { bookingId: string }) {
	const {
		activeBookingId,
		closeConfirmation,
		confirmationInput,
		copy,
		isSubmitting,
		openConfirmation,
		setConfirmationInput,
		submit,
	} = useCancelBookingWorkflow();
	const isConfirmationOpen = activeBookingId === bookingId;
	const canSubmit = confirmationInput.trim() === copy.actions.cancelKeyword;

	if (!isConfirmationOpen) {
		return (
			<button
				type="button"
				disabled={isSubmitting}
				onClick={() => openConfirmation(bookingId)}
				className={cancelTriggerButtonClassName}
			>
				<TrashIcon className="size-4" aria-hidden="true" />
				{copy.actions.cancelBooking}
			</button>
		);
	}

	return (
		<div className="w-full border-t-2 border-primary pt-4">
			<p className="text-danger-text">
				{formatTemplate(copy.actions.cancelPrompt, {
					keyword: copy.actions.cancelKeyword,
				})}
			</p>
			<div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
					<TextInput
						value={confirmationInput}
						onChange={(event) => setConfirmationInput(event.target.value)}
						disabled={isSubmitting}
						placeholder={copy.actions.cancelKeyword}
						className="max-w-48"
					/>
					<button
						type="button"
						aria-label={copy.actions.cancelAriaLabel}
						className={cancelConfirmButtonClassName}
						disabled={!canSubmit || isSubmitting}
						onClick={() => void submit(bookingId)}
					>
						<TrashIcon className="size-4" aria-hidden="true" />
						{copy.actions.cancelConfirm}
					</button>
				</div>
				<Button
					type="button"
					variant="secondary"
					disabled={isSubmitting}
					onClick={closeConfirmation}
				>
					{copy.actions.cancelAbort}
				</Button>
			</div>
		</div>
	);
}

export function CancelBookingCompactAction({
	bookingId,
}: {
	bookingId: string;
}) {
	const {
		activeBookingId,
		closeConfirmation,
		confirmationInput,
		copy,
		isSubmitting,
		openConfirmation,
		setConfirmationInput,
		submit,
	} = useCancelBookingWorkflow();
	const isConfirmationOpen = activeBookingId === bookingId;
	const canSubmit = confirmationInput.trim() === copy.actions.cancelKeyword;

	return (
		<>
			{!isConfirmationOpen && (
				<button
					type="button"
					disabled={isSubmitting}
					onClick={() => openConfirmation(bookingId)}
					className={cancelTriggerButtonClassName}
				>
					<TrashIcon className="size-4" aria-hidden="true" />
					{copy.actions.cancelShort}
				</button>
			)}
			{isConfirmationOpen && (
				<div className="border-primary border-t-2 px-4 pb-4 pt-4 text-sm font-semibold">
					<p className="text-danger-text">
						{formatTemplate(copy.actions.cancelPrompt, {
							keyword: copy.actions.cancelKeyword,
						})}
					</p>
					<div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
						<div className="flex items-center gap-3">
							<TextInput
								value={confirmationInput}
								onChange={(event) => setConfirmationInput(event.target.value)}
								disabled={isSubmitting}
								placeholder={copy.actions.cancelKeyword}
								className="max-w-48"
							/>
							<button
								type="button"
								aria-label={copy.actions.cancelAriaLabel}
								className={cancelConfirmButtonClassName}
								disabled={!canSubmit || isSubmitting}
								onClick={() => void submit(bookingId)}
							>
								<TrashIcon className="size-4" aria-hidden="true" />
								{copy.actions.cancelConfirm}
							</button>
						</div>
						<Button
							type="button"
							variant="secondary"
							disabled={isSubmitting}
							onClick={closeConfirmation}
						>
							{copy.actions.cancelAbort}
						</Button>
					</div>
				</div>
			)}
		</>
	);
}
