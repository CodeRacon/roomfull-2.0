import { clsx } from "clsx";
import type {
	AdminUnit,
	AdminUnitContextUnitType,
	AdminUnitStatusFilter,
	UnitTypeName,
} from "@/entities/unit";
import { formatUnitTypeName } from "@/entities/unit";
import type { Dictionary } from "@/shared/i18n";
import { Badge, FeedbackBox, Select, TextInput } from "@/shared/ui";

type AdminUnitsTableProps = {
	copy: Dictionary["adminWorkspaces"]["units"]["table"];
	filters: {
		status: AdminUnitStatusFilter;
		unitType: UnitTypeName | "all";
		search: string;
	};
	onEditUnit: (unit: AdminUnit) => void;
	onFiltersChange: (filters: AdminUnitsTableProps["filters"]) => void;
	unitTypes: AdminUnitContextUnitType[];
	units: AdminUnit[];
};

const statusFilters: {
	value: AdminUnitStatusFilter;
}[] = [{ value: "active" }, { value: "deactivated" }, { value: "all" }];

function getStatusBadge(
	unit: AdminUnit,
	copy: Dictionary["adminWorkspaces"]["units"]["table"]["status"],
) {
	return unit.isActive ? (
		<Badge variant="success">{copy.active}</Badge>
	) : (
		<Badge variant="danger">{copy.deactivated}</Badge>
	);
}

function formatArea(unit: AdminUnit): string {
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
	copy,
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
							{copy.title}
						</h2>
						<p className="mt-1 truncate text-sm font-semibold text-on-primary/75">
							{copy.description}
						</p>
					</div>
					<div className="mx-1 mb-0 flex min-h-14 items-center bg-on-primary px-4 py-3 text-sm font-black text-primary md:mx-0 md:mr-1">
						{units.length === 1
							? copy.unitOne
							: copy.unitsMany.replace("{count}", String(units.length))}
					</div>
				</div>
			</div>
			<div className="border-primary border-x-2 bg-background p-5">
				<div className="grid w-full gap-3 lg:grid-cols-[auto_13rem_16rem] lg:items-end">
					<div className="grid h-14 grid-cols-3 border-2 border-primary">
						{statusFilters.map((statusFilter) => {
							const isSelected = filters.status === statusFilter.value;

							return (
								<button
									key={statusFilter.value}
									type="button"
									className={clsx(
										"h-full border-primary border-l-2 px-3 py-2 text-sm font-black transition-colors first:border-l-0 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-focus",
										isSelected
											? getStatusFilterSelectedClassName(statusFilter.value)
											: "bg-background text-primary hover:bg-primary/10",
									)}
									aria-pressed={isSelected}
									onClick={() => updateFilters({ status: statusFilter.value })}
								>
									{copy.status[statusFilter.value]}
								</button>
							);
						})}
					</div>
					<div className="block">
						<label
							htmlFor="admin-unit-type-filter"
							className="mb-1 block text-xs font-semibold text-muted"
						>
							{copy.unitType}
						</label>
						<Select
							id="admin-unit-type-filter"
							name="admin-unit-type-filter"
							value={filters.unitType}
							options={[
								{ label: copy.allUnitTypes, value: "all" },
								...unitTypes.map((unitType) => ({
									label: formatUnitTypeName(unitType.name),
									value: unitType.name,
								})),
							]}
							className="h-14"
							onValueChange={(value) =>
								updateFilters({
									unitType: value as UnitTypeName | "all",
								})
							}
						/>
					</div>
					<div className="block">
						<label
							htmlFor="admin-unit-search"
							className="mb-1 block text-xs font-semibold text-muted"
						>
							{copy.name}
						</label>
						<TextInput
							id="admin-unit-search"
							autoComplete="off"
							name="admin-unit-search"
							value={filters.search}
							placeholder={copy.searchPlaceholder}
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
						{copy.empty}
					</FeedbackBox>
				</div>
			) : (
				<div className="overflow-x-auto border-2 border-primary border-t-0 bg-background">
					<table className="w-full min-w-[52rem] border-collapse text-left text-sm">
						<thead>
							<tr className="border-primary border-b-2 bg-primary/10 text-primary text-xs font-black uppercase">
								<th className="py-3 pr-4 pl-5">{copy.columns.name}</th>
								<th className="px-4 py-3">{copy.columns.unitType}</th>
								<th className="px-4 py-3">{copy.columns.area}</th>
								<th className="px-4 py-3">{copy.columns.capacity}</th>
								<th className="px-4 py-3">{copy.columns.status}</th>
								<th className="px-4 py-3">{copy.columns.displayOrder}</th>
								<th className="py-3 pr-5 pl-4">{copy.columns.actions}</th>
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
										{getStatusBadge(unit, copy.status)}
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
											{copy.edit}
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
