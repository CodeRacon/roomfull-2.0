# Teams and Team Booking Share Flow

Status: fachlich abgestimmt, Implementierung ausstehend  
Technisches Gate: Apple-Calendar-Prototyp am 24.06.2026 fehlgeschlagen; RSVP-Handoff verworfen

## Produktgrenze

- Ausschliesslich Customers verwalten private Teams fuer wiederkehrende Team Booking Shares.
- Ein Team ist eine benannte Kontaktgruppe, keine Organisation oder kollaborative RoomFull-Mitgliedschaft.
- Team Members sind Kontakte aus Name und E-Mail-Adresse ohne Account-Abgleich, Zustimmung oder In-App-Benachrichtigungen.
- Teams und Team Booking Shares sind optional und werden nicht an Bookings gespeichert.
- RoomFull versendet keine E-Mails oder Kalendereinladungen. Der Customer kopiert Empfaenger und Einladungstext beziehungsweise laedt den empfaengerfreundlichen Share-Kalenderexport herunter und uebernimmt den Versand ausserhalb RoomFull.
- In der oeffentlichen Portfolio-Instanz sind nur fiktive Demo-Kontakte erlaubt. Lokale Share-Tests nutzen ausschliesslich eigene kontrollierte Adressen.

## Teamregeln

- Ein Customer darf maximal 20 Teams mit jeweils maximal 50 Team Members verwalten.
- Teamnamen haben nach Trimmen 1 bis 80 Zeichen und sind pro Customer ohne Beachtung der Gross-/Kleinschreibung eindeutig.
- Ein Team darf leer sein, ist aber erst ab einem Team Member fuer einen Team Booking Share verwendbar.
- Ein Team Member gehoert genau einem Team. Dieselbe Person darf als unabhaengiger Kontakt in mehreren Teams vorkommen.
- Member-Namen haben nach Trimmen 1 bis 100 Zeichen.
- Member-E-Mails werden getrimmt und kleingeschrieben, duerfen hoechstens 254 Zeichen haben und sind pro Team eindeutig.
- Team und Member werden endgueltig geloescht; Team-Loeschung und eine spaetere Owner-Loeschung entfernen zugehoerige Daten per Cascade.

## Datenmodell

### Team

- `id`
- `userId`
- `name`
- `nameKey` fuer normalisierten Vergleich
- `createdAt`
- `updatedAt`
- Unique Constraint: `(userId, nameKey)`

### TeamMember

- `id`
- `teamId`
- `name`
- `email` in normalisierter Kleinschreibung
- `createdAt`
- `updatedAt`
- Unique Constraint: `(teamId, email)`

Die sichtbare Schreibweise des Teamnamens bleibt erhalten. `nameKey` dient nur Vergleich und Eindeutigkeit.

## Backend-Contract

Alle Routen erfordern Authentifizierung und die Rolle `CUSTOMER`. Ownership kommt aus der Session; Requests enthalten keine `userId`.

- `GET /api/me/teams`
- `POST /api/me/teams`
- `GET /api/me/teams/:teamId`
- `PUT /api/me/teams/:teamId`
- `DELETE /api/me/teams/:teamId`
- `POST /api/me/teams/:teamId/members`
- `PUT /api/me/teams/:teamId/members/:memberId`
- `DELETE /api/me/teams/:teamId/members/:memberId`
- `GET /api/me/bookings/:bookingId/share-context`

`GET /api/me/teams` liefert nur `id`, `name` und `memberCount`. Member-Daten werden erst ueber das Team-Detail geladen. Updates nutzen `PUT` mit allen editierbaren Feldern.

`GET /api/me/bookings/:bookingId/share-context` liefert ausschliesslich die fuer den Share benoetigten Booking- und BookableUnit-Daten. Der Backend-Service leitet den Customer aus der Session ab und prueft Ownership sowie `status=ACTIVE && endTime >= now`.

### Fehler-Matrix

| Fehlerfall | HTTP |
|---|---|
| Felder fehlen oder sind ungueltig | `400` |
| Session fehlt oder ist ungueltig | `401` |
| Angemeldete Rolle ist nicht `CUSTOMER` | `403` |
| Team oder Member fehlt oder gehoert einem anderen Customer | `404` |
| Booking fehlt oder gehoert einem anderen Customer | `404` |
| Teamname oder Member-E-Mail ist doppelt | `409` |
| Team- oder Member-Limit ist erreicht | `409` |
| Eigene Booking ist storniert oder `endTime < now` | `409` |

Fremde Ressourcen liefern wie fehlende Ressourcen `404`. Der Share Context macht nur fuer den Owner eine bekannte, aber nicht mehr eligible Booking mit `409` unterscheidbar. Stabile Application-Error-Codes bleiben ein eigener Roadmap-Slice.

