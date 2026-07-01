import { ContactRequestType, UnitTypeName } from "@prisma/client";
import {
	cancelBooking,
	createBookingWithTransaction,
} from "../db/booking.repository.js";
import { listActiveUnitsWithRelationsByUnitType } from "../db/unit.repository.js";
import { AppError } from "../lib/app-error.js";
import { createBookingForUser } from "./booking.service.js";
import { createContactRequestForCustomer } from "./contact-request.service.js";
import {
	type CoworkingCalendar,
	createCoworkingCalendar,
} from "./coworking-calendar.js";
import { customerTeamManagement } from "./customer-team-management.js";

type DemoBookableUnit = {
	id: string;
	name: string;
	displayOrder: number;
};

type PopulateDemoCustomerDataInput = {
	customerId: string;
};

type DemoBookingInput = {
	userId: string;
	unitId: string;
	startTime: Date;
	endTime: Date;
};

type DemoBookingRecord = {
	id: string;
};

type DemoCustomerDataDependencies = {
	now: () => Date;
	listActiveUnitsByType: (
		unitType: UnitTypeName,
	) => Promise<DemoBookableUnit[]>;
	createBookingForUser: typeof createBookingForUser;
	createContactRequestForCustomer: typeof createContactRequestForCustomer;
	createTeam: typeof customerTeamManagement.create;
	addTeamMember: typeof customerTeamManagement.addMember;
	createHistoricalBooking(
		input: DemoBookingInput,
	): Promise<DemoBookingRecord | null>;
	createCancelledBooking(
		input: DemoBookingInput,
	): Promise<DemoBookingRecord | null>;
};

const DEMO_BOOKING_UNIT_TYPE = UnitTypeName.MEETING_ROOM;
const DEMO_BOOKING_START_TIME = "09:00";
const DEMO_BOOKING_END_TIME = "11:00";
const DEMO_PAST_BOOKING_OFFSET_DAYS = 7;
const DEMO_PAST_BOOKING_START_MINUTES = 9 * 60;
const DEMO_PAST_BOOKING_END_MINUTES = 11 * 60;
const DEMO_CANCELLED_BOOKING_OFFSET_DAYS = 3;
const DEMO_CANCELLED_BOOKING_START_MINUTES = 14 * 60;
const DEMO_CANCELLED_BOOKING_END_MINUTES = 15 * 60;
const DEMO_CONTACT_REQUEST_TYPE = ContactRequestType.QUESTION;
const DEMO_CONTACT_REQUEST_MESSAGE =
	"Ich plane einen Workshop mit meinem Team und moechte wissen, welcher Raum dafuer am besten passt.";
const DEMO_TEAMS = [
	{
		name: "Workshop Crew",
		members: [
			{
				name: "Mara Klein",
				email: "mara.klein@roomfull-demo.test",
			},
			{
				name: "Jonas Weber",
				email: "jonas.weber@roomfull-demo.test",
			},
		],
	},
	{
		name: "Product Sync",
		members: [
			{
				name: "Lina Hartmann",
				email: "lina.hartmann@roomfull-demo.test",
			},
			{
				name: "Noah Berger",
				email: "noah.berger@roomfull-demo.test",
			},
		],
	},
	{
		name: "Focus Circle",
		members: [
			{
				name: "Amira Schmitt",
				email: "amira.schmitt@roomfull-demo.test",
			},
			{
				name: "Tom Keller",
				email: "tom.keller@roomfull-demo.test",
			},
		],
	},
] as const;
const MAX_BOOKING_SEARCH_DAYS = 14;

function findNextBusinessDates(
	calendar: CoworkingCalendar,
	count: number,
): string[] {
	const dates: string[] = [];
	let currentDate = calendar.getTodayDate();

	while (dates.length < count) {
		currentDate = calendar.addDays(currentDate, 1);
		const dayOfWeek = calendar.getDayOfWeek(currentDate);

		if (dayOfWeek >= 1 && dayOfWeek <= 5) {
			dates.push(currentDate);
		}
	}

	return dates;
}

function findPastBusinessDates(
	calendar: CoworkingCalendar,
	count: number,
	offsetDays: number,
): string[] {
	const dates: string[] = [];
	let currentDate = calendar.addDays(calendar.getTodayDate(), -offsetDays);

	while (dates.length < count) {
		const dayOfWeek = calendar.getDayOfWeek(currentDate);

		if (dayOfWeek >= 1 && dayOfWeek <= 5) {
			dates.push(currentDate);
		}

		currentDate = calendar.addDays(currentDate, -1);
	}

	return dates;
}

function isConflict(error: unknown): boolean {
	return error instanceof AppError && error.statusCode === 409;
}

