import type { UnitTypeName } from "../model";

const unitTypeLabels: Record<UnitTypeName, string> = {
	HOT_DESK: "Hot Desk",
	BOOTH: "Booth",
	TEAM_ROOM: "Team Room",
	MEETING_ROOM: "Meeting Room",
};

export function formatUnitTypeName(unitTypeName: UnitTypeName): string {
	return unitTypeLabels[unitTypeName];
}