## Teamverwaltung

- `/me/teams` zeigt eigene Teams mit Name und Member-Anzahl.
- Ein neues Team wird zuerst nur mit seinem Namen angelegt.
- `/me/teams/[teamId]` erlaubt Team umbenennen und bestaetigt loeschen sowie Members hinzufuegen, bearbeiten und entfernen.
- Profilmenue und Account Overview verlinken auf "Meine Teams".
- Teams und Members werden gemaess aktiver UI-Sprache alphabetisch dargestellt; gleiche Member-Namen werden zusaetzlich nach E-Mail sortiert.
- Die Teamseite weist dauerhaft auf die verantwortliche Verwendung von Kontaktdaten und die Demo-Datengrenze hin.

## Team Booking Share

- Der Team Booking Share ist fuer eigene Bookings mit `status=ACTIVE` und `endTime >= now` vorgesehen; gerade laufende Bookings und der exakte Endzeitpunkt bleiben teilbar. Der Share bleibt vom Buchungsformular getrennt.
- Karten-, Listen- und Kalenderansicht bieten dieselbe Aktion "Mit Team teilen" und fuehren auf `/me/bookings/[bookingId]/share`.
- Die geschuetzte Share-Seite buendelt Booking-Kontext, Team- und Empfaengerauswahl, persoenliche Nachricht, Warnungen und Share Package.
- Share Context und Team Summaries werden unabhaengig parallel geladen. Member-Daten werden erst nach Auswahl eines nicht leeren Teams ueber dessen Team Detail geladen.
- Leere Teams bleiben mit Member-Anzahl `0` sichtbar, sind nicht auswaehlbar und verlinken ihre Teamverwaltung.
- Ohne ein nicht leeres Team verweist zusaetzlich ein Empty State auf "Meine Teams". Team-CRUD wird nicht in den Share eingebettet.
- Auch bei genau einem verwendbaren Team gibt es keine automatische Vorauswahl. Erst die bewusste Auswahl laedt das Team Detail.
- Pro Share wird genau ein Team gewaehlt. Nach der Auswahl sind alle Members vorausgewaehlt und duerfen fuer diesen Share fluechtig abgewaehlt werden.
- Bei einem Teamwechsel bleibt die persoenliche Nachricht erhalten; die bisherige Empfaengerauswahl wird verworfen und alle Members des neuen Teams werden vorausgewaehlt.
- Ohne mindestens einen ausgewaehlten Member bleiben alle vier Share-Package-Aktionen gesperrt. Der bestehende separate Personal Booking Calendar Export bleibt davon unberuehrt.
- Bei mehr ausgewaehlten Members als Unit-Kapazitaet erscheint eine nicht blockierende Warnung.
- Eine optionale persoenliche Nachricht ist reiner Text mit maximal 500 Zeichen, wird in den vorbereiteten kopierbaren Einladungstext aufgenommen und nicht gespeichert.
- Betreff und Nachricht werden aus den nicht editierbaren Booking-Daten erzeugt. Der Text enthaelt eine neutrale Begruessung, die optionale persoenliche Nachricht, Datum, Berliner Uhrzeit, BookableUnit und den Hinweis, die Kalenderdatei manuell anzuhaengen.
- Innerhalb RoomFull ist nur die persoenliche Nachricht editierbar; nach dem Kopieren darf der Customer den Text im eigenen Versandwerkzeug veraendern.
- Betreff, Nachricht und Datumsformat folgen der aktiven UI-Sprache `de` oder `en`; der Share besitzt keinen eigenen Sprachschalter.
- RoomFull stellt ausgewaehlte Empfaengeradressen fuer das BCC-Feld und den vorbereiteten Einladungstext zum Kopieren bereit, versendet aber nichts.
- Die BCC-Aktion kopiert ausschliesslich normalisierte E-Mail-Adressen als kommagetrennte Liste mit Leerzeichen, zum Beispiel `anna@example.com, ben@example.com`.
- Die UI weist ausdruecklich darauf hin, die Adressen in BCC statt in sichtbares An oder CC einzufuegen; die tatsaechliche Verwendung im externen Versandwerkzeug liegt beim Customer.
- Das clientneutrale Share Package bietet vier getrennte Aktionen: "BCC-Adressen kopieren", "Betreff kopieren", "Nachricht kopieren" und "Kalenderdatei herunterladen".
- RoomFull verwendet keinen `mailto:`-Link, oeffnet keinen Versandclient und versucht nicht, die Kalenderdatei automatisch anzuhaengen.
- Der Browser bereitet BCC-Liste, Betreff, Nachricht und Share-Kalenderdatei aus autorisiertem Share Context und geladenem Team Detail auf. Es gibt keinen Generate-Endpoint; Empfaengerauswahl, Nachricht und Datei erreichen das Backend nicht.
- "Kalenderdatei herunterladen" erzeugt eine empfaengerfreundliche `.ics` mit Titel, Zeitraum, BookableUnit und stabiler Booking-UID, aber ohne sichtbare Booking-ID, internen Status, persoenliche Nachricht, Organizer, Attendees oder RSVP.
- Der bestehende persoenliche Export "Zum Kalender hinzufuegen" bleibt ein davon getrenntes Customer-Artefakt.
- Verwendetes Team, Empfaengerauswahl, Nachricht und Versandstatus werden nicht an der Booking gespeichert.

