import type { Metadata } from "next";
import Link from "next/link";
import type { InfoPageSection } from "@/shared/ui";
import { InfoPageLayout } from "@/shared/ui";

export const metadata: Metadata = {
	title: "Datenschutz | RoomFull 2.0",
	description: "Datenschutzhinweise für das RoomFull MVP.",
};

const privacySections: InfoPageSection[] = [
	{
		id: "overview",
		navLabel: "Einordnung",
		title: "Einordnung",
		children: (
			<>
				<p>
					Diese Datenschutzhinweise beschreiben, welche Daten RoomFull im MVP
					für Registrierung, Anmeldung und Buchungsverwaltung verarbeitet.
				</p>
				<p>
					Vor einem produktiven Einsatz müssen Betreiberangaben, Hosting-Details
					und rechtliche Pflichtangaben konkret ergänzt und geprüft werden.
				</p>
			</>
		),
	},
	{
		id: "controller",
		navLabel: "Verantwortliche Stelle",
		title: "Verantwortliche Stelle",
		children: (
			<p>
				Verantwortlich ist der Betreiber dieser RoomFull-Instanz. Die konkreten
				Kontaktdaten sollten hier vor dem Livegang ergänzt werden.
			</p>
		),
	},
	{
		id: "collected-data",
		navLabel: "Welche Daten verarbeitet werden",
		title: "Welche Daten verarbeitet werden",
		children: (
			<>
				<p>
					RoomFull verarbeitet vor allem Daten, die für den Kernflow nötig sind:
				</p>
				<ul>
					<li>Name, E-Mail-Adresse und Rolle deines Accounts</li>
					<li>Anmelde- und Session-Informationen</li>
					<li>Buchungsdaten wie Unit, Startzeit, Endzeit und Status</li>
					<li>technische Request-Daten beim Aufruf der Anwendung</li>
				</ul>
			</>
		),
	},
	{
		id: "usage",
		navLabel: "Wie Daten genutzt werden",
		title: "Wie Daten genutzt werden",
		children: (
			<p>
				Die Daten werden genutzt, um Accounts bereitzustellen, Buchungsanfragen
				zu prüfen, Buchungen anzulegen, eigene Buchungen anzuzeigen und Admins
				die operative Verwaltung aktiver Units und Buchungen zu ermöglichen.
			</p>
		),
	},
	{
		id: "storage",
		navLabel: "Session und lokale Speicherung",
		title: "Session und lokale Speicherung",
		children: (
			<p>
				Nach der Anmeldung speichert das Frontend ein Auth-Token im lokalen
				Browser-Speicher, damit geschützte Bereiche wie „Meine Buchungen“
				aufgerufen werden können. Beim Abmelden wird dieses Token aus dem
				Browser entfernt.
			</p>
		),
	},
	{
		id: "sharing",
		navLabel: "Weitergabe an Dritte",
		title: "Weitergabe an Dritte",
		children: (
			<p>
				Für dieses MVP sind keine Zahlungsanbieter, Kalenderdienste oder
				Marketing-Integrationen vorgesehen. Eine Weitergabe kann durch
				notwendige technische Dienste wie Hosting oder Datenbankbetrieb
				entstehen und sollte vor Produktivbetrieb konkret dokumentiert werden.
			</p>
		),
	},
	{
		id: "retention",
		navLabel: "Speicherdauer",
		title: "Speicherdauer",
		children: (
			<p>
				Account- und Buchungsdaten werden so lange gespeichert, wie sie für den
				Betrieb des MVP und die Nachvollziehbarkeit von Buchungen erforderlich
				sind. Konkrete Löschfristen sollten vor dem Livegang festgelegt werden.
			</p>
		),
	},
	{
		id: "rights",
		navLabel: "Deine Rechte",
		title: "Deine Rechte",
		children: (
			<>
				<p>
					Je nach geltendem Datenschutzrecht kannst du Auskunft, Berichtigung,
					Löschung, Einschränkung der Verarbeitung oder Widerspruch verlangen.
				</p>
				<p>
					Für produktive Systeme sollte hier zusätzlich ein konkreter Kontaktweg
					und die zuständige Datenschutzaufsicht genannt werden.
				</p>
			</>
		),
	},
	{
		id: "contact",
		navLabel: "Kontakt",
		title: "Kontakt",
		children: (
			<p>
				Fragen zu Datenschutz und Account-Daten sollten an den Betreiber der
				RoomFull-Instanz gehen. Für allgemeine Produktfragen hilft zusätzlich
				die <Link href="/faq">FAQ-Seite</Link>.
			</p>
		),
	},
];

export default function PrivacyPage() {
	return (
		<InfoPageLayout
			title="Datenschutz"
			subtitle="Datenschutzhinweise"
			intro="Kurz, klar und MVP-nah: Welche Daten RoomFull braucht, warum sie verarbeitet werden und welche Punkte vor einem echten Livegang noch konkretisiert werden müssen."
			sections={privacySections}
		/>
	);
}
