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

### `GET /public/booking-options`

Liefert die Customer-facing BookingOptions für den Homepage-Einstieg.

Der Endpoint arbeitet ohne Zeitraum und beschreibt nur grundsätzliche Buchbarkeit.

Response-Shape:

```ts
type BookingMode = "AUTO_ASSIGN" | "CHOOSE_UNIT";
type AreaSelectionMode = "REQUIRED" | "NOT_APPLICABLE";
type BookingOptionStatus = "AVAILABLE" | "UNAVAILABLE";

type BookingOption = {
  key: "HOT_DESK" | "BOOTH" | "TEAM_ROOM" | "MEETING_ROOM";
  unitType: {
    id: string;
    name: "HOT_DESK" | "BOOTH" | "TEAM_ROOM" | "MEETING_ROOM";
    minDurationMinutes: number;
    maxDurationMinutes: number;
  };
  bookingMode: BookingMode;
  areaSelection: AreaSelectionMode;
  status: BookingOptionStatus;
  totalActiveUnits: number;
  maxCapacity: number;
  areas: Array<{ id: string; name: string; activeUnitCount: number }>;
};
```

Regeln:

- Public BookingOptions kommen aus einer expliziten Backend-Allowlist
- `HOT_DESK` nutzt `AUTO_ASSIGN` und `areaSelection: REQUIRED`
- `HOT_DESK.areas[]` enthält Areas mit aktiver Hot-Desk-Anzahl
- `BOOTH`, `TEAM_ROOM` und `MEETING_ROOM` nutzen `CHOOSE_UNIT` und `areaSelection: NOT_APPLICABLE`
- `BOOTH`, `TEAM_ROOM` und `MEETING_ROOM` liefern `areas: []`
- `status` ist `AVAILABLE`, wenn `totalActiveUnits > 0`, sonst `UNAVAILABLE`
- fehlende Allowlist-UnitTypes sind System-/Seed-Fehler

### `GET /public/units`

Liefert alle aktiven Units.
`unitType` enthält `id`, `name`, `minDurationMinutes` und `maxDurationMinutes`.

Optional filterbar nach `unitType`:

```txt
GET /public/units?unitType=BOOTH
```

Erlaubte Werte:

- `HOT_DESK`
- `BOOTH`
- `TEAM_ROOM`
- `MEETING_ROOM`

Ungueltige Werte liefern `400 Bad Request`.

### `GET /public/units/:unitId`

Liefert Details zu einer Unit.

### `GET /public/units/:unitId/availability?start=...&end=...`

Prüft, ob eine Unit im Zeitraum verfügbar ist.

## Bookings

### `GET /bookings/context`

Liefert auth-required den Backend-validierten Booking Context fuer `/bookings/new`.

Direkter Modus:

```txt
GET /bookings/context?unitId=cmxxxxx
```

Auto-Assign-Modus:

```txt
GET /bookings/context?unitType=HOT_DESK&areaId=cmyyyyy
```

Response:

```ts
type BookingContext =
  | {
      mode: "DIRECT";
      unit: {
        id: string;
        name: string;
        description: string;
        capacity: number;
        unitType: BookingContextUnitType;
      };
    }
  | {
      mode: "AUTO_ASSIGN";
      unitType: BookingContextUnitType;
      area: {
        id: string;
        name: string;
        description: string | null;
        seatCount: number;
      };
    };
```

Regeln:

- akzeptiert entweder `unitId` oder `unitType=HOT_DESK&areaId=...`
- gemischte oder unvollständige Query-Kontexte liefern `400`
- unbekannte oder nicht buchbare Unit/Area liefert `404`
- liefert keine zeitbezogene Verfügbarkeit und keinen `409`

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

### `GET /units/:unitId/day-bookings?date=YYYY-MM-DD`

Liefert auth-required die aktiven blockierenden Intervalle einer Unit fuer einen Berliner Kalendertag.

Response:

```ts
type UnitDayBookings = {
  date: string;
  unitId: string;
  bookedIntervals: Array<{ start: string; end: string }>;
};
```

Regeln:

- Customer und Admin duerfen den Endpoint nutzen
- nur aktive Bookings werden beruecksichtigt
- keine Owner-/User-Daten werden ausgeliefert
- vergangene Tage und Wochenenden liefern `400`
- unbekannte oder inaktive Unit liefert `404`

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
- Start und Ende am selben Kalendertag
- nur zukünftige Zeiträume
- nur Montag bis Freitag
- nur innerhalb globaler Öffnungszeiten (08:00-22:00)
- Dauerregel pro UnitType (`HOT_DESK` 30-240, `BOOTH` 60-240, `TEAM_ROOM` 60-480, `MEETING_ROOM` 60-480)
- direkte Buchung: `unitId` muss aktiv existieren
- auto-assign: `areaId + unitType` erforderlich, in V1 nur `HOT_DESK`
- keine Überschneidung mit aktiver Buchung
- Customers dürfen nur eigene zukünftige Bookings stornieren

### Admin Unit Management

- Name darf nicht leer sein
- Kapazität muss positiv sein
- `unitTypeId` muss existieren
- `areaId` ist optional, muss bei Angabe existieren
- bei `HOT_DESK` ist `areaId` verpflichtend

## Wichtige Fehlerfälle

- `400 Bad Request` -> ungültige Eingaben
- `401 Unauthorized` -> nicht eingeloggt
- `403 Forbidden` -> Rolle nicht erlaubt
- `404 Not Found` -> Ressource existiert nicht
- `409 Conflict` -> Buchung kollidiert / kein freier Hot Desk verfügbar
