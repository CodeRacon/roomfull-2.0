import type {
	AdminUnitContextUnitType,
	AdminUnitStatusFilter,
	Unit,
	UnitTypeName,
} from "@/entities/unit";
import { formatUnitTypeName } from "@/entities/unit";
import { Badge, FeedbackBox, Panel, TextInput } from "@/shared/ui";

type AdminUnitsTableProps = {
	filters: {
		status: AdminUnitStatusFilter;
		unitType: UnitTypeName | "all";
		search: string;
	};
	onEditUnit: (unit: Unit) => void;
	onFiltersChange: (filters: AdminUnitsTableProps["filters"]) => void;
	unitTypes: AdminUnitContextUnitType[];
	units: Unit[];
};

const statusFilters: {
	label: string;
	value: AdminUnitStatusFilter;
}[] = [
	{ label: "Aktiv", value: "active" },
	{ label: "Deaktiviert", value: "deactivated" },
	{ label: "Alle", value: "all" },
];

function getStatusBadge(unit: Unit) {
	return unit.isActive ? (
		<Badge variant="success">Aktiv</Badge>
	) : (
		<Badge variant="muted">Deaktiviert</Badge>
	);
}

function formatArea(unit: Unit): string {
	return unit.area?.name ?? "-";
}

export function AdminUnitsTable({
	filters,
	onEditUnit,
	onFiltersChange,
	unitTypes,
	units,
}: AdminUnitsTableProps) {
	function updateFilters(
		nextFilters: Partial<AdminUnitsTableProps["filters"]>,
	) {
		onFiltersChange({ ...filters, ...nextFilters });
	}

	return (
		<Panel className="mt-8">
			<div className="flex flex-wrap items-end justify-between gap-4">
				<div>
					<h2 className="text-lg font-semibold">Unit-Inventar</h2>
					<p className="mt-1 text-sm text-muted">
						{units.length} Units in der aktuellen Ansicht
					</p>
				</div>
				<div className="grid w-full gap-3 md:w-auto md:grid-cols-[auto_13rem_16rem] md:items-end">
					<div className="flex flex-wrap gap-2">
						{statusFilters.map((statusFilter) => {
							const isSelected = filters.status === statusFilter.value;

							return (
								<button
									key={statusFilter.value}
									type="button"
									className={`min-h-10 rounded-md border px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus ${
										isSelected
											? "border-secondary bg-secondary text-white"
											: "border-border bg-surface text-text hover:bg-surface-muted"
									}`}
									aria-pressed={isSelected}
									onClick={() => updateFilters({ status: statusFilter.value })}
								>
									{statusFilter.label}
								</button>
							);
						})}
					</div>
					<label className="block">
						<span className="mb-1 block text-xs font-semibold text-muted">
							UnitType
						</span>
						<select
							className="min-h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text transition-colors hover:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
							value={filters.unitType}
							onChange={(event) =>
								updateFilters({
									unitType: event.target.value as UnitTypeName | "all",
								})
							}
						>
							<option value="all">Alle UnitTypes</option>
							{unitTypes.map((unitType) => (
								<option key={unitType.id} value={unitType.name}>
									{formatUnitTypeName(unitType.name)}
								</option>
							))}
						</select>
					</label>
					<div className="block">
						<label
							htmlFor="admin-unit-search"
							className="mb-1 block text-xs font-semibold text-muted"
						>
							Name
						</label>
						<TextInput
							id="admin-unit-search"
							value={filters.search}
							placeholder="Unit suchen"
							onChange={(event) =>
								updateFilters({ search: event.target.value })
							}
						/>
					</div>
				</div>
			</div>

			{units.length === 0 ? (
				<FeedbackBox variant="empty" className="mt-6">
					Keine Units für die gewählten Filter.
				</FeedbackBox>
			) : (
				<div className="mt-6 overflow-x-auto">
					<table className="w-full min-w-[52rem] border-collapse text-left text-sm">
						<thead>
							<tr className="border-border-muted border-b text-xs font-semibold text-muted uppercase">
								<th className="py-3 pr-4">Name</th>
								<th className="px-4 py-3">UnitType</th>
								<th className="px-4 py-3">Area</th>
								<th className="px-4 py-3">Kapazität</th>
								<th className="px-4 py-3">Status</th>
								<th className="px-4 py-3">DisplayOrder</th>
								<th className="py-3 pl-4">Aktionen</th>
							</tr>
						</thead>
						<tbody>
							{units.map((unit) => (
								<tr
									key={unit.id}
									className="border-border-muted border-b last:border-b-0"
								>
									<td className="max-w-64 py-4 pr-4 align-top">
										<p className="truncate font-semibold text-text">
											{unit.name}
										</p>
										<p className="mt-1 line-clamp-2 text-xs text-muted">
											{unit.description}
										</p>
									</td>
									<td className="px-4 py-4 align-top">
										{formatUnitTypeName(unit.unitType.name)}
									</td>
									<td className="px-4 py-4 align-top">{formatArea(unit)}</td>
									<td className="px-4 py-4 align-top tabular-nums">
										{unit.capacity}
									</td>
									<td className="px-4 py-4 align-top">
										{getStatusBadge(unit)}
									</td>
									<td className="px-4 py-4 align-top tabular-nums">
										{unit.displayOrder}
									</td>
									<td className="py-4 pl-4 align-top">
										<button
											type="button"
											className="rounded-md border border-border bg-surface px-3 py-2 text-sm font-semibold text-primary transition-colors hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
											onClick={() => onEditUnit(unit)}
										>
											Bearbeiten
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</Panel>
	);
}