async function createCancelledBooking(
	input: DemoBookingInput,
): Promise<DemoBookingRecord | null> {
	const booking = await createBookingWithTransaction(input);

	if (!booking) {
		return null;
	}

	return cancelBooking({ bookingId: booking.id });
}

const defaultDependencies: DemoCustomerDataDependencies = {
	now: () => new Date(),
	listActiveUnitsByType: listActiveUnitsWithRelationsByUnitType,
	createBookingForUser,
	createContactRequestForCustomer,
	createTeam: customerTeamManagement.create.bind(customerTeamManagement),
	addTeamMember: customerTeamManagement.addMember.bind(customerTeamManagement),
	createHistoricalBooking: createBookingWithTransaction,
	createCancelledBooking,
};

export function createDemoCustomerDataService(
	dependencies: DemoCustomerDataDependencies = defaultDependencies,
) {
	return {
		async populateDemoCustomerData(
			input: PopulateDemoCustomerDataInput,
		): Promise<void> {
			const customerId = input.customerId.trim();

			if (customerId.length === 0) {
				throw new AppError(400, "customerId ist erforderlich");
			}

			await dependencies.createContactRequestForCustomer({
				userId: customerId,
				type: DEMO_CONTACT_REQUEST_TYPE,
				message: DEMO_CONTACT_REQUEST_MESSAGE,
			});

			const teams = await Promise.all(
				DEMO_TEAMS.map((team) =>
					dependencies.createTeam({
						customerId,
						name: team.name,
					}),
				),
			);

			for (const [index, team] of teams.entries()) {
				const template = DEMO_TEAMS[index];
				for (const member of template.members) {
					await dependencies.addTeamMember({
						customerId,
						teamId: team.id,
						name: member.name,
						email: member.email,
					});
				}
			}

			const units = await dependencies.listActiveUnitsByType(
				DEMO_BOOKING_UNIT_TYPE,
			);

			if (units.length === 0) {
				throw new AppError(
					409,
					"Demo Customer Data kann ohne aktive Meeting Rooms nicht erzeugt werden",
				);
			}

			const calendar = createCoworkingCalendar({ now: dependencies.now });
			const pastDates = findPastBusinessDates(
				calendar,
				MAX_BOOKING_SEARCH_DAYS,
				DEMO_PAST_BOOKING_OFFSET_DAYS,
			);
			let hasHistoricalBooking = false;

			for (const date of pastDates) {
				for (const unit of units) {
					const historicalBooking = await dependencies.createHistoricalBooking({
						userId: customerId,
						unitId: unit.id,
						startTime: calendar.toUtcDateFromMinutes(
							date,
							DEMO_PAST_BOOKING_START_MINUTES,
						),
						endTime: calendar.toUtcDateFromMinutes(
							date,
							DEMO_PAST_BOOKING_END_MINUTES,
						),
					});

					if (historicalBooking) {
						hasHistoricalBooking = true;
						break;
					}
				}

				if (hasHistoricalBooking) {
					break;
				}
			}

			if (!hasHistoricalBooking) {
				throw new AppError(
					409,
					"Kein freier historischer Zeitraum für Demo Customer Data verfügbar",
				);
			}

			const cancelledDates = findPastBusinessDates(
				calendar,
				MAX_BOOKING_SEARCH_DAYS,
				DEMO_CANCELLED_BOOKING_OFFSET_DAYS,
			);
			let hasCancelledBooking = false;

			for (const date of cancelledDates) {
				for (const unit of units) {
					const cancelledBooking = await dependencies.createCancelledBooking({
						userId: customerId,
						unitId: unit.id,
						startTime: calendar.toUtcDateFromMinutes(
							date,
							DEMO_CANCELLED_BOOKING_START_MINUTES,
						),
						endTime: calendar.toUtcDateFromMinutes(
							date,
							DEMO_CANCELLED_BOOKING_END_MINUTES,
						),
					});

					if (cancelledBooking) {
						hasCancelledBooking = true;
						break;
					}
				}

				if (hasCancelledBooking) {
					break;
				}
			}

			if (!hasCancelledBooking) {
				throw new AppError(
					409,
					"Kein freier stornierter Zeitraum für Demo Customer Data verfügbar",
				);
			}

			const dates = findNextBusinessDates(calendar, MAX_BOOKING_SEARCH_DAYS);

			for (const date of dates) {
				for (const unit of units) {
					try {
						await dependencies.createBookingForUser({
							userId: customerId,
							unitId: unit.id,
							date,
							startTime: DEMO_BOOKING_START_TIME,
							endTime: DEMO_BOOKING_END_TIME,
						});
						return;
					} catch (error) {
						if (isConflict(error)) {
							continue;
						}

						throw error;
					}
				}
			}

			throw new AppError(
				409,
				"Kein freier Zeitraum für Demo Customer Data verfügbar",
			);
		},
	};
}

export const demoCustomerDataService = createDemoCustomerDataService();
