import type { Metadata } from "next";
import Link from "next/link";
import { defaultLocale, isLocale, type Locale } from "@/shared/i18n";
import { appRoutes } from "@/shared/routing";
import type { InfoPageSection } from "@/shared/ui";
import { InfoPageLayout } from "@/shared/ui";

export const metadata: Metadata = {
	title: "Datenschutz & Impressum | RoomFull",
	description: "Datenschutzhinweise und Impressum für RoomFull.",
};

type PrivacyPageProps = {
	params: Promise<unknown>;
};

function getPrivacyPageLocale(params: unknown): Locale {
	const lang =
		typeof params === "object" &&
		params !== null &&
		"lang" in params &&
		typeof params.lang === "string"
			? params.lang
			: null;

	return isLocale(lang) ? lang : defaultLocale;
}

function createPrivacySections(locale: Locale): InfoPageSection[] {
	return [
		{
			id: "overview",
			navLabel: "Einordnung",
			title: "Einordnung",
			children: (
				<>
					<p>
						Diese Seite enthält die Datenschutzhinweise und das Impressum für
						RoomFull.
					</p>
					<p>
						RoomFull ist ein nicht-kommerzielles Portfolio- und Lernprojekt. Es
						handelt sich nicht um einen realen Coworking-Service. Bitte gib
						keine echten sensiblen Daten, keine produktiv genutzten Passwörter
						und keine Daten anderer realer Personen ein.
					</p>
				</>
			),
		},
		{
			id: "controller",
			navLabel: "Verantwortlicher",
			title: "Verantwortlicher",
			children: (
				<>
					<p>Verantwortlich für die Datenverarbeitung ist:</p>
					<p>
						Michael Buschmann
						<br />
						Wernerstraße 18
						<br />
						01159 Dresden
						<br />
						Deutschland
						<br />
						E-Mail:{" "}
						<a href="mailto:hey@michael-buschmann.dev">
							hey@michael-buschmann.dev
						</a>
					</p>
				</>
			),
		},
		{
			id: "imprint",
			navLabel: "Impressum",
			title: "Impressum",
			children: (
				<>
					<p>Angaben gemäß § 5 DDG</p>
					<p>
						Michael Buschmann
						<br />
						Wernerstraße 18
						<br />
						01159 Dresden
						<br />
						Deutschland
					</p>
					<p>
						Kontakt:
						<br />
						E-Mail:{" "}
						<a href="mailto:hey@michael-buschmann.dev">
							hey@michael-buschmann.dev
						</a>
					</p>
					<p>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV:</p>
					<p>
						Michael Buschmann
						<br />
						Wernerstraße 18
						<br />
						01159 Dresden
						<br />
						Deutschland
					</p>
				</>
			),
		},
		{
			id: "collected-data",
			navLabel: "Welche Daten verarbeitet werden",
			title: "Welche Daten verarbeitet werden",
			children: (
				<>
					<p>
						RoomFull verarbeitet vor allem Daten, die für den Kernflow nötig
						sind:
					</p>
					<ul>
						<li>
							Name, E-Mail-Adresse, Passwort-Hash und Rolle deines Accounts
						</li>
						<li>Anmelde- und Session-Informationen</li>
						<li>Buchungsdaten wie Unit, Startzeit, Endzeit und Status</li>
						<li>
							Team-Daten wie Teamname sowie Namen und E-Mail-Adressen von
							Teammitgliedern, sofern du diese eingibst
						</li>
						<li>Kontaktanfragen mit Art der Anfrage und Nachricht</li>
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
					Die Daten werden genutzt, um Accounts bereitzustellen,
					Buchungsanfragen zu prüfen, Buchungen anzulegen, eigene Buchungen
					anzuzeigen, Team- und Kontaktfunktionen bereitzustellen und Admins die
					operative Verwaltung aktiver Units, Buchungen und Kontaktanfragen zu
					ermöglichen. Rechtsgrundlagen sind insbesondere Art. 6 Abs. 1 lit. b
					DSGVO für die angefragten Funktionen und Art. 6 Abs. 1 lit. f DSGVO
					für Betrieb, Sicherheit, Fehleranalyse und Missbrauchsschutz.
				</p>
			),
		},
		{
			id: "storage",
			navLabel: "Cookies und Speicherung",
			title: "Cookies und Speicherung",
			children: (
				<>
					<p>RoomFull verwendet nur technisch notwendige Speicherung:</p>
					<ul>
						<li>
							ein Auth-Cookie zur Anmeldung und Session-Verwaltung geschützter
							Bereiche
						</li>
						<li>ein Sprach-Cookie zur Speicherung deiner Sprachauswahl</li>
					</ul>
					<p>
						Das Auth-Cookie ist als HttpOnly-Cookie ausgestaltet und kann nicht
						durch JavaScript ausgelesen werden. Es werden keine Marketing-,
						Tracking- oder Analyse-Cookies eingesetzt.
					</p>
				</>
			),
		},
		{
			id: "sharing",
			navLabel: "Weitergabe an Dritte",
			title: "Weitergabe an Dritte",
			children: (
				<>
					<p>
						Für RoomFull sind keine Zahlungsanbieter, Kalenderdienste,
						Marketing-Integrationen, Sentry oder eigenes Analytics-Tracking
						vorgesehen.
					</p>
					<p>
						Eine Verarbeitung durch technische Dienstleister kann entstehen,
						soweit dies für Betrieb, Hosting, Datenbank, DNS, Sicherheit und
						Logging erforderlich ist. Geplant sind insbesondere Vercel für das
						Frontend, Render für das Backend, Neon für PostgreSQL und Hostinger
						für DNS.
					</p>
				</>
			),
		},
		{
			id: "retention",
			navLabel: "Speicherdauer",
			title: "Speicherdauer",
			children: (
				<>
					<p>
						Account-, Team-, Kontakt- und Buchungsdaten werden so lange
						gespeichert, wie sie für den Betrieb der Demo-Anwendung erforderlich
						sind.
					</p>
					<p>
						Da RoomFull ein Portfolio- und Lernprojekt ist, können Demo-Daten
						unregelmäßig gelöscht oder zurückgesetzt werden. Technische Logs
						werden nur für Betrieb, Sicherheit und Fehleranalyse genutzt und
						nach den Fristen der jeweiligen Hosting-Anbieter gelöscht.
					</p>
				</>
			),
		},
		{
			id: "rights",
			navLabel: "Deine Rechte",
			title: "Deine Rechte",
			children: (
				<>
					<p>
						Du hast nach Maßgabe der DSGVO insbesondere Rechte auf Auskunft,
						Berichtigung, Löschung, Einschränkung der Verarbeitung,
						Datenübertragbarkeit und Widerspruch gegen bestimmte Verarbeitungen.
					</p>
					<p>
						Du hast außerdem das Recht, dich bei einer
						Datenschutzaufsichtsbehörde zu beschweren. Zur Ausübung deiner
						Rechte kannst du dich an{" "}
						<a href="mailto:hey@michael-buschmann.dev">
							hey@michael-buschmann.dev
						</a>{" "}
						wenden.
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
					Fragen zu Datenschutz, Impressum und Account-Daten kannst du per
					E-Mail an{" "}
					<a href="mailto:hey@michael-buschmann.dev">
						hey@michael-buschmann.dev
					</a>{" "}
					senden. Für allgemeine Produktfragen hilft zusätzlich die{" "}
					<Link href={appRoutes.faq(locale)}>FAQ-Seite</Link>.
				</p>
			),
		},
	];
}

export default async function PrivacyPage({ params }: PrivacyPageProps) {
	const locale = getPrivacyPageLocale(await params);

	return (
		<InfoPageLayout
			title="Datenschutz & Impressum"
			subtitle="Rechtliches"
			intro="Kurz und klar: wer RoomFull verantwortet, welche Daten die Demo braucht und wie du Kontakt aufnehmen kannst."
			sections={createPrivacySections(locale)}
		/>
	);
}
