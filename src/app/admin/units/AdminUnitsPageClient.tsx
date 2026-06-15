"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "@/entities/session";
import {
	type AdminUnitContextUnitType,
	type AdminUnitStatusFilter,
	getAdminUnitContext,
	listAdminUnits,
	type Unit,
	type UnitTypeName,
} from "@/entities/unit";
import { AdminUnitFormPanel } from "@/features/admin/manage-unit";
import { RequireAuth } from "@/features/auth/require-auth";
import { ApiRequestError } from "@/shared/api";
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

export function AdminUnitsPageClient() {
	const { status, endSession } = useSession();
	const [filters, setFilters] = useState<AdminUnitFilters>(defaultFilters);
	const [unitTypes, setUnitTypes] = useState<AdminUnitContextUnitType[]>([]);
	const [areas, setAreas] = useState<
		Awaited<ReturnType<typeof getAdminUnitContext>>["areas"]
	>([]);
	const [units, setUnits] = useState<Unit[]>([]);
	const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
	const [formMode, setFormMode] = useState<"create" | "edit" | null>(null);
	const [isContextLoading, setIsContextLoading] = useState(true);
	const [isUnitsLoading, setIsUnitsLoading] = useState(true);
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
						setErrorMessage("Du hast keine Berechtigung für diesen Bereich.");
						return;
					}

					setErrorMessage(error.message);
					return;
				}

				setErrorMessage("Der Unit-Kontext konnte nicht geladen werden.");
			} finally {
				setIsContextLoading(false);
			}
		}

		void loadContext();
	}, [status, endSession]);

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

			setErrorMessage("Die Units konnten nicht geladen werden.");
		} finally {
			setIsUnitsLoading(false);
		}
	}, [filters.search, filters.status, filters.unitType, status, endSession]);

	useEffect(() => {
		void loadUnits();
	}, [loadUnits]);

	const isLoading = isContextLoading || isUnitsLoading;

	function openCreatePanel(): void {
		setSelectedUnit(null);
		setFormMode("create");
	}

	function openEditPanel(unit: Unit): void {
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
					Neue Unit
				</Button>
			</div>
			{formMode && (
				<AdminUnitFormPanel
					areas={areas}
					mode={formMode}
					onCancel={closeFormPanel}
					onSaved={handleUnitSaved}
					unit={selectedUnit}
					unitTypes={unitTypes}
				/>
			)}
			{isLoading && <Panel className="mt-8">Units werden geladen...</Panel>}
			{errorMessage && (
				<FeedbackBox variant="error" className="mt-8">
					{errorMessage}
				</FeedbackBox>
			)}
			{!isLoading && !errorMessage && (
				<AdminUnitsTable
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
