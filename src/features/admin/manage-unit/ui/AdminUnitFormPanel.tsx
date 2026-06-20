"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import {
	type AdminUnitContextArea,
	type AdminUnitContextUnitType,
	createAdminUnit,
	deactivateAdminUnit,
	formatUnitTypeName,
	type Unit,
	updateAdminUnit,
} from "@/entities/unit";
import { ApiRequestError } from "@/shared/api";
import { Button, FeedbackBox, Field, Panel, TextInput } from "@/shared/ui";

type AdminUnitFormMode = "create" | "edit";

type AdminUnitFormPanelProps = {
	areas: AdminUnitContextArea[];
	mode: AdminUnitFormMode;
	onCancel: () => void;
	onSaved: (unit: Unit) => void;
	unit?: Unit | null;
	unitTypes: AdminUnitContextUnitType[];
};

type AdminUnitFormState = {
	name: string;
	description: string;
	capacity: string;
	unitTypeId: string;
	areaId: string;
	displayOrder: string;
	isActive: boolean;
};

type AdminUnitFormErrors = Partial<Record<keyof AdminUnitFormState, string>>;

function getInitialFormState(input: {
	unit?: Unit | null;
	unitTypes: AdminUnitContextUnitType[];
}): AdminUnitFormState {
	const firstUnitTypeId = input.unitTypes[0]?.id ?? "";

	if (!input.unit) {
		return {
			name: "",
			description: "",
			capacity: "1",
			unitTypeId: firstUnitTypeId,
			areaId: "",
			displayOrder: "0",
			isActive: true,
		};
	}

	return {
		name: input.unit.name,
		description: input.unit.description,
		capacity: String(input.unit.capacity),
		unitTypeId: input.unit.unitTypeId,
		areaId: input.unit.areaId ?? "",
		displayOrder: String(input.unit.displayOrder),
		isActive: input.unit.isActive,
	};
}

function getUnitTypeNameById(
	unitTypes: AdminUnitContextUnitType[],
	unitTypeId: string,
) {
	return unitTypes.find((unitType) => unitType.id === unitTypeId)?.name;
}

function validateForm(input: {
	formState: AdminUnitFormState;
	unitTypes: AdminUnitContextUnitType[];
}): AdminUnitFormErrors {
	const errors: AdminUnitFormErrors = {};
	const capacity = Number(input.formState.capacity);
	const displayOrder = Number(input.formState.displayOrder);
	const unitTypeName = getUnitTypeNameById(
		input.unitTypes,
		input.formState.unitTypeId,
	);

	if (input.formState.name.trim().length === 0) {
		errors.name = "Name darf nicht leer sein.";
	}

	if (input.formState.description.trim().length === 0) {
		errors.description = "Beschreibung darf nicht leer sein.";
	}

	if (!Number.isInteger(capacity) || capacity <= 0) {
		errors.capacity = "Kapazität muss größer als 0 sein.";
	}

	if (input.formState.unitTypeId.length === 0) {
		errors.unitTypeId = "UnitType ist erforderlich.";
	}

	if (unitTypeName === "HOT_DESK" && input.formState.areaId.length === 0) {
		errors.areaId = "Hot Desk braucht eine Area.";
	}

	if (!Number.isInteger(displayOrder) || displayOrder < 0) {
		errors.displayOrder = "DisplayOrder muss mindestens 0 sein.";
	}

	return errors;
}

function hasErrors(errors: AdminUnitFormErrors): boolean {
	return Object.keys(errors).length > 0;
}

