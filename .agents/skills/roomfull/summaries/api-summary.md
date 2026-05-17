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

`GET /public/booking-options` ist perspektivisch der Homepage-Einstieg.

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
- `areas`

`HOT_DESK` liefert Areas mit aktiver Unit-Anzahl. `BOOTH`, `TEAM_ROOM` und `MEETING_ROOM` liefern `areas: []`.

`GET /public/units` bleibt für konkrete Unit-Auswahl und Unit-Details bestehen.
`Unit.unitType` enthält ebenfalls `minDurationMinutes` und `maxDurationMinutes`.
Der Endpoint ist optional nach `unitType` filterbar, z. B. `GET /public/units?unitType=BOOTH`.
Ungültige `unitType`-Werte liefern `400 Bad Request`.

### Bookings

- `POST /bookings`
- `GET /me/bookings`
- `GET /units/:unitId/day-bookings?date=YYYY-MM-DD`
- `DELETE /bookings/:bookingId`

### Admin

- `POST /admin/units`
- `PUT /admin/units/:unitId`
- `PATCH /admin/units/:unitId/deactivate`
- `GET /admin/bookings`

## Rollenbezug

- `customer` nutzt Auth, Units und eigene Bookings
- `admin` nutzt zusätzlich Admin-Endpunkte und darf ebenfalls Bookings anlegen

## Booking-Modi

`POST /bookings` unterstützt zwei Modi:

- direkt: `unitId + start + end`
- auto-assign: `areaId + unitType + start + end` (in V1 nur `HOT_DESK`)

BookingOptions nutzen dieselbe fachliche Unterscheidung:

- `AUTO_ASSIGN` für Hot Desk
- `CHOOSE_UNIT` für Booth, Team Room und Meeting Room

## Validierung

### Booking

- `start < end`
- Start und Ende am selben Kalendertag
- nur zukünftige Zeiträume
- nur Mo-Fr und innerhalb 08:00-22:00
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
