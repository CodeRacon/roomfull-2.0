import { AppError } from "../lib/app-error.js";

type BookingRequestModeInput = {
	areaId?: string;
	unitId?: string;
	unitType?: string;
};

export type DirectBookingRequestMode = {
	mode: "DIRECT";
	unitId: string;
};

export type AutoAssignBookingRequestMode = {
	mode: "AUTO_ASSIGN";
	areaId: string;
	unitType: "HOT_DESK";
};

export type BookingRequestMode =
	| DirectBookingRequestMode
	| AutoAssignBookingRequestMode;

export function resolveBookingRequestMode(
	input: BookingRequestModeInput,
): BookingRequestMode {
	const areaId = input.areaId?.trim() ?? "";
	const unitId = input.unitId?.trim() ?? "";
	const unitType = input.unitType?.trim().toUpperCase() ?? "";
	const directSelected = unitId !== "";
	const autoAssignSelected = areaId !== "" || unitType !== "";

	if (directSelected && autoAssignSelected) {
		throw new AppError(
			400,
			"Entweder unitId ODER areaId+unitType senden, nicht beides",
		);
	}

	if (directSelected) {
		return {
			mode: "DIRECT",
			unitId,
		};
	}

	if (!autoAssignSelected) {
		throw new AppError(
			400,
			"Entweder unitId oder areaId+unitType ist erforderlich",
		);
	}

	if (areaId === "" || unitType === "") {
		throw new AppError(
			400,
			"Für Auto-Assign sind areaId und unitType erforderlich",
		);
	}

	if (unitType !== "HOT_DESK") {
		throw new AppError(
			400,
			"Auto-Assign ist dauerhaft nur für HOT_DESK erlaubt",
		);
	}

	return {
		mode: "AUTO_ASSIGN",
		areaId,
		unitType,
	};
}
