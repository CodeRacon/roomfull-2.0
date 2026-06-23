import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const localizedDescriptions = {
	"Cozy Cocoon": {
		de: "Dein geschützter Raum für längere Fokusphasen und Deep Work. Ruhig, bequem und ideal, wenn du tiefer eintauchen und für eine Weile wirklich bei einer Sache bleiben willst.",
		en: "Your private space for longer focus sessions and deep work. Quiet, comfortable, and ideal when you want to dive deeper and stay with one task for a while.",
	},
	"Book Nook": {
		de: "Dein ruhiger Rückzugsort für ungestörtes und konzentriertes Arbeiten. Still, kompakt und ideal, wenn du für eine Weile aus dem Trubel raus willst.",
		en: "Your quiet retreat for uninterrupted, focused work. Calm, compact, and ideal when you want to get away from the bustle for a while.",
	},
	"Call-in Cabin": {
		de: "Deine kleine Cabin für Calls, Videomeetings und vertrauliche Gespräche. Kompakt, abgeschirmt und genau richtig, wenn du ungestört sprechen willst.",
		en: "Your small cabin for calls, video meetings, and confidential conversations. Compact, secluded, and just right when you want to speak without interruptions.",
	},
	"Hive Five": {
		de: "Eure kleine Team-Booth für kurze Sessions zu fünft. Kompakt, lebendig und genau richtig, wenn ihr Ideen sammeln, Entscheidungen treffen oder schnell auf einen gemeinsamen Stand kommen wollt.",
		en: "Your small team booth for short sessions with up to five people. Compact, lively, and just right for collecting ideas, making decisions, or quickly getting everyone on the same page.",
	},
	"Huddle Hub": {
		de: "Euer Raum für kurze Team-Syncs, schnelle Abstimmungen und klare nächste Schritte. Kompakt, direkt und ideal, wenn alle kurz zusammenkommen müssen.",
		en: "Your room for quick team syncs, fast alignment, and clear next steps. Compact, direct, and ideal when everyone needs to come together briefly.",
	},
	"Collab Cabana": {
		de: "Eure ideale Umgebung für Workshops, Brainstormings und kreative Teamarbeit. Offen, locker, entspannt und gemacht für Ideen, die gemeinsam wachsen sollen.",
		en: "Your ideal setting for workshops, brainstorming, and creative teamwork. Open, casual, relaxed, and made for ideas that should grow together.",
	},
	Sandbox: {
		de: "Euer flexibler Raum für Try-Outs, Brain-Storming und Prototyping. Ideal, wenn ihr Gedanken sichtbar machen, testen und gemeinsam weiterentwickeln wollt.",
		en: "Your flexible room for try-outs, brainstorming, and prototyping. Ideal when you want to make ideas visible, test them, and develop them together.",
	},
	"Meet’n Neat": {
		de: "Euer Raum für Gespräche, bei denen der erste Eindruck zählt. Einladend, ruhig und aufgeräumt — ideal für Kundentermine, Beratung und kompakte Abstimmungen.",
		en: "Your room for conversations where first impressions matter. Welcoming, calm, and tidy—ideal for client meetings, consultations, and focused alignment.",
	},
	"Table Talk": {
		de: "Euer Forum für aktiven Austausch, Entscheidungsfindung und gemeinsame Klärung. Ruhig, großzügig und ideal, wenn mehrere Perspektiven an einen Tisch gehören.",
		en: "Your forum for active exchange, decision-making, and shared clarity. Calm, spacious, and ideal when multiple perspectives belong at one table.",
	},
	"Show & Flow": {
		de: "Euer Raum für Key-Notes, Pitches und Workshops - ausgestattet mit allem was es braucht, damit eure Ideen überzeugen und um euer Publikum mitzunehmen.",
		en: "Your room for keynotes, pitches, and workshops—equipped with everything you need to make your ideas compelling and bring your audience along.",
	},
} as const;

async function main(): Promise<void> {
	const names = Object.keys(localizedDescriptions);
	const units = await prisma.bookableUnit.findMany({
		where: { name: { in: names } },
		select: { id: true, name: true },
	});

	const unitsByName = new Map<string, (typeof units)[number]>();
	for (const unit of units) {
		if (unitsByName.has(unit.name)) {
			throw new Error(`Mehrere BookableUnits heißen „${unit.name}“`);
		}
		unitsByName.set(unit.name, unit);
	}

	const missingNames = names.filter((name) => !unitsByName.has(name));
	if (missingNames.length > 0) {
		throw new Error(`BookableUnits fehlen: ${missingNames.join(", ")}`);
	}

	await prisma.$transaction(
		names.map((name) => {
			const unit = unitsByName.get(name);
			if (!unit) {
				throw new Error(`BookableUnit „${name}“ wurde nicht geladen`);
			}

			const descriptions =
				localizedDescriptions[name as keyof typeof localizedDescriptions];

			return prisma.bookableUnit.update({
				where: { id: unit.id },
				data: {
					description: descriptions.de,
					descriptionDe: descriptions.de,
					descriptionEn: descriptions.en,
				},
			});
		}),
	);

	console.log(`${names.length} BookableUnits wurden lokalisiert.`);
}

main()
	.catch((error: unknown) => {
		console.error(error);
		process.exitCode = 1;
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
