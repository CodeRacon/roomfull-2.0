"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import { useSession } from "@/entities/session";
import {
	type AdminUnit,
	type AdminUnitContextArea,
	type AdminUnitContextUnitType,
	createAdminUnit,
	deactivateAdminUnit,
	formatUnitTypeName,
	updateAdminUnit,
} from "@/entities/unit";
import { ApiRequestError } from "@/shared/api";
import type { Dictionary } from "@/shared/i18n";
import {
	Button,
	Checkbox,
	FeedbackBox,
	Field,
	Panel,
	Select,
	Textarea,
	TextInput,
} from "@/shared/ui";

type AdminUnitFormMode = "create" | "edit";

type AdminUnitFormPanelProps = {
	areas: AdminUnitContextArea[];
	copy: Dictionary["adminWorkspaces"]["units"]["form"];
	mode: AdminUnitFormMode;
	onCancel: () => void;
	onSaved: (unit: AdminUnit) => void;
	unit?: AdminUnit | null;
	unitTypes: AdminUnitContextUnitType[];
};

type AdminUnitFormState = {
	name: string;
	descriptionDe: string;
	descriptionEn: string;
	capacity: string;
	unitTypeId: string;
	areaId: string;
	displayOrder: string;
	isActive: boolean;
};

type AdminUnitFormErrors = Partial<Record<keyof AdminUnitFormState, string>>;

function getInitialFormState(input: {
	unit?: AdminUnit | null;
	unitTypes: AdminUnitContextUnitType[];
}): AdminUnitFormState {
	const firstUnitTypeId = input.unitTypes[0]?.id ?? "";

	if (!input.unit) {
		return {
			name: "",
			descriptionDe: "",
			descriptionEn: "",
			capacity: "1",
			unitTypeId: firstUnitTypeId,
			areaId: "",
			displayOrder: "0",
			isActive: true,
		};
	}

	return {
		name: input.unit.name,
		descriptionDe: input.unit.descriptionDe ?? input.unit.description,
		descriptionEn: input.unit.descriptionEn ?? "",
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
	copy: Dictionary["adminWorkspaces"]["units"]["form"]["validation"];
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
		errors.name = input.copy.name;
	}

	if (input.formState.descriptionDe.trim().length === 0) {
		errors.descriptionDe = input.copy.descriptionDe;
	}

	if (input.formState.descriptionEn.trim().length === 0) {
		errors.descriptionEn = input.copy.descriptionEn;
	}

	if (!Number.isInteger(capacity) || capacity <= 0) {
		errors.capacity = input.copy.capacity;
	}

	if (input.formState.unitTypeId.length === 0) {
		errors.unitTypeId = input.copy.unitType;
	}

	if (unitTypeName === "HOT_DESK" && input.formState.areaId.length === 0) {
		errors.areaId = input.copy.area;
	}

	if (!Number.isInteger(displayOrder) || displayOrder < 0) {
		errors.displayOrder = input.copy.displayOrder;
	}

	return errors;
}

function hasErrors(errors: AdminUnitFormErrors): boolean {
	return Object.keys(errors).length > 0;
}

