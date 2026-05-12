# Project Decisions

## Ziel

Diese Datei hält bewusste Produkt- und Architekturentscheidungen für RoomFull 2.0 fest.

## Produkt

- RoomFull wird als kleines MVP gebaut
- Fokus liegt auf Buchungslogik, Rollen, Verfügbarkeit und sauberer Struktur
- Version 1 soll bewusst nicht alles können

## Nicht Teil von Version 1

- Payments
- E-Mail-Benachrichtigungen
- Kalender-Sync
- Echtzeit-Updates
- Wartelisten
- komplexe Preislogik
- mehrere Standorte
- AI-Funktionen
- perfektes UI-Finishing

## Modell-Schnitt (Big-Bang)

- Legacy `space`/`spaceType` wird abgelöst
- neues Zielmodell:
  - `Area`
  - `UnitType`
  - `BookableUnit`
  - `Booking(unitId, ...)`
- Legacy-Routen auf `/spaces` werden entfernt (kein Parallelbetrieb)

## API-Sprache

- intern: `BookableUnit`
- extern (API): kurze Sprache mit `Unit`/`unitId`
- Endpunkte:
  - `/public/units`
  - `/public/booking-options`
  - `/admin/units`

## Public BookingOptions

- Die Homepage zeigt perspektivisch keine einzelnen `BookableUnit`s mehr, sondern `BookingOption`s als Customer-facing Einstieg in den Buchungsflow
- Eine `BookingOption` entspricht im MVP genau einem bewusst freigegebenen `UnitType`
- Public BookingOptions kommen aus einer expliziten Backend-Allowlist, nicht automatisch aus allen `UnitType`-Datensätzen
- Allowlist für V1:
  - `HOT_DESK`
  - `BOOTH`
  - `TEAM_ROOM`
  - `MEETING_ROOM`
- `BookingOption.key` entspricht dem jeweiligen `UnitTypeName`
- Endpoint: `GET /public/booking-options`
- Der Endpoint beschreibt grundsätzliche Buchungsoptionen ohne Zeitraum
- Zeitbezogene Verfügbarkeit kommt später in separaten Flow-Schritten
- `status` beschreibt nur grundsätzliche Verfügbarkeit:
  - `AVAILABLE`
  - `UNAVAILABLE`
- `bookingMode` beschreibt den nächsten Buchungsschritt:
  - `AUTO_ASSIGN`
  - `CHOOSE_UNIT`
- `areaSelection` beschreibt, ob der Customer eine Area wählen muss:
  - `REQUIRED`
  - `NOT_APPLICABLE`
- `HOT_DESK` nutzt `AUTO_ASSIGN` und `areaSelection: REQUIRED`
- `BOOTH`, `TEAM_ROOM` und `MEETING_ROOM` nutzen `CHOOSE_UNIT` und `areaSelection: NOT_APPLICABLE`
- `HOT_DESK.areas[]` wird mit buchbaren Areas und deren aktiver Unit-Anzahl befüllt
- `BOOTH`, `TEAM_ROOM` und `MEETING_ROOM` liefern `areas: []`, auch wenn konkrete Units intern Area-Zuordnungen haben
- Ein fehlender Allowlist-`UnitType` ist ein System-/Seed-Fehler und soll hart sichtbar werden
- UI-Labels, Descriptions und Color-Schemes bleiben Frontend-Presentation-Mapping und sind keine Backend-Fachlogik

## Zeitmodell

- keine festen Timeslot-Tabellen
- Bookings arbeiten mit `start_time` und `end_time`
- Verfügbarkeit wird aus bestehenden Bookings berechnet

## Öffnungszeiten-Entscheidung

- Source of Truth: globale Öffnungszeiten für alle UnitTypes
- Version 1: Montag bis Freitag, `08:00` bis `22:00`
- Öffnungszeiten werden nicht pro Area oder UnitType gepflegt
- Jede Booking-/Availability-Prüfung nutzt diese globalen Öffnungszeiten

## Dauerregeln-Entscheidung

- Dauerregeln sind datengetrieben über `unit_types`
- Startwerte:
  - `HOT_DESK`: min 30, max 240 Minuten
  - `BOOTH`: min 60, max 480 Minuten
  - `TEAM_ROOM`: min 60, max 480 Minuten
  - `MEETING_ROOM`: min 60, max 480 Minuten

## Hot-Desk-Entscheidung

- `Hot Desk` ist ein `UnitType` für einzelne buchbare Plätze
- `Open World` und `Quiet Space` sind Areas, keine buchbaren Einheiten
- `HOT_DESK` braucht immer eine `areaId`
- Auto-Assign-Modus:
  - Request: `areaId + unitType + start + end`
  - in V1 nur für `HOT_DESK`
  - Auswahl deterministisch nach `displayOrder`, dann `id`
  - race-sicher über Transaktion/Konflikt-Retry

## Booking-Modell

- Status in Version 1:
  - `active`
  - `cancelled`
- stornierte Bookings bleiben historisch erhalten
- stornierte Bookings blockieren keine Verfügbarkeit mehr
- `start_time < end_time`
- nur zukünftige Zeiträume
- nur Montag bis Freitag
- nur innerhalb globaler Öffnungszeiten (08:00-22:00)
- Overlap-Regel: `new_start < existing_end AND new_end > existing_start`
- Customers dürfen nur eigene zukünftige Bookings stornieren
- Admin darf Bookings lesen und ebenfalls Bookings anlegen
- kein Admin-Fremd-Storno in V1 (späterer Ausbau)

## Fachliche Wahrheit

- das Backend ist die verbindliche Instanz für Business-Logik
- das Frontend unterstützt die Regeln, definiert sie aber nicht

## Frontend-Architektur

- Frontend nutzt pragmatisches Feature-Sliced Design
- keine globale `components`-Mischstruktur
- klare Trennung von `entities`, `features`, `widgets`, `pages`, `shared`

## Backend-Architektur

- klassisch modular mit `routes`, `controllers`, `services`, `db`, `middleware`
- Business-Logik gehört in `services`

## Leitregel

Erst:

- Regeln
- Datenmodell
- API
- UI
- Qualität
- Ausbau