## Verworfener Kalender-Handoff

- Der gescheiterte Ansatz erzeugte im Browser eine Booking Invitation `.ics` mit `ORGANIZER`, `ATTENDEE` und `RSVP` und sollte sie mit derselben UID wie den persoenlichen Export in Apple Calendar oeffnen.
- Dieser Ansatz ist kein aktueller Produktpfad mehr. Team Booking Share verspricht weder Gaesteuebernahme noch Antworten oder Calendar-Client-Kompatibilitaet.

## Apple-Calendar-Prototyp

Der Prototyp laeuft vor Prisma-, API- und UI-Implementierung mit statischen kontrollierten Testdaten.

Er besteht nur, wenn:

- genau ein Event importiert wird,
- Datum, Berliner Uhrzeit, Raum und persoenliche Nachricht stimmen,
- ausgewaehlte Members als Gaeste erhalten bleiben,
- beim Oeffnen noch nichts versendet wird,
- der Customer den Versand bewusst ausloesen kann,
- eine eigene kontrollierte Testadresse die Einladung empfaengt und beantworten kann,
- persoenlicher Export und anschliessende Team-Einladung mit derselben UID nicht als zwei unabhaengige Events erscheinen.

Scheitern insbesondere Gaesteuebernahme, bewusster Versand oder gemeinsame UID, wird der Kalender-Handoff vor Feature-Implementierung neu entschieden.

### Gate-Ergebnis vom 24.06.2026: FAIL

Beobachtet wurde der festgelegte Ablauf aus persoenlichem Export und anschliessender Booking Invitation mit derselben UID:

- Der persoenliche Export wurde mit korrektem Titel, Ort und Berliner Zeitraum importiert.
- Beim Oeffnen der Booking Invitation blieb genau ein Event erhalten; die gemeinsame UID verhinderte damit ein sichtbares Duplikat.
- Apple Calendar uebernahm weder den zusaetzlichen Team Member noch die persoenliche Nachricht in das bestehende Event.
- Apple Calendar bot keine erkennbare bewusste Versandaktion an.
- Dadurch konnten weder Einladungsempfang noch Antwortfluss geprueft werden.

Das Gate ist wegen fehlender Gaesteuebernahme und fehlendem bewusstem Versandpfad nicht bestanden. Der RSVP-faehige Calendar Handoff wurde daraufhin durch den Team Booking Share ohne Gaeste- oder Antwortversprechen ersetzt. Die Folgetickets #145 bis #149 wurden am 24.06.2026 an diesen Scope angepasst und fuer AFK-Umsetzung freigegeben; #144 ist als abgeschlossene Validierung geschlossen. Client-spezifische Workarounds werden nicht aus diesem Prototyp abgeleitet.

## Delivery Order

1. [x] Fehlgeschlagenen Apple-Calendar-Prototyp dokumentieren und Team Booking Share fachlich festlegen
2. [x] PRD und Folgetickets auf Team Booking Share anpassen
3. [x] Prisma-Modelle, Migration und Team-Backend-Contract
4. [x] OpenAPI, Bruno und Backend-Tests
5. "Meine Teams" und Team-Detailseite
6. Team Booking Share fuer eligible Bookings
7. End-to-End-Happy-Path sowie Kernfehlerfaelle

## Done-Kriterien

- Ein Customer kann ein Team anlegen, umbenennen und loeschen sowie Members hinzufuegen, bearbeiten und entfernen.
- Ein anderer Customer und ein Admin koennen das Team weder lesen noch veraendern.
- Duplikate, Ownership und Mengenlimits werden im Backend geprueft.
- Ein Customer kann fuer eine eigene eligible Booking ein Team waehlen, Members abwaehlen, BCC-Adressen, Betreff und Einladungstext kopieren sowie die empfaengerfreundliche Kalenderdatei herunterladen.
- RoomFull versendet keine E-Mail oder Kalendereinladung und verspricht weder Gaesteuebernahme noch RSVP.
- Flow-Doku, OpenAPI, Bruno sowie relevante Backend- und Frontend-Tests sind aktuell.