export function AdminUnitFormPanel({
	areas,
	copy,
	mode,
	onCancel,
	onSaved,
	unit,
	unitTypes,
}: AdminUnitFormPanelProps) {
	const { endSession } = useSession();
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
			descriptionDe: formState.descriptionDe.trim(),
			descriptionEn: formState.descriptionEn.trim(),
			capacity: Number(formState.capacity),
			isActive: formState.isActive,
			unitTypeId: formState.unitTypeId,
			areaId: formState.areaId.length > 0 ? formState.areaId : undefined,
			displayOrder: Number(formState.displayOrder),
		};
	}

	async function runUnitAction(action: () => Promise<AdminUnit>) {
		try {
			setIsSubmitting(true);
			setSubmitError(null);

			const savedUnit = await action();
			onSaved(savedUnit);
		} catch (error) {
			if (error instanceof ApiRequestError) {
				if (error.status === 401) {
					endSession();
					return;
				}

				if (error.status === 400) {
					setSubmitError(copy.errors.badRequest);
					return;
				}

				if (error.status === 404) {
					setSubmitError(copy.errors.notFound);
					return;
				}

				if (error.status === 409) {
					setSubmitError(copy.errors.conflict);
					return;
				}

				setSubmitError(copy.errors.fallback);
				return;
			}

			setSubmitError(copy.errors.fallback);
		} finally {
			setIsSubmitting(false);
		}
	}

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		const nextErrors = validateForm({
			copy: copy.validation,
			formState,
			unitTypes,
		});
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
			setSubmitError(copy.errors.noSelection);
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

	const title = mode === "create" ? copy.titleCreate : copy.titleEdit;

	return (
		<Panel className="mt-8 border-primary!">
			<div className="flex flex-wrap items-start justify-between gap-3">
				<div>
					<h2 className="text-lg font-semibold">{title}</h2>
					<p className="mt-1 text-sm text-muted">
						{mode === "create" ? copy.descriptionCreate : unit?.name}
					</p>
				</div>
				<Button variant="secondary" onClick={onCancel}>
					{copy.close}
				</Button>
			</div>

			{submitError && (
				<FeedbackBox variant="error" className="mt-5">
					{submitError}
				</FeedbackBox>
			)}

			<form className="mt-5 grid gap-2" onSubmit={handleSubmit}>
				<div className="grid gap-2 md:grid-cols-2">
					<Field
						label={copy.fields.name}
						htmlFor="admin-unit-name"
						errorText={errors.name}
					>
						<TextInput
							id="admin-unit-name"
							value={formState.name}
							invalid={Boolean(errors.name)}
							onChange={(event) => updateField("name", event.target.value)}
						/>
					</Field>
					<Field
						label={copy.fields.capacity}
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

				<div className="grid gap-2 md:grid-cols-2">
					<Field
						label={copy.fields.descriptionDe}
						htmlFor="admin-unit-description-de"
						errorText={errors.descriptionDe}
					>
						<Textarea
							id="admin-unit-description-de"
							name="descriptionDe"
							autoComplete="off"
							className="min-h-28"
							value={formState.descriptionDe}
							invalid={Boolean(errors.descriptionDe)}
							onChange={(event) =>
								updateField("descriptionDe", event.target.value)
							}
						/>
					</Field>
					<Field
						label={copy.fields.descriptionEn}
						htmlFor="admin-unit-description-en"
						errorText={errors.descriptionEn}
					>
						<Textarea
							id="admin-unit-description-en"
							name="descriptionEn"
							autoComplete="off"
							className="min-h-28"
							value={formState.descriptionEn}
							invalid={Boolean(errors.descriptionEn)}
							onChange={(event) =>
								updateField("descriptionEn", event.target.value)
							}
						/>
					</Field>
				</div>

				<div className="grid gap-2 md:grid-cols-3">
					<Field
						label={copy.fields.unitType}
						htmlFor="admin-unit-type"
						errorText={errors.unitTypeId}
					>
						<Select
							id="admin-unit-type"
							name="unitTypeId"
							value={formState.unitTypeId}
							invalid={Boolean(errors.unitTypeId)}
							options={unitTypes.map((unitType) => ({
								label: formatUnitTypeName(unitType.name),
								value: unitType.id,
							}))}
							onValueChange={(value) => updateField("unitTypeId", value)}
						/>
					</Field>
					<Field
						label={copy.fields.area}
						htmlFor="admin-unit-area"
						errorText={errors.areaId}
					>
						<Select
							id="admin-unit-area"
							name="areaId"
							value={formState.areaId}
							invalid={Boolean(errors.areaId)}
							options={[
								{
									value: "",
									label:
										selectedUnitTypeName === "HOT_DESK"
											? copy.areaSelect
											: copy.noArea,
								},
								...areas.map((area) => ({
									label: area.name,
									value: area.id,
								})),
							]}
							onValueChange={(value) => updateField("areaId", value)}
						/>
					</Field>
					<Field
						label={copy.fields.displayOrder}
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
					<Checkbox
						name="isActive"
						label={copy.fields.active}
						checked={formState.isActive}
						onChange={(event) => updateField("isActive", event.target.checked)}
					/>
				</Field>

				<div className="flex flex-wrap items-center justify-between gap-3 border-border border-t pt-5">
					<div className="flex flex-wrap gap-2">
						<Button type="submit" disabled={isSubmitting}>
							{mode === "create" ? copy.create : copy.save}
						</Button>
						<Button
							type="button"
							variant="secondary"
							disabled={isSubmitting}
							onClick={onCancel}
						>
							{copy.cancel}
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
									{copy.deactivate}
								</Button>
							) : (
								<Button
									type="button"
									variant="secondary"
									disabled={isSubmitting}
									onClick={handleReactivate}
								>
									{copy.reactivate}
								</Button>
							)}
						</div>
					)}
				</div>
			</form>
		</Panel>
	);
}