export function AdminUnitFormPanel({
	areas,
	mode,
	onCancel,
	onSaved,
	unit,
	unitTypes,
}: AdminUnitFormPanelProps) {
	const [formState, setFormState] = useState<AdminUnitFormState>(() =>
		getInitialFormState({ unit, unitTypes }),
	);
	const [errors, setErrors] = useState<AdminUnitFormErrors>({});
	const [submitError, setSubmitError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		setFormState(getInitialFormState({ unit, unitTypes }));
		setErrors({});
		setSubmitError(null);
	}, [unit, unitTypes]);

	const selectedUnitTypeName = useMemo(
		() => getUnitTypeNameById(unitTypes, formState.unitTypeId),
		[formState.unitTypeId, unitTypes],
	);

	function updateField<TField extends keyof AdminUnitFormState>(
		field: TField,
		value: AdminUnitFormState[TField],
	) {
		setFormState((currentFormState) => ({
			...currentFormState,
			[field]: value,
		}));
	}

	function getPayload() {
		return {
			name: formState.name.trim(),
			description: formState.description.trim(),
			capacity: Number(formState.capacity),
			isActive: formState.isActive,
			unitTypeId: formState.unitTypeId,
			areaId: formState.areaId.length > 0 ? formState.areaId : undefined,
			displayOrder: Number(formState.displayOrder),
		};
	}

	async function runUnitAction(action: () => Promise<Unit>) {
		try {
			setIsSubmitting(true);
			setSubmitError(null);

			const savedUnit = await action();
			onSaved(savedUnit);
		} catch (error) {
			if (error instanceof ApiRequestError) {
				setSubmitError(error.message);
				return;
			}

			setSubmitError("Die Unit konnte nicht gespeichert werden.");
		} finally {
			setIsSubmitting(false);
		}
	}

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		const nextErrors = validateForm({ formState, unitTypes });
		setErrors(nextErrors);

		if (hasErrors(nextErrors)) {
			return;
		}

		const payload = getPayload();

		if (mode === "create") {
			void runUnitAction(() => createAdminUnit(payload));
			return;
		}

		if (!unit) {
			setSubmitError("Keine Unit zum Bearbeiten ausgewählt.");
			return;
		}

		void runUnitAction(() =>
			updateAdminUnit({
				unitId: unit.id,
				values: {
					...payload,
					areaId: payload.areaId ?? null,
				},
			}),
		);
	}

	function handleDeactivate() {
		if (!unit) {
			return;
		}

		void runUnitAction(() => deactivateAdminUnit(unit.id));
	}

	function handleReactivate() {
		if (!unit) {
			return;
		}

		void runUnitAction(() =>
			updateAdminUnit({
				unitId: unit.id,
				values: { isActive: true },
			}),
		);
	}

	const title = mode === "create" ? "Unit anlegen" : "Unit bearbeiten";

	return (
		<Panel className="mt-8">
			<div className="flex flex-wrap items-start justify-between gap-3">
				<div>
					<h2 className="text-lg font-semibold">{title}</h2>
					<p className="mt-1 text-sm text-muted">
						{mode === "create"
							? "Neue BookableUnit für das Inventar erfassen."
							: unit?.name}
					</p>
				</div>
				<Button variant="secondary" onClick={onCancel}>
					Schließen
				</Button>
			</div>

			{submitError && (
				<FeedbackBox variant="error" className="mt-5">
					{submitError}
				</FeedbackBox>
			)}

			<form className="mt-5 grid gap-2" onSubmit={handleSubmit}>
				<div className="grid gap-2 md:grid-cols-2">
					<Field label="Name" htmlFor="admin-unit-name" errorText={errors.name}>
						<TextInput
							id="admin-unit-name"
							value={formState.name}
							invalid={Boolean(errors.name)}
							onChange={(event) => updateField("name", event.target.value)}
						/>
					</Field>
					<Field
						label="Kapazität"
						htmlFor="admin-unit-capacity"
						errorText={errors.capacity}
					>
						<TextInput
							id="admin-unit-capacity"
							type="number"
							min={1}
							step={1}
							value={formState.capacity}
							invalid={Boolean(errors.capacity)}
							onChange={(event) => updateField("capacity", event.target.value)}
						/>
					</Field>
				</div>

				<Field
					label="Beschreibung"
					htmlFor="admin-unit-description"
					errorText={errors.description}
				>
					<textarea
						id="admin-unit-description"
						className="min-h-28 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text shadow-xs transition-colors placeholder:text-muted hover:border-primary focus-visible:outline-1 focus-visible:outline-focus"
						value={formState.description}
						aria-invalid={Boolean(errors.description) || undefined}
						onChange={(event) => updateField("description", event.target.value)}
					/>
				</Field>

				<div className="grid gap-2 md:grid-cols-3">
					<Field
						label="UnitType"
						htmlFor="admin-unit-type"
						errorText={errors.unitTypeId}
					>
						<select
							id="admin-unit-type"
							className="min-h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text transition-colors hover:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
							value={formState.unitTypeId}
							aria-invalid={Boolean(errors.unitTypeId) || undefined}
							onChange={(event) =>
								updateField("unitTypeId", event.target.value)
							}
						>
							{unitTypes.map((unitType) => (
								<option key={unitType.id} value={unitType.id}>
									{formatUnitTypeName(unitType.name)}
								</option>
							))}
						</select>
					</Field>
					<Field
						label="Area"
						htmlFor="admin-unit-area"
						errorText={errors.areaId}
					>
						<select
							id="admin-unit-area"
							className="min-h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text transition-colors hover:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
							value={formState.areaId}
							aria-invalid={Boolean(errors.areaId) || undefined}
							onChange={(event) => updateField("areaId", event.target.value)}
						>
							<option value="">
								{selectedUnitTypeName === "HOT_DESK"
									? "Area auswählen"
									: "Keine Area"}
							</option>
							{areas.map((area) => (
								<option key={area.id} value={area.id}>
									{area.name}
								</option>
							))}
						</select>
					</Field>
					<Field
						label="DisplayOrder"
						htmlFor="admin-unit-display-order"
						errorText={errors.displayOrder}
					>
						<TextInput
							id="admin-unit-display-order"
							type="number"
							min={0}
							step={1}
							value={formState.displayOrder}
							invalid={Boolean(errors.displayOrder)}
							onChange={(event) =>
								updateField("displayOrder", event.target.value)
							}
						/>
					</Field>
				</div>

				<Field>
					<label className="inline-flex items-center gap-3 text-sm font-semibold text-text">
						<input
							type="checkbox"
							className="size-4 rounded border-border text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
							checked={formState.isActive}
							onChange={(event) =>
								updateField("isActive", event.target.checked)
							}
						/>
						Aktiv
					</label>
				</Field>

				<div className="flex flex-wrap items-center justify-between gap-3 border-border border-t pt-5">
					<div className="flex flex-wrap gap-2">
						<Button type="submit" disabled={isSubmitting}>
							{mode === "create" ? "Unit anlegen" : "Änderungen speichern"}
						</Button>
						<Button
							type="button"
							variant="secondary"
							disabled={isSubmitting}
							onClick={onCancel}
						>
							Abbrechen
						</Button>
					</div>
					{mode === "edit" && unit && (
						<div>
							{unit.isActive ? (
								<Button
									type="button"
									variant="danger"
									disabled={isSubmitting}
									onClick={handleDeactivate}
								>
									Unit deaktivieren
								</Button>
							) : (
								<Button
									type="button"
									variant="secondary"
									disabled={isSubmitting}
									onClick={handleReactivate}
								>
									Unit reaktivieren
								</Button>
							)}
						</div>
					)}
				</div>
			</form>
		</Panel>
	);
}
