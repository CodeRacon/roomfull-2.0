# API Summary

## Ziel

Die API bildet den Kern von RoomFull 2.0 ab: Auth, Units, Verfügbarkeit, Bookings und Admin-Verwaltung.

Sie bleibt bewusst klein, aber bildet die zentrale Business-Logik sauber im Backend ab.

## Kernmodule

- `auth`
- `public units`
- `bookings`
- `admin units`

## Endpunkte

### Auth

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`

### Public Units

- `GET /public/units`
- `GET /public/units/:unitId`
- `GET /public/units/:unitId/availability?start=...&end=...`

### Bookings

- `POST /bookings`
- `GET /me/bookings`
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

## Validierung

### Booking

- `start < end`
- nur zukünftige Zeiträume
- nur Mo-Fr und innerhalb 08:00-22:00
- Dauer nach UnitType-Policy
- keine Überschneidung aktiver Bookings auf derselben Unit
- Auto-Assign ist race-sicher (Transaktion/Konflikt-Retry)

### Unit Management

- Name nicht leer
- Kapazität > 0
- `unitTypeId` muss existieren
- `areaId` optional, muss bei Angabe existieren

## Fehlerbilder

- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `404 Not Found`
- `409 Conflict`

## Leitregel

Controller bleiben dünn, Services bündeln Fachlogik, DB-Layer kapselt Queries.
