import type { UnitTypeName } from "../model";

const unitTypeLabels: Record<UnitTypeName, string> = {
	HOT_DESK: "Hot Desk",
	BOOTH: "Booth",
	TEAM_ROOM: "Team Room",
};

export function formatUnitTypeName(unitTypeName: UnitTypeName): string {
	return unitTypeLabels[unitTypeName];
}
