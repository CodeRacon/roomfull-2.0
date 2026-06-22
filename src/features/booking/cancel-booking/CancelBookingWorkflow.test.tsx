import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Booking } from "@/entities/booking";
import { ApiRequestError } from "@/shared/api";
import { getDictionary } from "@/shared/i18n";
import {
	CancelBookingCardAction,
	CancelBookingCompactAction,
	CancelBookingWorkflow,
} from ".";

const copy = (await getDictionary("en")).myBookings;

const mocks = vi.hoisted(() => ({
	cancelBooking: vi.fn(),
	endSession: vi.fn(),
}));

vi.mock("@/entities/booking", () => ({
	cancelBooking: mocks.cancelBooking,
}));

vi.mock("@/entities/session", () => ({
	useSession: () => ({ endSession: mocks.endSession }),
}));

vi.mock("@public/icons/general/ic-trash.svg", () => ({
	default: () => <svg aria-hidden="true" />,
}));

const cancelledBooking: Booking = {
	id: "booking-card",
	userId: "user-1",
	unitId: "unit-1",
	startTime: "2026-07-01T07:00:00.000Z",
	endTime: "2026-07-01T08:00:00.000Z",
	status: "CANCELLED",
	createdAt: "2026-06-01T08:00:00.000Z",
	updatedAt: "2026-06-22T08:00:00.000Z",
};

function renderWorkflow(key = "cards") {
	const onCancelled = vi.fn();
	const onError = vi.fn();
	const view = (
		<CancelBookingWorkflow
			key={key}
			copy={copy}
			onCancelled={onCancelled}
			onError={onError}
		>
			<CancelBookingCardAction bookingId="booking-card" />
			<CancelBookingCompactAction bookingId="booking-compact" />
		</CancelBookingWorkflow>
	);
	const result = render(view);

	return { ...result, onCancelled, onError };
}

function openCardConfirmation(): HTMLInputElement {
	fireEvent.click(screen.getByRole("button", { name: "Cancel booking" }));
	return screen.getByPlaceholderText("CANCEL") as HTMLInputElement;
}

describe("Cancel Booking Confirmation Workflow", () => {
	beforeEach(() => {
		mocks.cancelBooking.mockReset();
		mocks.endSession.mockReset();
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it("shares one confirmation and clears the keyword when another Booking opens", () => {
		renderWorkflow();
		const input = openCardConfirmation();
		fireEvent.change(input, { target: { value: "CANCEL" } });

		fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

		const compactInput = screen.getByPlaceholderText(
			"CANCEL",
		) as HTMLInputElement;
		expect(screen.getAllByPlaceholderText("CANCEL")).toHaveLength(1);
		expect(compactInput.value).toBe("");
	});

	it("requires the confirmation keyword before submitting", () => {
		renderWorkflow();
		const input = openCardConfirmation();
		const confirmButton = screen.getByRole("button", {
			name: "Cancel booking",
		}) as HTMLButtonElement;

		expect(confirmButton.disabled).toBe(true);
		fireEvent.change(input, { target: { value: "wrong" } });
		expect(confirmButton.disabled).toBe(true);
		fireEvent.change(input, { target: { value: "CANCEL" } });
		expect(confirmButton.disabled).toBe(false);
	});

	it("closes the confirmation and reports a successful cancellation", async () => {
		mocks.cancelBooking.mockResolvedValue(cancelledBooking);
		const { onCancelled } = renderWorkflow();
		const input = openCardConfirmation();
		fireEvent.change(input, { target: { value: "CANCEL" } });
		fireEvent.click(screen.getByRole("button", { name: "Cancel booking" }));

		await waitFor(() =>
			expect(onCancelled).toHaveBeenCalledWith(cancelledBooking),
		);
		expect(screen.queryByPlaceholderText("CANCEL")).toBeNull();
	});

	it("keeps retry state after a recoverable cancellation error", async () => {
		mocks.cancelBooking.mockRejectedValueOnce(
			new ApiRequestError("Conflict", 409),
		);
		const { onCancelled, onError } = renderWorkflow();
		const input = openCardConfirmation();
		fireEvent.change(input, { target: { value: "CANCEL" } });
		fireEvent.click(screen.getByRole("button", { name: "Cancel booking" }));

		await waitFor(() =>
			expect(onError).toHaveBeenCalledWith(copy.cancelErrors.conflict),
		);
		expect(
			(screen.getByPlaceholderText("CANCEL") as HTMLInputElement).value,
		).toBe("CANCEL");

		mocks.cancelBooking.mockResolvedValueOnce(cancelledBooking);
		fireEvent.click(screen.getByRole("button", { name: "Cancel booking" }));
		await waitFor(() =>
			expect(onCancelled).toHaveBeenCalledWith(cancelledBooking),
		);
	});

	it("ends the Frontend Session after an unauthorized cancellation", async () => {
		mocks.cancelBooking.mockRejectedValueOnce(
			new ApiRequestError("Unauthorized", 401),
		);
		const { onError } = renderWorkflow();
		const input = openCardConfirmation();
		fireEvent.change(input, { target: { value: "CANCEL" } });
		fireEvent.click(screen.getByRole("button", { name: "Cancel booking" }));

		await waitFor(() => expect(mocks.endSession).toHaveBeenCalledOnce());
		expect(onError).toHaveBeenCalledWith(copy.cancelErrors.unauthorized);
	});

	it("resets confirmation state when the Workflow remounts", () => {
		const { rerender, onCancelled, onError } = renderWorkflow("cards");
		const input = openCardConfirmation();
		fireEvent.change(input, { target: { value: "CANCEL" } });

		rerender(
			<CancelBookingWorkflow
				key="list"
				copy={copy}
				onCancelled={onCancelled}
				onError={onError}
			>
				<CancelBookingCardAction bookingId="booking-card" />
				<CancelBookingCompactAction bookingId="booking-compact" />
			</CancelBookingWorkflow>,
		);

		expect(screen.queryByPlaceholderText("CANCEL")).toBeNull();
	});
});
