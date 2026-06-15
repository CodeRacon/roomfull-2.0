# API Summary

## Ziel

Die API bildet den Kern von RoomFull 2.0 ab: Auth, Units, Verfügbarkeit, Bookings und Admin-Verwaltung.

Sie bleibt bewusst klein, aber bildet die zentrale Business-Logik sauber im Backend ab.

## Kernmodule

- `auth`
- `public booking options`
- `public units`
- `bookings`
- `admin units`

## Endpunkte

### Auth

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`

### Public Units

- `GET /public/booking-options`
- `GET /public/units`
- `GET /public/units/:unitId`
- `GET /public/units/:unitId/availability?start=...&end=...`

`GET /public/booking-options` speist die Booking Options Page als fokussierten Buchungseinstieg.

Der Endpoint liefert grundsätzliche Customer-Angebote ohne Zeitraum:

- `HOT_DESK`
- `BOOTH`
- `TEAM_ROOM`
- `MEETING_ROOM`

Der Contract enthält:

- `key`
- `unitType` mit `id`, `name`, `minDurationMinutes`, `maxDurationMinutes`
- `bookingMode`
- `areaSelection`
- `status`
- `totalActiveUnits`
- `maxCapacity`
- `areas`

`HOT_DESK` liefert Areas mit aktiver Unit-Anzahl. `BOOTH`, `TEAM_ROOM` und `MEETING_ROOM` liefern `areas: []`.

`GET /public/units` bleibt für konkrete Unit-Auswahl und Unit-Details bestehen.
`Unit.unitType` enthält ebenfalls `minDurationMinutes` und `maxDurationMinutes`.
Der Endpoint ist optional nach `unitType` filterbar, z. B. `GET /public/units?unitType=BOOTH`.
Ungültige `unitType`-Werte liefern `400 Bad Request`.

### Bookings

- `GET /bookings/context`
- `GET /bookings/availability?date=YYYY-MM-DD&unitId=...`
- `GET /bookings/availability?date=YYYY-MM-DD&areaId=...&unitType=HOT_DESK`
- `POST /bookings`
- `GET /me/bookings`
- `GET /units/:unitId/day-bookings?date=YYYY-MM-DD`
- `DELETE /bookings/:bookingId`

`GET /me/bookings` liefert eigene Bookings inklusive minimaler Unit-Anzeigedaten (`unit.id`, `unit.name`, `unit.unitType.name`), damit die UI Buchungen typgerecht darstellen kann.

### Admin

- `GET /admin/units`
- `GET /admin/units/context`
- `POST /admin/units`
- `PUT /admin/units/:unitId`
- `PATCH /admin/units/:unitId/deactivate`
- `GET /admin/bookings`

`GET /admin/units` liefert BookableUnits für die Admin-Inventaransicht und darf aktive, deaktivierte oder alle Units enthalten.

Unterstützte Query-Parameter:

- `status=active|deactivated|all` (Default: `active`)
- `unitType=HOT_DESK|BOOTH|TEAM_ROOM|MEETING_ROOM`
- `search=<name>`

`GET /admin/units/context` liefert Auswahlwerte für Admin-Unit-Formulare:

- `unitTypes`
- `areas`

`GET /admin/bookings` liefert gefilterte Bookings inklusive minimaler Customer- und Unit-Anzeigedaten (`user.name`, `user.email`, `unit.name`, `unit.unitType.name`) für die Admin-Übersicht.

Unterstützte Query-Parameter:

- `status=upcoming|today|completed|cancelled|all`
- `from=YYYY-MM-DD`
- `to=YYYY-MM-DD`
- `limit=1..500`

`status=all` umfasst Vergangenheit und Zukunft im gewählten Zeitraum, damit anstehende Bookings nicht aus der Gesamtsicht fallen.

## Rollenbezug

- `customer` nutzt Auth, Units und eigene Bookings
- `admin` nutzt zusätzlich Admin-Endpunkte und darf ebenfalls Bookings anlegen

## Booking-Modi

`POST /bookings` unterstützt zwei Modi:

- direkt: `unitId + start + end`
- auto-assign: `areaId + unitType + start + end` (in V1 nur `HOT_DESK`)

`GET /bookings/context` ist auth-required und validiert den Einstiegskontext fuer `/bookings/new`:

- direkt: `unitId`
- auto-assign: `unitType=HOT_DESK + areaId`

Der Endpoint liefert Anzeige- und Dauerregel-Kontext, aber keine zeitbezogene Verfügbarkeit.

`GET /bookings/availability` liefert nach Datumsauswahl die gemeinsame Availability-Basis fuer Direct Booking und Hot-Desk-Auto-Assign:

- globales 15-Minuten-Grid
- Öffnungszeiten als lokale `HH:mm`
- `slots` als berechnete Availability Slots mit `availableUnitCount`
- `blockedIntervals` als lokale `HH:mm`
- keine konkreten Hot-Desk-Unit-IDs
- Submit bleibt finale Verfügbarkeitsprüfung

BookingOptions nutzen dieselbe fachliche Unterscheidung:

- `AUTO_ASSIGN` für Hot Desk
- `CHOOSE_UNIT` für Booth, Team Room und Meeting Room

## Validierung

### Booking

- `start < end`
- Start und Ende am selben Kalendertag
- nur zukünftige Zeiträume
- nur Mo-Fr und innerhalb 08:00-22:00
- Start und Ende auf globalem 15-Minuten-Grid
- Dauer nach UnitType-Policy
- keine Überschneidung aktiver Bookings auf derselben Unit
- Auto-Assign ist race-sicher (Transaktion/Konflikt-Retry)

### Unit Day Bookings

- auth-required
- Customer und Admin erlaubt
- liefert nur aktive blockierende Intervalle
- keine User-/Owner-Daten
- `date` muss `YYYY-MM-DD`, heute oder zukünftig und ein Werktag sein
- unbekannte/inaktive Unit liefert `404`

### Unit Management

- Name nicht leer
- Kapazität > 0
- `unitTypeId` muss existieren
- `areaId` optional, muss bei Angabe existieren
- `HOT_DESK` braucht immer eine `areaId`

## Fehlerbilder

- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `404 Not Found`
- `409 Conflict`

## Leitregel

Controller bleiben dünn, Services bündeln Fachlogik, DB-Layer kapselt Queries.
