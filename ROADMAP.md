# RoomFull Roadmap

Diese Roadmap enthaelt ausschliesslich vorgemerkte, noch nicht umgesetzte Produkt- und Technikthemen. Reihenfolge und Prioritaet sind noch nicht festgelegt.

## Zeitliche Unit-Blockouts

Admins koennen eine aktive BookableUnit fuer einen begrenzten Zeitraum sperren, ohne sie dauerhaft zu deaktivieren.

- Blockout besitzt Start und Ende.
- Blockout verhindert neue Bookings im betroffenen Zeitraum.
- `isActive` bleibt davon getrennt.
- Auswirkungen auf bereits bestehende Bookings muessen vor Umsetzung fachlich entschieden werden.

## Profil bearbeiten

Angemeldete Users koennen ihre bearbeitbaren Profildaten im Account-Bereich aktualisieren.

- Umsetzung als eigene Account-Feature-Slice.
- Erlaubte Profilfelder und Verifikation muessen vor Umsetzung festgelegt werden.

## Passwort aendern

Angemeldete Users koennen ihr Passwort im Account-Bereich sicher aendern.

- Umsetzung als eigene Account-Feature-Slice.
- Aktuelles Passwort, neues Passwort und Bestaetigung bilden den Kernflow.
- Session-Verhalten nach erfolgreicher Aenderung muss vor Umsetzung festgelegt werden.

## Stabile Backend-Error-Codes

Backend-Fehler erhalten stabile maschinenlesbare Application-Error-Codes zusaetzlich zum HTTP-Status.

- Frontend mappt Error-Codes auf lokalisierte UI-Copy.
- Backend-Message-Strings bleiben technische Fallbacks.
- Contract, Tests, OpenAPI und Bruno werden gemeinsam aktualisiert.

## Private Teams und Team Booking Share

Customers verwalten private Kontaktgruppen und bereiten fuer eigene Bookings ein clientneutrales Share Package vor, ohne dass RoomFull E-Mails oder Kalendereinladungen versendet.

Verbindliche Flow-Doku: [Teams and Team Booking Share Flow](backend/docs/teams-flow.md)

### Private Teams

- "Meine Teams" liegt geschuetzt unter `/me/teams` und ist ueber Profilmenue sowie Account Overview erreichbar.
- Team Detail unter `/me/teams/[teamId]` erlaubt Name aendern, Members hinzufuegen, bearbeiten und entfernen sowie das Team bestaetigt endgueltig loeschen.
- Ein Team darf leer angelegt werden. Ein Team Booking Share benoetigt mindestens einen Team Member.
- Teamnamen haben nach Trimmen 1 bis 80 Zeichen und sind pro Customer ueber einen normalisierten `nameKey` ohne Beachtung der Gross-/Kleinschreibung eindeutig.
- Team-Member-Namen haben nach Trimmen 1 bis 100 Zeichen. E-Mail-Adressen sind gueltig, hoechstens 254 Zeichen lang, normalisiert kleingeschrieben und pro Team eindeutig.
- Ein Customer verwaltet hoechstens 20 Teams mit jeweils hoechstens 50 Members.
- Team Members sind private Kontakte ohne RoomFull-Account, User-Abgleich, Zustimmungssystem oder gemeinsame Team-Mitgliedschaft.
- Teams und Members werden lokalisiert alphabetisch dargestellt; gleiche Member-Namen werden zusaetzlich nach E-Mail sortiert.
- Team- und spaetere Customer-Loeschung entfernen zugehoerige Daten per Cascade. Soft Delete und Papierkorb sind nicht vorgesehen.
- Ausschliesslich Customers duerfen eigene Teams verwalten. Fremde und fehlende Teamressourcen liefern identisch `404`.
- Die Portfolio-UI fordert ausschliesslich fiktive Demo-Kontakte und erklaert die verantwortliche externe Verwendung der gespeicherten Daten.

### Backend-Contract

- Der session-scoped Team-Contract liegt unter `/api/me/teams`; Requests enthalten keine `userId`.
- Teamliste und Erstellung nutzen `GET` und `POST /api/me/teams`; Detail, Update und Delete nutzen `GET`, `PUT` und `DELETE /api/me/teams/:teamId`.
- Members werden verschachtelt ueber `POST /api/me/teams/:teamId/members` sowie `PUT` und `DELETE /api/me/teams/:teamId/members/:memberId` gepflegt.
- `GET /api/me/teams` liefert ausschliesslich `id`, `name` und `memberCount`; personenbezogene Member-Daten kommen erst aus Team Detail.
- `GET /api/me/bookings/:bookingId/share-context` liefert die autorisierte Booking- und BookableUnit-Grundlage fuer den Share und prueft Ownership sowie `status=ACTIVE && endTime >= now`.
- Share Context verwendet `401` ohne Session, `403` fuer Nicht-Customers, `404` fuer fehlende oder fremde Bookings und `409` fuer eigene stornierte oder beendete Bookings.
- OpenAPI, Bruno, Service-, Persistenz- und API-Tests werden gemeinsam mit dem jeweiligen Contract geliefert.

### Team Booking Share

