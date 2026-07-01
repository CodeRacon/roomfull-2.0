import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ContactRequestType, UnitTypeName } from "@prisma/client";
import { createDemoCustomerDataService } from "../src/services/demo-customer-data.service.js";

describe("Demo Customer Data", () => {
	it("creates one upcoming active booking for the Demo Customer", async () => {
		const bookingRequests: unknown[] = [];
		const service = createDemoCustomerDataService({
			now: () => new Date("2026-07-01T10:00:00.000Z"),
			listActiveUnitsByType: async (unitType) => {
				assert.equal(unitType, UnitTypeName.MEETING_ROOM);

				return [
					{
						id: "meeting-room-1",
						name: "Meeting Room 1",
						displayOrder: 1,
					},
				];
			},
			createBookingForUser: async (input) => {
				bookingRequests.push(input);

				return {
					id: "booking-1",
				};
			},
			createContactRequestForCustomer: async (input) => ({
				id: "contact-request-1",
				userId: input.userId,
				type: ContactRequestType.QUESTION,
				message: input.message,
				isRead: false,
				createdAt: new Date("2026-07-01T10:00:00.000Z"),
			}),
			createTeam: async (input) => ({
				id: "team-1",
				name: input.name,
				memberCount: 0,
			}),
			addTeamMember: async (input) => ({
				id: "member-1",
				name: input.name,
				email: input.email,
			}),
			createHistoricalBooking: async () => ({
				id: "historical-booking-1",
			}),
			createCancelledBooking: async () => ({
				id: "cancelled-booking-1",
			}),
		});

		await service.populateDemoCustomerData({ customerId: "demo-customer-1" });

		assert.deepEqual(bookingRequests, [
			{
				userId: "demo-customer-1",
				unitId: "meeting-room-1",
				date: "2026-07-02",
				startTime: "09:00",
				endTime: "11:00",
			},
		]);
	});

	it("creates one Customer Contact Request for the Demo Customer", async () => {
		const contactRequests: unknown[] = [];
		const service = createDemoCustomerDataService({
			now: () => new Date("2026-07-01T10:00:00.000Z"),
			listActiveUnitsByType: async () => [
				{
					id: "meeting-room-1",
					name: "Meeting Room 1",
					displayOrder: 1,
				},
			],
			createBookingForUser: async () => ({
				id: "booking-1",
			}),
			createContactRequestForCustomer: async (input) => {
				contactRequests.push(input);

				return {
					id: "contact-request-1",
					userId: input.userId,
					type: ContactRequestType.QUESTION,
					message: input.message,
					isRead: false,
					createdAt: new Date("2026-07-01T10:00:00.000Z"),
				};
			},
			createTeam: async (input) => ({
				id: "team-1",
				name: input.name,
				memberCount: 0,
			}),
			addTeamMember: async (input) => ({
				id: "member-1",
				name: input.name,
				email: input.email,
			}),
			createHistoricalBooking: async () => ({
				id: "historical-booking-1",
			}),
			createCancelledBooking: async () => ({
				id: "cancelled-booking-1",
			}),
		});

		await service.populateDemoCustomerData({ customerId: "demo-customer-1" });

		assert.deepEqual(contactRequests, [
			{
				userId: "demo-customer-1",
				type: ContactRequestType.QUESTION,
				message:
					"Ich plane einen Workshop mit meinem Team und moechte wissen, welcher Raum dafuer am besten passt.",
			},
		]);
	});

	it("creates three Teams for the Demo Customer", async () => {
		const teamRequests: unknown[] = [];
		const service = createDemoCustomerDataService({
			now: () => new Date("2026-07-01T10:00:00.000Z"),
			listActiveUnitsByType: async () => [
				{
					id: "meeting-room-1",
					name: "Meeting Room 1",
					displayOrder: 1,
				},
			],
			createBookingForUser: async () => ({
				id: "booking-1",
			}),
			createContactRequestForCustomer: async (input) => ({
				id: "contact-request-1",
				userId: input.userId,
				type: ContactRequestType.QUESTION,
				message: input.message,
				isRead: false,
				createdAt: new Date("2026-07-01T10:00:00.000Z"),
			}),
			createTeam: async (input) => {
				teamRequests.push(input);

				return {
					id: "team-1",
					name: input.name,
					memberCount: 0,
				};
			},
			addTeamMember: async (input) => ({
				id: "member-1",
				name: input.name,
				email: input.email,
			}),
			createHistoricalBooking: async () => ({
				id: "historical-booking-1",
			}),
			createCancelledBooking: async () => ({
				id: "cancelled-booking-1",
			}),
		});

		await service.populateDemoCustomerData({ customerId: "demo-customer-1" });

		assert.deepEqual(teamRequests, [
			{
				customerId: "demo-customer-1",
				name: "Workshop Crew",
			},
			{
				customerId: "demo-customer-1",
				name: "Product Sync",
			},
			{
				customerId: "demo-customer-1",
				name: "Focus Circle",
			},
		]);
	});

	it("creates Team Members for each Demo Customer Team", async () => {
		const memberRequests: unknown[] = [];
		const service = createDemoCustomerDataService({
			now: () => new Date("2026-07-01T10:00:00.000Z"),
			listActiveUnitsByType: async () => [
				{
					id: "meeting-room-1",
					name: "Meeting Room 1",
					displayOrder: 1,
				},
			],
			createBookingForUser: async () => ({
				id: "booking-1",
			}),
			createContactRequestForCustomer: async (input) => ({
				id: "contact-request-1",
				userId: input.userId,
				type: ContactRequestType.QUESTION,
				message: input.message,
				isRead: false,
				createdAt: new Date("2026-07-01T10:00:00.000Z"),
			}),
			createTeam: async (input) => {
				const teamIdsByName = new Map([
					["Workshop Crew", "team-workshop"],
					["Product Sync", "team-product"],
					["Focus Circle", "team-focus"],
				]);

				return {
					id: teamIdsByName.get(input.name) ?? "team-unknown",
					name: input.name,
					memberCount: 0,
				};
			},
			addTeamMember: async (input) => {
				memberRequests.push(input);

				return {
					id: `member-${memberRequests.length}`,
					name: input.name,
					email: input.email,
				};
			},
			createHistoricalBooking: async () => ({
				id: "historical-booking-1",
			}),
			createCancelledBooking: async () => ({
				id: "cancelled-booking-1",
			}),
		});

		await service.populateDemoCustomerData({ customerId: "demo-customer-1" });

		assert.deepEqual(memberRequests, [
			{
				customerId: "demo-customer-1",
				teamId: "team-workshop",
				name: "Mara Klein",
				email: "mara.klein@roomfull-demo.test",
			},
			{
				customerId: "demo-customer-1",
				teamId: "team-workshop",
				name: "Jonas Weber",
				email: "jonas.weber@roomfull-demo.test",
			},
			{
				customerId: "demo-customer-1",
				teamId: "team-product",
				name: "Lina Hartmann",
				email: "lina.hartmann@roomfull-demo.test",
			},
			{
				customerId: "demo-customer-1",
				teamId: "team-product",
				name: "Noah Berger",
				email: "noah.berger@roomfull-demo.test",
			},
			{
				customerId: "demo-customer-1",
				teamId: "team-focus",
				name: "Amira Schmitt",
				email: "amira.schmitt@roomfull-demo.test",
			},
			{
				customerId: "demo-customer-1",
				teamId: "team-focus",
				name: "Tom Keller",
				email: "tom.keller@roomfull-demo.test",
			},
		]);
	});

	it("creates one past active Booking for the Demo Customer", async () => {
		const historicalBookingRequests: unknown[] = [];
		const service = createDemoCustomerDataService({
			now: () => new Date("2026-07-01T10:00:00.000Z"),
			listActiveUnitsByType: async () => [
				{
					id: "meeting-room-1",
					name: "Meeting Room 1",
					displayOrder: 1,
				},
			],
			createBookingForUser: async () => ({
				id: "booking-1",
			}),
			createContactRequestForCustomer: async (input) => ({
				id: "contact-request-1",
				userId: input.userId,
				type: ContactRequestType.QUESTION,
				message: input.message,
				isRead: false,
				createdAt: new Date("2026-07-01T10:00:00.000Z"),
			}),
			createTeam: async (input) => ({
				id: "team-1",
				name: input.name,
				memberCount: 0,
			}),
			addTeamMember: async (input) => ({
				id: "member-1",
				name: input.name,
				email: input.email,
			}),
			createHistoricalBooking: async (input) => {
				historicalBookingRequests.push(input);

				return {
					id: "historical-booking-1",
				};
			},
			createCancelledBooking: async () => ({
				id: "cancelled-booking-1",
			}),
		});

		await service.populateDemoCustomerData({ customerId: "demo-customer-1" });

		assert.deepEqual(historicalBookingRequests, [
			{
				userId: "demo-customer-1",
				unitId: "meeting-room-1",
				startTime: new Date("2026-06-24T07:00:00.000Z"),
				endTime: new Date("2026-06-24T09:00:00.000Z"),
			},
		]);
	});

	it("creates one cancelled Booking for the Demo Customer", async () => {
		const cancelledBookingRequests: unknown[] = [];
		const service = createDemoCustomerDataService({
			now: () => new Date("2026-07-01T10:00:00.000Z"),
			listActiveUnitsByType: async () => [
				{
					id: "meeting-room-1",
					name: "Meeting Room 1",
					displayOrder: 1,
				},
			],
			createBookingForUser: async () => ({
				id: "booking-1",
			}),
			createContactRequestForCustomer: async (input) => ({
				id: "contact-request-1",
				userId: input.userId,
				type: ContactRequestType.QUESTION,
				message: input.message,
				isRead: false,
				createdAt: new Date("2026-07-01T10:00:00.000Z"),
			}),
			createTeam: async (input) => ({
				id: "team-1",
				name: input.name,
				memberCount: 0,
			}),
			addTeamMember: async (input) => ({
				id: "member-1",
				name: input.name,
				email: input.email,
			}),
			createHistoricalBooking: async () => ({
				id: "historical-booking-1",
			}),
			createCancelledBooking: async (input) => {
				cancelledBookingRequests.push(input);

				return {
					id: "cancelled-booking-1",
				};
			},
		});

		await service.populateDemoCustomerData({ customerId: "demo-customer-1" });

		assert.deepEqual(cancelledBookingRequests, [
			{
				userId: "demo-customer-1",
				unitId: "meeting-room-1",
				startTime: new Date("2026-06-26T12:00:00.000Z"),
				endTime: new Date("2026-06-26T13:00:00.000Z"),
			},
		]);
	});
});
