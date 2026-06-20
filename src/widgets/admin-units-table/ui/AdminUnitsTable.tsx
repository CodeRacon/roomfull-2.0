import { clsx } from "clsx";
import type {
	AdminUnitContextUnitType,
	AdminUnitStatusFilter,
	Unit,
	UnitTypeName,
} from "@/entities/unit";
import { formatUnitTypeName } from "@/entities/unit";
import { Badge, FeedbackBox, TextInput } from "@/shared/ui";

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
		<Badge variant="danger">Deaktiviert</Badge>
	);
}

function formatArea(unit: Unit): string {
	return unit.area?.name ?? "-";
}

function getStatusFilterSelectedClassName(
	status: AdminUnitStatusFilter,
): string {
	switch (status) {
		case "active":
			return "bg-success-bg text-success-text";
		case "deactivated":
			return "bg-danger-bg text-danger-text";
		case "all":
			return "bg-primary text-on-primary";
	}
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
		<section className="mt-8">
			<div className="border-primary border-y-4 bg-primary">
				<div className="grid md:grid-cols-[minmax(0,1fr)_auto]">
					<div className="flex min-h-20 min-w-0 flex-col justify-center bg-primary px-4 py-3 text-on-primary">
						<h2 className="min-w-0 text-xl font-black leading-tight text-pretty md:text-2xl">
							Unit-Inventar
						</h2>
						<p className="mt-1 truncate text-sm font-semibold text-on-primary/75">
							Filtere nach Status, UnitType oder Name.
						</p>
					</div>
					<div className="mx-1 mb-0 flex min-h-14 items-center bg-on-primary px-4 py-3 text-sm font-black text-primary md:mx-0 md:mr-1">
						{units.length} Units
					</div>
				</div>
			</div>
			<div className="border-primary border-x-2 bg-background p-5">
				<div className="grid w-full gap-3 lg:grid-cols-[auto_13rem_16rem] lg:items-end">
					<div className="grid grid-cols-3 border-2 border-primary">
						{statusFilters.map((statusFilter) => {
							const isSelected = filters.status === statusFilter.value;

							return (
								<button
									key={statusFilter.value}
									type="button"
									className={clsx(
										"h-14 border-primary border-l-2 px-3 py-2 text-sm font-black transition-colors first:border-l-0 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-focus",
										isSelected
											? getStatusFilterSelectedClassName(statusFilter.value)
											: "bg-background text-primary hover:bg-primary/10",
									)}
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
							className="h-14 w-full border-2 border-primary/40 bg-background px-3 py-2 text-sm font-semibold text-text transition-colors hover:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
							name="admin-unit-type-filter"
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
							autoComplete="off"
							name="admin-unit-search"
							value={filters.search}
							placeholder="Unit suchen…"
							className="h-14"
							onChange={(event) =>
								updateFilters({ search: event.target.value })
							}
						/>
					</div>
				</div>
			</div>

			{units.length === 0 ? (
				<div className="border-2 border-primary border-t-0 bg-background p-5">
					<FeedbackBox variant="empty" className="w-fit!">
						Keine Units für die gewählten Filter.
					</FeedbackBox>
				</div>
			) : (
				<div className="overflow-x-auto border-2 border-primary border-t-0 bg-background">
					<table className="w-full min-w-[52rem] border-collapse text-left text-sm">
						<thead>
							<tr className="border-primary border-b-2 bg-primary/10 text-primary text-xs font-black uppercase">
								<th className="py-3 pr-4 pl-5">Name</th>
								<th className="px-4 py-3">UnitType</th>
								<th className="px-4 py-3">Area</th>
								<th className="px-4 py-3">Kapazität</th>
								<th className="px-4 py-3">Status</th>
								<th className="px-4 py-3">DisplayOrder</th>
								<th className="py-3 pr-5 pl-4">Aktionen</th>
							</tr>
						</thead>
						<tbody>
							{units.map((unit) => (
								<tr
									key={unit.id}
									className="border-primary/25 border-b transition-colors last:border-b-0 hover:bg-primary/5"
								>
									<td className="max-w-64 py-4 pr-4 pl-5 align-top">
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
									<td className="py-4 pr-5 pl-4 align-top">
										<button
											type="button"
											className="border-2 border-primary bg-background px-3 py-2 text-sm font-black text-primary transition-colors hover:bg-primary hover:text-on-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
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
		</section>
	);
}