- Teams bleiben fuer Bookings optional. Die Share-Auswahl findet erst nach erfolgreicher Booking statt.
- Karten-, Listen- und Kalenderansicht bieten "Mit Team teilen" und fuehren auf `/me/bookings/[bookingId]/share`.
- Share Context und Team Summaries laden parallel; Team Detail erst nach bewusster Auswahl genau eines nicht leeren Teams.
- Auch das einzige verwendbare Team wird nicht automatisch gewaehlt. Leere Teams bleiben mit `0 Members` sichtbar, aber deaktiviert.
- Nach Teamwahl sind alle Members vorausgewaehlt und koennen fluechtig abgewaehlt werden. Ein Teamwechsel erhaelt die persoenliche Nachricht, setzt die Empfaengerauswahl aber auf alle Members des neuen Teams zurueck.
- Ohne mindestens einen ausgewaehlten Member bleiben alle vier Share-Package-Aktionen gesperrt.
- Uebersteigt die Empfaengeranzahl die Unit-Kapazitaet, erscheint eine deutliche nicht blockierende Warnung.
- Das clientneutrale Package besteht aus "BCC-Adressen kopieren", "Betreff kopieren", "Nachricht kopieren" und "Kalenderdatei herunterladen".
- BCC kopiert nur normalisierte E-Mail-Adressen als `, `-getrennte Liste. Die UI weist ausdruecklich auf BCC statt sichtbares An oder CC hin.
- Betreff und Nachricht werden aus unveraenderlichen Booking-Daten erzeugt. Nur eine optionale persoenliche Nachricht bis 500 Zeichen ist in RoomFull editierbar.
- Share-Copy und Datumsformat folgen der aktiven UI-Sprache `de` oder `en`; ein eigener Sprachschalter ist nicht vorgesehen.
- Der empfaengerfreundliche Share-Kalenderexport enthaelt Titel, Zeitraum, BookableUnit und stabile Booking-UID, aber keine sichtbare Booking-ID, internen Status, persoenliche Nachricht, Organizer, Attendees oder RSVP.
- Personal Booking Calendar Export und Share Calendar Export bleiben getrennte Artefakte mit derselben stabilen Booking-UID.
- Der Browser bereitet das Package aus autorisiertem Share Context und Team Detail auf. Es gibt keinen Generate-Endpoint, `mailto:`-Flow, automatischen Anhang oder automatischen Clientwechsel.
- RoomFull speichert weder verwendetes Team noch Empfaengerauswahl, Nachricht, Datei oder Versandstatus.

### Verworfenes RSVP-Handoff

- Der Apple-Calendar-Prototyp vom 24.06.2026 hielt mit gemeinsamer UID genau ein Event, uebernahm aber weder Team Member noch persoenliche Nachricht und bot keine bewusste Versandaktion.
- Der fruehere Booking-Invitation-Ansatz mit Organizer, Attendees und RSVP ist deshalb verworfen und kein Delivery-Gate mehr.
- RoomFull verspricht keine Gaesteuebernahme, Antworten, Versand- oder Calendar-Client-Kompatibilitaet.

## Portfolio Guest Login mit dynamischen Demo-Daten

Die oeffentliche Portfolio-Instanz soll perspektivisch einen Guest-Login anbieten, der RoomFull ohne manuelle Registrierung sofort als vorbefuelltes Produkt erlebbar macht.

- Der Guest-Account enthaelt bereits aktive, vergangene und stornierte Bookings, eine Kontaktanfrage sowie zwei bis drei Teams mit ausschliesslich fiktiven Demo-Kontakten.
- Die Demo-Daten werden beim Start der Guest-Session relativ zum aktuellen Datum erzeugt oder aktualisiert: aktive Bookings liegen einige Tage in der Zukunft, vergangene und stornierte Bookings maximal zwei Wochen in der Vergangenheit, die Kontaktanfrage wenige Tage zurueck.
- Teamdaten in der oeffentlichen Demo bleiben bewusst fiktiv. Die UI soll klar machen, dass keine echten Drittadressen eingetragen werden sollen.
- Der Guest-Login ist ein Portfolio-Demo-Mechanismus, kein neues Rollenmodell und kein Ersatz fuer normale Customer-Accounts.
- Vor Umsetzung muessen Scope, Reset-Verhalten, Datenisolation, Missbrauchsschutz und Auswirkungen auf Admin-Ansichten geklaert werden.

## Deutsche Team-Copy nachschaerfen

Die deutsche UI-Copy fuer Teams und Team Booking Share soll weniger interne Fachsprache verwenden, ohne nuetzliche technische Begriffe komplett zu vermeiden.

- "Teams" bleibt in der UI zulaessig und muss nicht pauschal durch "Kontaktgruppen" ersetzt werden.
- `.ics` ist fuer diesen Kontext zumutbar, sollte bei erster relevanter Nennung als `.ics (Kalenderdatei)` erklaert werden.
- "Share", "Produktgrenze", "Buchungsfreigabe" und aehnlich interne Begriffe sollen in Customer-facing Copy vermieden werden.
- Der Flow soll sprachlich als "Einladung per Mail vorbereiten" erklaert werden: RoomFull bereitet Empfaenger, Betreff, Nachricht und Kalenderdatei vor, versendet aber nicht selbst.
