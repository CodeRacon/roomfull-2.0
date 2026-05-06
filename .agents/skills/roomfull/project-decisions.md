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
  - `/admin/units`

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

## Hot-Desk-Entscheidung

- `Hot Desk` ist ein `UnitType` für einzelne buchbare Plätze
- `Open World` ist eine `Area`, keine buchbare Einheit
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
