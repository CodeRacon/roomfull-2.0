import type { Metadata } from "next";
import type { InfoPageSection } from "@/shared/ui";
import { InfoPageLayout } from "@/shared/ui";

export const metadata: Metadata = {
	title: "FAQ | RoomFull 2.0",
	description: "Antworten auf häufige Fragen zur Nutzung von RoomFull.",
};

const faqSections: InfoPageSection[] = [
	{
		id: "roomfull",
		navLabel: "Was ist RoomFull?",
		title: "Was ist RoomFull?",
		children: (
			<p>
				RoomFull ist ein kleines Buchungssystem für Coworking-Units. Du kannst
				verfügbare Arbeitsmodi ansehen, konkrete Räume oder Plätze auswählen und
				eine Buchung für einen zukünftigen Zeitraum anlegen.
			</p>
		),
	},
	{
		id: "booking-options",
		navLabel: "Welche Arbeitsmodi gibt es?",
		title: "Welche Arbeitsmodi gibt es?",
		children: (
			<p>
				In der aktuellen Version gibt es Hot Desk, Booth, Team Room und Meeting
				Room. Die BookingOptions erklären den Bedarf, gebucht wird am Ende aber
				immer eine konkrete aktive Unit.
			</p>
		),
	},
	{
		id: "account",
		navLabel: "Brauche ich ein Konto?",
		title: "Brauche ich ein Konto?",
		children: (
			<p>
				Die öffentlichen Buchungsoptionen kannst du ohne Konto ansehen. Für eine
				echte Buchung brauchst du einen Account, damit RoomFull deine Buchung
				eindeutig zuordnen und später in „Meine Buchungen“ anzeigen kann.
			</p>
		),
	},
	{
		id: "availability",
		navLabel: "Wie prüfe ich Verfügbarkeit?",
		title: "Wie prüfe ich Verfügbarkeit?",
		children: (
			<p>
				Wähle zuerst einen Arbeitsmodus und danach eine konkrete Unit aus. Im
				Buchungsformular prüft RoomFull den gewünschten Zeitraum gegen die
				Backend-Regeln, bevor eine Buchung gespeichert wird.
			</p>
		),
	},
	{
		id: "cancellations",
		navLabel: "Kann ich Buchungen stornieren?",
		title: "Kann ich Buchungen stornieren?",
		children: (
			<p>
				Als Customer kannst du deine eigenen Buchungen in „Meine Buchungen“
				stornieren. Admins haben zusätzlich operative Einsicht in den
				Buchungsbetrieb.
			</p>
		),
	},
	{
		id: "opening-hours",
		navLabel: "Welche Zeiten sind buchbar?",
		title: "Welche Zeiten sind buchbar?",
		children: (
			<p>
				RoomFull akzeptiert nur zukünftige Zeiträume innerhalb der globalen
				Öffnungszeiten. Für dieses MVP gelten Montag bis Freitag von 08:00 bis
				22:00 Uhr.
			</p>
		),
	},
	{
		id: "payments",
		navLabel: "Gibt es Zahlungen im MVP?",
		title: "Gibt es Zahlungen im MVP?",
		children: (
			<p>
				Nein. Payments, E-Mail-Benachrichtigungen, Kalender-Sync, Wartelisten
				und mehrere Standorte sind bewusst nicht Teil der ersten Version.
			</p>
		),
	},
];

export default function FaqPage() {
	return (
		<InfoPageLayout
			title="FAQs"
			subtitle="Häufige Fragen"
			intro="Alles Wichtige zur Nutzung von RoomFull: vom passenden Arbeitsmodus über Verfügbarkeit bis zu Buchungen und Stornierungen."
			sections={faqSections}
		/>
	);
}
