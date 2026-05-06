# API Overview

## Ziel

Kompakter Überblick über die Endpoints von RoomFull 2.0.

## Auth

### `POST /auth/register`

Erstellt einen neuen User.

Body:

```json
{
  "name": "Max Mustermann",
  "email": "max@example.com",
  "password": "secret123"
}
```

### `POST /auth/login`

Loggt einen User ein.

Body:

```json
{
  "email": "max@example.com",
  "password": "secret123"
}
```

### `GET /auth/me`

Liefert den aktuell eingeloggten User.

Header:

```txt
Authorization: Bearer <token>
```

## Units

### `GET /public/units`

Liefert alle aktiven Units.

### `GET /public/units/:unitId`

Liefert Details zu einer Unit.

### `GET /public/units/:unitId/availability?start=...&end=...`

Prüft, ob eine Unit im Zeitraum verfügbar ist.

## Bookings

### `POST /bookings`

Legt eine neue Buchung an.

Direkter Modus:

```json
{
  "unitId": "cmxxxxx",
  "start": "2026-04-15T09:00:00.000Z",
  "end": "2026-04-15T12:00:00.000Z"
}
```

Auto-Assign (nur `HOT_DESK`):

```json
{
  "areaId": "cmyyyyy",
  "unitType": "HOT_DESK",
  "start": "2026-04-15T09:00:00.000Z",
  "end": "2026-04-15T12:00:00.000Z"
}
```

### `GET /me/bookings`

Liefert die eigenen Buchungen des eingeloggten Users.

### `DELETE /bookings/:bookingId`

Storniert eine eigene zukünftige Buchung.

## Admin

### `POST /admin/units`

Legt eine neue Unit an.

### `PUT /admin/units/:unitId`

Bearbeitet eine Unit.

### `PATCH /admin/units/:unitId/deactivate`

Deaktiviert eine Unit.

### `GET /admin/bookings`

Liefert alle Buchungen.

## Rollenlogik

- `customer` nutzt Auth, Units und eigene Bookings
- `admin` darf zusätzlich Admin-Endpunkte nutzen und ebenfalls Bookings anlegen

## Wichtige Validierung

### Register

- Name darf nicht leer sein
- E-Mail muss gültig und eindeutig sein
- Passwort braucht Mindestlänge

### Booking

- `start < end`
- nur zukünftige Zeiträume
- nur Montag bis Freitag
- nur innerhalb globaler Öffnungszeiten (08:00-22:00)
- Dauerregel pro UnitType (`HOT_DESK` 30-240, `BOOTH` 60-480, `TEAM_ROOM` 60-480)
- direkte Buchung: `unitId` muss aktiv existieren
- auto-assign: `areaId + unitType` erforderlich, in V1 nur `HOT_DESK`
- keine Überschneidung mit aktiver Buchung
- Customers dürfen nur eigene zukünftige Bookings stornieren

### Admin Unit Management

- Name darf nicht leer sein
- Kapazität muss positiv sein
- `unitTypeId` muss existieren
- `areaId` ist optional, muss bei Angabe existieren

## Wichtige Fehlerfälle

- `400 Bad Request` -> ungültige Eingaben
- `401 Unauthorized` -> nicht eingeloggt
- `403 Forbidden` -> Rolle nicht erlaubt
- `404 Not Found` -> Ressource existiert nicht
- `409 Conflict` -> Buchung kollidiert / kein freier Hot Desk verfügbar
