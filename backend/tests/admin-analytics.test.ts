import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { BookingStatus, UnitTypeName } from "@prisma/client";
import { buildBookingDemandRecordsWhere } from "../src/db/analytics.repository.js";
import {
	buildBookingCancellationStats,
	buildBookingDemandByUnitType,
	buildBookingDemandTrend,
} from "../src/services/admin-analytics.service.js";

describe("Admin Booking Demand Analytics", () => {
	it("excludes Demo Customer bookings at the repository boundary", () => {
		const fromStart = new Date("2027-01-18T00:00:00.000Z");
		const toEnd = new Date("2027-01-21T00:00:00.000Z");

		assert.deepEqual(
			buildBookingDemandRecordsWhere({
				fromStart,
				toEnd,
			}),
			{
				startTime: {
					gte: fromStart,
					lt: toEnd,
				},
				user: {
					isDemo: false,
				},
			},
		);
	});

	it("groups active booking starts by Berlin calendar day and includes empty days", () => {
		const trend = buildBookingDemandTrend({
			from: "2027-01-18",
			to: "2027-01-20",
			bookings: [
				{
					startTime: new Date("2027-01-18T08:00:00.000Z"),
					status: BookingStatus.ACTIVE,
					unit: { unitType: { name: UnitTypeName.HOT_DESK } },
				},
				{
					startTime: new Date("2027-01-18T10:00:00.000Z"),
					status: BookingStatus.ACTIVE,
					unit: { unitType: { name: UnitTypeName.HOT_DESK } },
				},
				{
					startTime: new Date("2027-01-20T09:00:00.000Z"),
					status: BookingStatus.ACTIVE,
					unit: { unitType: { name: UnitTypeName.MEETING_ROOM } },
				},
			],
		});

		assert.deepEqual(trend, [
			{ date: "2027-01-18", bookingCount: 2 },
			{ date: "2027-01-19", bookingCount: 0 },
			{ date: "2027-01-20", bookingCount: 1 },
		]);
	});

	it("groups active booking starts by UnitType and includes empty UnitTypes", () => {
		const demandByUnitType = buildBookingDemandByUnitType({
			bookings: [
				{
					startTime: new Date("2027-01-18T08:00:00.000Z"),
					status: BookingStatus.ACTIVE,
					unit: { unitType: { name: UnitTypeName.HOT_DESK } },
				},
				{
					startTime: new Date("2027-01-18T10:00:00.000Z"),
					status: BookingStatus.ACTIVE,
					unit: { unitType: { name: UnitTypeName.HOT_DESK } },
				},
				{
					startTime: new Date("2027-01-20T09:00:00.000Z"),
					status: BookingStatus.ACTIVE,
					unit: { unitType: { name: UnitTypeName.MEETING_ROOM } },
				},
			],
		});

		assert.deepEqual(demandByUnitType, [
			{ unitType: UnitTypeName.HOT_DESK, bookingCount: 2 },
			{ unitType: UnitTypeName.BOOTH, bookingCount: 0 },
			{ unitType: UnitTypeName.TEAM_ROOM, bookingCount: 0 },
			{ unitType: UnitTypeName.MEETING_ROOM, bookingCount: 1 },
		]);
	});

	it("calculates cancellation stats for bookings in the selected range", () => {
		const cancellationStats = buildBookingCancellationStats({
			bookings: [
				{
					startTime: new Date("2027-01-18T08:00:00.000Z"),
					status: BookingStatus.ACTIVE,
					unit: { unitType: { name: UnitTypeName.HOT_DESK } },
				},
				{
					startTime: new Date("2027-01-18T10:00:00.000Z"),
					status: BookingStatus.ACTIVE,
					unit: { unitType: { name: UnitTypeName.BOOTH } },
				},
				{
					startTime: new Date("2027-01-20T09:00:00.000Z"),
					status: BookingStatus.CANCELLED,
					unit: { unitType: { name: UnitTypeName.MEETING_ROOM } },
				},
			],
		});

		assert.deepEqual(cancellationStats, {
			activeBookings: 2,
			cancelledBookings: 1,
			totalBookings: 3,
			cancellationRate: 1 / 3,
		});
	});
});
