import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { AdminUnit } from "@/entities/unit";
import { getDictionary } from "@/shared/i18n";
import { AdminUnitFormPanel } from "./AdminUnitFormPanel";

vi.mock("@/entities/session", () => ({
	useSession: () => ({ endSession: vi.fn() }),
}));

const copy = (await getDictionary("de")).adminWorkspaces.units.form;

const unit: AdminUnit = {
	id: "booth-book-nook",
	name: "Book Nook",
	description: "Deutsche Beschreibung",
	descriptionDe: "Deutsche Beschreibung",
	descriptionEn: "English description",
	capacity: 3,
	isActive: true,
	displayOrder: 2,
	unitTypeId: "type-booth",
	areaId: null,
	createdAt: "2026-06-23T08:00:00.000Z",
	updatedAt: "2026-06-23T08:00:00.000Z",
	unitType: {
		id: "type-booth",
		name: "BOOTH",
		minDurationMinutes: 60,
		maxDurationMinutes: 240,
		capacity: 3,
	},
	area: null,
};

describe("AdminUnitFormPanel", () => {
	it("prefills German and English descriptions while editing", () => {
		render(
			<AdminUnitFormPanel
				areas={[]}
				copy={copy}
				mode="edit"
				onCancel={vi.fn()}
				onSaved={vi.fn()}
				unit={unit}
				unitTypes={[{ id: "type-booth", name: "BOOTH" }]}
			/>,
		);

		expect(
			(screen.getByLabelText("Beschreibung (Deutsch)") as HTMLTextAreaElement)
				.value,
		).toBe("Deutsche Beschreibung");
		expect(
			(screen.getByLabelText("Description (English)") as HTMLTextAreaElement)
				.value,
		).toBe("English description");
	});
});
