# Domain Rules

## Ziel

Diese Datei hält die fachlichen Kernregeln von RoomFull 2.0 fest.

## Rollen

Es gibt zwei Rollen:

- `customer`
- `admin`

### Customer darf

- aktive Units sehen
- Unit-Details sehen
- Unit-Verfügbarkeit prüfen
- eigene Bookings anlegen
- eigene Bookings sehen
- eigene zukünftige Bookings stornieren
- Customer Contact Requests absenden
- eigene Teams und Team Members verwalten
- eligible eigene Bookings mit einem Team teilen

### Customer darf nicht

- Units anlegen oder bearbeiten
- Units deaktivieren
- fremde Bookings sehen oder stornieren
- fremde Teams oder Team Members sehen oder verwalten

### Admin darf

- Units anlegen
- Units bearbeiten
- Units deaktivieren
- alle Bookings sehen
- Bookings ebenfalls anlegen (operativer HelpDesk-Fall)
- Customer Contact Requests lesen und global als gelesen markieren
- Booking-Nachfrage und Stornoquote einsehen

## Kernbegriffe

- `Area` (z. B. "Open World")
- `UnitType` (`HOT_DESK`, `BOOTH`, `TEAM_ROOM`, `MEETING_ROOM`)
- `BookableUnit` (konkretes buchbares Objekt)
- `BookingOption` (Customer-facing Einstieg in den Buchungsflow)
- `Team` (private Kontaktgruppe eines Customers)
- `TeamMember` (Kontakt innerhalb genau eines Teams, kein User)
- `ContactRequest` (Customer-Anfrage ohne E-Mail-Versand)

Gebucht wird immer eine konkrete `BookableUnit`.

## BookingOption-Regeln

Eine BookingOption:

- entspricht im MVP genau einem bewusst freigegebenen UnitType
- wird über eine explizite Backend-Allowlist veröffentlicht
- ist der Einstieg auf der Booking Options Page `/booking-options`
- ist kein Ersatz für die konkrete BookableUnit, die am Ende gebucht wird

Allowlist in V1:

- `HOT_DESK`
- `BOOTH`
- `TEAM_ROOM`
- `MEETING_ROOM`

BookingOptions haben:

- `bookingMode`: `AUTO_ASSIGN` oder `CHOOSE_UNIT`
- `areaSelection`: `REQUIRED` oder `NOT_APPLICABLE`
- `status`: `AVAILABLE` oder `UNAVAILABLE`
- `totalActiveUnits`
- `areas`
- `units` als schlanke Vorschau konkreter BookableUnits bei `CHOOSE_UNIT`

`status` beschreibt nur grundsätzliche Verfügbarkeit ohne Zeitraum. Zeitbezogene Availability wird separat geprüft.

Fehlt ein UnitType aus der Allowlist in der Datenbank, ist das ein System-/Seed-Fehler.

## Area-Regeln

Eine Area:

- gruppiert mehrere BookableUnits
- kann aktiv oder inaktiv sein

## Unit-Regeln

Eine BookableUnit:

- hat einen Namen
- gehört zu genau einem UnitType
- hat eine Kapazität
- hat eine `displayOrder` für deterministische Auswahl
- kann optional einer Area zugeordnet sein (`areaId` optional)
- ist aktiv oder deaktiviert

Zusätzliche Area-Regeln:

- `HOT_DESK` braucht immer eine `areaId`
- `BOOTH`, `TEAM_ROOM` und `MEETING_ROOM` dürfen optional eine Area haben
- im Public BookingOptions-Contract werden `areas[]` nur für `HOT_DESK` befüllt
- `BOOTH`, `TEAM_ROOM` und `MEETING_ROOM` liefern im BookingOptions-Contract `areas: []`
- konkrete Hot-Desk-IDs werden nicht veröffentlicht; `HOT_DESK` liefert `units: []`
- `CHOOSE_UNIT`-Optionen liefern aktive BookableUnits als `units[]` in `displayOrder`

## Booking-Regeln

Eine Booking verbindet:

- `user`
- `unit`
- `start_time`
- `end_time`

### Booking-Status

- `active`
- `cancelled`

Bedeutung:

- `active` blockiert die Unit
- `cancelled` bleibt historisch erhalten, blockiert aber nicht mehr

## Zeitmodell

Version 1 arbeitet ohne gespeicherte TimeSlot-Objekte.

Verfügbarkeit wird aus bestehenden Bookings berechnet über:

- `start_time`
- `end_time`

Der Create-Contract nimmt `date` sowie lokale `HH:mm`-Werte für `startTime` und `endTime` entgegen. Das Backend interpretiert diese verbindlich als Coworking-Zeit in `Europe/Berlin` und persistiert daraus UTC-Zeitpunkte.

Alle Bookings müssen auf dem globalen Booking Time Grid liegen:

- 15-Minuten-Raster
- Start und Ende müssen Rasterpunkte sein
- UnitTypes unterscheiden sich über Dauergrenzen, nicht über eigene Raster

## Öffnungszeiten

Für Version 1 gelten globale Öffnungszeiten:

- Montag bis Freitag
- 08:00 bis 22:00
- dieselben Öffnungszeiten gelten für alle UnitTypes

## Dauerregeln pro UnitType

- `HOT_DESK`: min 30 Minuten, max 240 Minuten
- `BOOTH`: min 60 Minuten, max 240 Minuten
- `TEAM_ROOM`: min 60 Minuten, max 480 Minuten
- `MEETING_ROOM`: min 60 Minuten, max 480 Minuten

## Booking-Request-Modi

### Direktmodus

- Request enthält `unitId + date + startTime + endTime`
- Booking wird auf genau dieser Unit geprüft/angelegt

### Auto-Assign-Modus

- Request enthält `areaId + unitType + date + startTime + endTime`
- dauerhaft nur für `HOT_DESK` erlaubt
- System sucht freie Unit deterministisch:
  - `displayOrder` aufsteigend
  - bei Gleichstand `id` aufsteigend

## Verbindliche Buchungsregeln

- nur aktive Units sind buchbar
- nur zukünftige Zeiträume sind buchbar
- `start_time < end_time`
- Start und Ende müssen am selben Kalendertag liegen
- Start und Ende müssen auf dem 15-Minuten-Booking-Time-Grid liegen
- Booking muss innerhalb globaler Öffnungszeiten liegen
- Dauer muss zur UnitType-Policy passen
- keine Überschneidung aktiver Bookings auf derselben Unit
- Customers dürfen nur eigene zukünftige Bookings stornieren
- Historie bleibt erhalten
- Auto-Assign muss race-sicher sein (Transaktion/Konflikt-Retry)

## Überlappungslogik

Eine neue Booking kollidiert mit einer bestehenden aktiven Booking derselben Unit, wenn:

```txt
new_start < existing_end
AND
new_end > existing_start
```

## Team-Regeln

- ein Team gehört genau einem Customer
- Teamnamen werden sichtbar getrimmt und über einen normalisierten Key pro Customer case-insensitive eindeutig gehalten
- Teamnamen haben 1 bis 80 Zeichen
- ein Customer darf höchstens 20 Teams besitzen
- Teams dürfen leer sein
- ein Team darf höchstens 50 Team Members enthalten
- Team Members gehören genau einem Team und werden nicht mit Users verknüpft
- Member-Namen haben 1 bis 100 Zeichen
- Member-E-Mails werden getrimmt und kleingeschrieben, haben höchstens 254 Zeichen und sind pro Team eindeutig
- Team-Löschung entfernt zugehörige Members per Cascade
- fehlende und fremde Team-Ressourcen liefern für Customers identisch `404`

## Team Booking Share

- Share Context ist Customer-only und session-scoped
- nur eigene Bookings mit `status=ACTIVE` und `endTime >= now` sind eligible
- RoomFull speichert weder Team-Auswahl, Empfänger, persönliche Nachricht, erzeugte Inhalte noch Versandstatus
- RoomFull versendet keine Einladung und öffnet keinen Mail-Client automatisch
- das Package besteht aus getrennten BCC-, Betreff-, Nachrichten- und Kalenderdatei-Aktionen
- die Team-Share-`.ics` enthält keine internen Booking-IDs, Attendees, RSVP oder persönliche Nachricht

## Contact-Request-Regeln

- nur Customers dürfen Contact Requests mit `QUESTION`, `FEEDBACK` oder `CRITICISM` erstellen
- Nachrichten dürfen nicht leer sein
- neue Requests starten global mit `isRead=false`
- Admins dürfen sie lesen, filtern und global als gelesen markieren
- RoomFull versendet keine E-Mail und bietet keine Antwortfunktion

## Entitäten

- `Role`
- `User`
- `Team`
- `TeamMember`
- `Area`
- `UnitType`
- `BookableUnit`
- `Booking`
- `ContactRequest`

## Beziehungen

- `Role` 1 --- n `User`
- `Area` 1 --- n `BookableUnit` (optional auf Unit-Seite)
- `UnitType` 1 --- n `BookableUnit`
- `User` 1 --- n `Booking`
- `User` 1 --- n `Team`
- `Team` 1 --- n `TeamMember`
- `User` 1 --- n `ContactRequest`
- `BookableUnit` 1 --- n `Booking`

## Fachliche Validierung

### User

- E-Mail muss eindeutig sein
- Passwort darf nicht leer sein
- Rolle muss existieren

### Unit

- Name darf nicht leer sein
- Kapazität muss größer als 0 sein
- UnitType muss existieren
- `displayOrder` muss >= 0 sein
- `areaId` ist optional, muss bei Angabe existieren
- bei `HOT_DESK` ist `areaId` verpflichtend

### Booking

- User muss existieren
- Unit muss existieren
- Unit muss aktiv sein
- `start_time` muss in der Zukunft liegen
- `end_time` muss nach `start_time` liegen
- Dauer muss zur UnitType-Policy passen
- Zeitraum muss innerhalb der globalen Öffnungszeiten liegen
- es darf keine aktive kollidierende Booking geben

## Backend-Regel

Diese Fachregeln werden im Backend durchgesetzt, nicht nur im Frontend.
