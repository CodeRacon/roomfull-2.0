"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "@/entities/session";
import {
	type AdminUnit,
	type AdminUnitContextUnitType,
	type AdminUnitStatusFilter,
	getAdminUnitContext,
	listAdminUnits,
	type UnitTypeName,
} from "@/entities/unit";
import { AdminUnitFormPanel } from "@/features/admin/manage-unit";
import { RequireAuth } from "@/features/auth/require-auth";
import { ApiRequestError } from "@/shared/api";
import type { Dictionary } from "@/shared/i18n";
import { Button, FeedbackBox, Panel } from "@/shared/ui";
import { AdminUnitsTable } from "@/widgets/admin-units-table";

type AdminUnitFilters = {
	status: AdminUnitStatusFilter;
	unitType: UnitTypeName | "all";
	search: string;
};

const defaultFilters: AdminUnitFilters = {
	status: "active",
	unitType: "all",
	search: "",
};

function getUnitTypeFilter(
	unitType: UnitTypeName | "all",
): UnitTypeName | undefined {
	return unitType === "all" ? undefined : unitType;
}

type AdminUnitsPageClientProps = {
	copy: Dictionary["adminWorkspaces"]["units"];
};

export function AdminUnitsPageClient({ copy }: AdminUnitsPageClientProps) {
	const { status, endSession } = useSession();
	const [filters, setFilters] = useState<AdminUnitFilters>(defaultFilters);
	const [unitTypes, setUnitTypes] = useState<AdminUnitContextUnitType[]>([]);
	const [areas, setAreas] = useState<
		Awaited<ReturnType<typeof getAdminUnitContext>>["areas"]
	>([]);
	const [units, setUnits] = useState<AdminUnit[]>([]);
	const [selectedUnit, setSelectedUnit] = useState<AdminUnit | null>(null);
	const [formMode, setFormMode] = useState<"create" | "edit" | null>(null);
	const [isContextLoading, setIsContextLoading] = useState(true);
	const [isUnitsLoading, setIsUnitsLoading] = useState(true);
	const [hasLoadedUnits, setHasLoadedUnits] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	useEffect(() => {
		if (status !== "authenticated") {
			return;
		}

		async function loadContext(): Promise<void> {
			try {
				setIsContextLoading(true);
				setErrorMessage(null);

				const context = await getAdminUnitContext();
				setUnitTypes(context.unitTypes);
				setAreas(context.areas);
			} catch (error) {
				if (error instanceof ApiRequestError) {
					if (error.status === 401) {
						endSession();
						return;
					}

					if (error.status === 403) {
						setErrorMessage(copy.errors.forbidden);
						return;
					}
				}

				setErrorMessage(copy.errors.contextFallback);
			} finally {
				setIsContextLoading(false);
			}
		}

		void loadContext();
	}, [status, endSession, copy.errors.forbidden, copy.errors.contextFallback]);

	const loadUnits = useCallback(async (): Promise<void> => {
		if (status !== "authenticated") {
			return;
		}

		try {
			setIsUnitsLoading(true);
			setErrorMessage(null);

			const adminUnits = await listAdminUnits({
				status: filters.status,
				unitType: getUnitTypeFilter(filters.unitType),
				search: filters.search,
			});

			setUnits(adminUnits);
			setHasLoadedUnits(true);
		} catch (error) {
			if (error instanceof ApiRequestError) {
				if (error.status === 401) {
					endSession();
					return;
				}

				if (error.status === 403) {
					setErrorMessage(copy.errors.forbidden);
					return;
				}
			}

			setErrorMessage(copy.errors.listFallback);
		} finally {
			setIsUnitsLoading(false);
		}
	}, [
		filters.search,
		filters.status,
		filters.unitType,
		status,
		endSession,
		copy.errors.forbidden,
		copy.errors.listFallback,
	]);

	useEffect(() => {
		void loadUnits();
	}, [loadUnits]);

	const isInitialLoading = isContextLoading || !hasLoadedUnits;

	function openCreatePanel(): void {
		setSelectedUnit(null);
		setFormMode("create");
	}

	function openEditPanel(unit: AdminUnit): void {
		setSelectedUnit(unit);
		setFormMode("edit");
	}

	function closeFormPanel(): void {
		setSelectedUnit(null);
		setFormMode(null);
	}

	function handleUnitSaved(): void {
		closeFormPanel();
		void loadUnits();
	}

	return (
		<RequireAuth allowedRoles={["ADMIN"]}>
			<div className="mt-8 flex justify-end">
				<Button disabled={isContextLoading} onClick={openCreatePanel}>
					{copy.newUnit}
				</Button>
			</div>
			{formMode && (
				<AdminUnitFormPanel
					areas={areas}
					copy={copy.form}
					mode={formMode}
					onCancel={closeFormPanel}
					onSaved={handleUnitSaved}
					unit={selectedUnit}
					unitTypes={unitTypes}
				/>
			)}
			{(isInitialLoading || isUnitsLoading) && (
				<Panel className="mt-8">{copy.loading}</Panel>
			)}
			{errorMessage && (
				<FeedbackBox variant="error" className="mt-8">
					{errorMessage}
				</FeedbackBox>
			)}
			{!isInitialLoading && !errorMessage && (
				<AdminUnitsTable
					copy={copy.table}
					filters={filters}
					onEditUnit={openEditPanel}
					onFiltersChange={setFilters}
					unitTypes={unitTypes}
					units={units}
				/>
			)}
		</RequireAuth>
	);
}
