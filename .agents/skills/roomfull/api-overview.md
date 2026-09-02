# API Overview

## Ziel

Kompakter Überblick über die Endpoints von RoomFull 2.0.

## Auth

Der aktuell implementierte Web-Transport nutzt das vom Backend gesetzte `HttpOnly`-Cookie `roomfull_access_token`. Browser-Requests senden Cookies mit `credentials: "include"`; JavaScript liest oder verteilt den Token nicht.

Die fuer RoomFull Mobile beschlossenen `/auth/mobile/*`-Endpunkte und Bearer-Unterstuetzung sind am Sync-Stand 2026-09-01 noch nicht implementiert. Vor Mobile-Anbindung immer Routes, Middleware und `backend/openapi.json` pruefen.

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

### `POST /auth/demo-login`

Erzeugt einen zeitlich begrenzten Demo Customer mit vorbereiteten Bookings, Contact Request und Teams und startet dieselbe Cookie-Session wie der regulaere Web-Login.

### `POST /auth/logout`

Beendet die Web-Session durch Loeschen des Auth-Cookies.

### `GET /auth/me`

Liefert den aktuell ueber das Auth-Cookie eingeloggten User.

## Customer Contact

### `POST /contact-requests`

Speichert eine Customer Contact Request ohne E-Mail-Versand.

Session:

```txt
roomfull_access_token (HttpOnly-Cookie)
```

Body:

```json
{
  "type": "QUESTION",
  "message": "Ich habe eine Frage zu meiner Buchung."
}
```

Erlaubte Typen:

- `QUESTION`
- `FEEDBACK`
- `CRITICISM`

Response:

```ts
type ContactRequest = {
  id: string;
  userId: string;
  type: "QUESTION" | "FEEDBACK" | "CRITICISM";
  message: string;
  isRead: boolean;
  createdAt: string;
};
```

Regeln:

- nur eingeloggte Customers duerfen Contact Requests absenden
- Visitors erhalten `401`
- Admins erhalten `403`
- `message` darf nicht leer sein
- neue Contact Requests starten mit `isRead: false`

## Admin Contact

### `GET /admin/contact-requests`

Liefert Customer Contact Requests für die Admin Contact Inbox.

Session:

```txt
roomfull_access_token (HttpOnly-Cookie)
```

Query:

- `type=QUESTION|FEEDBACK|CRITICISM`
- `readState=all|read|unread`
- `sort=received_desc|received_asc`

Response:

```ts
type AdminContactRequest = ContactRequest & {
  user: { id: string; name: string; email: string };
};
```

### `PATCH /admin/contact-requests/:contactRequestId/read`

Markiert eine Customer Contact Request global als gelesen.

### `GET /admin/contact-requests/unread-count`

Liefert die globale Anzahl ungelesener Customer Contact Requests fuer dezente Admin-Hinweise.

Response:

```ts
type AdminContactRequestUnreadCountResponse = {
  unreadCount: number;
};
```

Regeln:

- nur Admins duerfen die Inbox nutzen
- es gibt keine Antwortfunktion
- es wird keine E-Mail versendet
- Lesestatus ist global pro Contact Request, nicht pro Admin

## Units

### `GET /public/booking-options`

Liefert die Customer-facing BookingOptions für die Booking Options Page.

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
  units: Array<{ id: string; name: string }>;
};
```

Regeln:

- Public BookingOptions kommen aus einer expliziten Backend-Allowlist
- `HOT_DESK` nutzt `AUTO_ASSIGN` und `areaSelection: REQUIRED`
- `HOT_DESK.areas[]` enthält Areas mit aktiver Hot-Desk-Anzahl
- `HOT_DESK` liefert `units: []`, damit keine konkreten Hot-Desk-IDs veröffentlicht werden
- `BOOTH`, `TEAM_ROOM` und `MEETING_ROOM` nutzen `CHOOSE_UNIT` und `areaSelection: NOT_APPLICABLE`
- `BOOTH`, `TEAM_ROOM` und `MEETING_ROOM` liefern `areas: []`
- `BOOTH`, `TEAM_ROOM` und `MEETING_ROOM` liefern aktive Units als `units[]`, sortiert nach `displayOrder`, dann `id`
- `status` ist `AVAILABLE`, wenn `totalActiveUnits > 0`, sonst `UNAVAILABLE`
- fehlende Allowlist-UnitTypes sind System-/Seed-Fehler

### `GET /public/units`

Liefert alle aktiven Units.
`unitType` enthält `id`, `name`, `minDurationMinutes` und `maxDurationMinutes`.

Optional filterbar nach `unitType`:

```txt
GET /public/units?unitType=BOOTH
```

Optional lokalisierbar nach `locale`:

```txt
GET /public/units?unitType=BOOTH&locale=en
GET /public/units/:unitId?locale=de
```

`locale` darf `de` oder `en` sein. Unbekannte Locale-Werte fallen auf `de` zurück.
Lokalisierte DB-Content-Felder wie Unit- und Area-Beschreibungen werden weiterhin als einfaches `description` zurückgegeben.

Erlaubte Werte:

- `HOT_DESK`
- `BOOTH`
- `TEAM_ROOM`
- `MEETING_ROOM`

Ungueltige Werte liefern `400 Bad Request`.

### `GET /public/units/:unitId`

Liefert Details zu einer Unit.

## Bookings

### `GET /bookings/context`

Liefert auth-required den Backend-validierten Booking Context fuer `/bookings/new`.

Direkter Modus:

```txt
GET /bookings/context?unitId=cmxxxxx&locale=en
```

Auto-Assign-Modus:

```txt
GET /bookings/context?unitType=HOT_DESK&areaId=cmyyyyy&locale=de
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
- `locale=de|en` lokalisiert Unit-/Area-Beschreibungen im `description`-Feld
- gemischte oder unvollständige Query-Kontexte liefern `400`
- unbekannte oder nicht buchbare Unit/Area liefert `404`
- liefert keine zeitbezogene Verfügbarkeit und keinen `409`

### `GET /bookings/availability?date=YYYY-MM-DD&unitId=...`

Liefert auth-required die Booking Availability fuer Direct Booking.

### `GET /bookings/availability?date=YYYY-MM-DD&areaId=...&unitType=HOT_DESK`

Liefert auth-required die Booking Availability fuer Hot-Desk-Auto-Assign.

Response:

```ts
type BookingAvailability = {
  date: string;
  timeGridMinutes: 15;
  openingHours: { start: "08:00"; end: "22:00" };
  slots: Array<{
    start: string; // HH:mm
    end: string; // HH:mm
    availableUnitCount: number;
  }>;
  blockedIntervals: Array<{ start: string; end: string }>; // HH:mm
};
```

Regeln:

- akzeptiert entweder `unitId` oder `areaId + unitType=HOT_DESK`
- `slots` sind berechnete Availability Slots, keine gespeicherten TimeSlot-Objekte
- `availableUnitCount` wird ohne konkrete Unit-IDs geliefert
- `date` muss ein buchbarer Berliner Werktag sein
- Slots folgen dem globalen 15-Minuten-Booking-Time-Grid
- Submit bleibt die finale race-sichere Buchungsprüfung

### `POST /bookings`

Legt eine neue Buchung an.

Direkter Modus:

```json
{
  "unitId": "cmxxxxx",
  "date": "2026-04-15",
  "startTime": "09:00",
  "endTime": "12:00"
}
```

`date`, `startTime` und `endTime` beschreiben lokale Coworking-Zeit in `Europe/Berlin`. Das Backend wandelt sie erst nach der Fachvalidierung in UTC-Zeitpunkte um.

### `GET /units/:unitId/calendar-state?month=YYYY-MM`

Liefert auth-required den Direct Booking Calendar State einer Unit fuer einen Berliner Kalendermonat.

Response:

```ts
type DirectBookingCalendarState = {
  unitId: string;
  month: string;
  days: Array<{
    date: string;
    state: "available" | "partially-booked" | "fully-booked";
  }>;
};
```

Regeln:

- Customer und Admin duerfen den Endpoint nutzen
- nur aktive Bookings werden beruecksichtigt
- `fully-booked` bedeutet, dass keine freie Zeitspanne die Duration Policy der Unit mehr erfüllt
- keine rohen Booking-, Owner- oder User-Daten werden ausgeliefert
- die Response enthaelt nur aktuelle/zukuenftige Werktage des Monats
- `month` muss `YYYY-MM`, aktuell oder zukuenftig sein
- unbekannte oder inaktive Unit liefert `404`

Auto-Assign (nur `HOT_DESK`):

```json
{
  "areaId": "cmyyyyy",
  "unitType": "HOT_DESK",
  "date": "2026-04-15",
  "startTime": "09:00",
  "endTime": "12:00"
}
```

### `GET /me/bookings`

Liefert die eigenen Buchungen des eingeloggten Users.

### `GET /me/bookings/:bookingId/share-context`

Liefert Customer-only den minimalen Share Context einer eigenen eligible Booking:

```ts
type BookingShareContext = {
  booking: {
    id: string;
    startTime: string;
    endTime: string;
  };
  unit: {
    id: string;
    name: string;
    capacity: number;
    unitType: { name: "HOT_DESK" | "BOOTH" | "TEAM_ROOM" | "MEETING_ROOM" };
  };
};
```

Eligible bedeutet `status=ACTIVE` und `endTime >= now`. Fehlende oder fremde Bookings liefern `404`; stornierte oder vergangene eigene Bookings liefern `409`.

### `DELETE /bookings/:bookingId`

Storniert eine eigene zukünftige Buchung.

## Customer Teams

Alle Team-Endpunkte sind Customer-only und session-scoped. Requests enthalten keine `userId`.

### `GET /me/teams`

Liefert eigene Team Summaries mit `id`, `name` und `memberCount`.

### `POST /me/teams`

Legt ein leeres privates Team an. Teamnamen haben 1 bis 80 Zeichen und sind pro Customer normalisiert eindeutig. Ein Customer darf hoechstens 20 Teams besitzen.

### `GET /me/teams/:teamId`

Liefert ein eigenes Team mit Members. Fehlende und fremde Teams liefern identisch `404`.

### `PUT /me/teams/:teamId`

Benennt ein eigenes Team unter denselben Normalisierungs- und Eindeutigkeitsregeln um.

### `DELETE /me/teams/:teamId`

Loescht ein eigenes Team und seine Members endgueltig.

### `POST /me/teams/:teamId/members`

Fuegt einen Kontakt aus Name und E-Mail hinzu. Member-Namen haben 1 bis 100 Zeichen; normalisierte E-Mails hoechstens 254 Zeichen und sind pro Team eindeutig. Ein Team darf hoechstens 50 Members besitzen.

### `PUT /me/teams/:teamId/members/:memberId`

Aktualisiert einen eigenen Team Member unter denselben Regeln.

### `DELETE /me/teams/:teamId/members/:memberId`

Entfernt einen eigenen Team Member endgueltig.

Ungueltige Eingaben liefern `400`, Visitors `401`, Admins `403`, fehlende oder fremde Ressourcen `404` und Duplikate beziehungsweise Limits `409`.

## Admin

### `GET /admin/units`

Liefert BookableUnits für die Admin-Inventaransicht inklusive Aktivierungsstatus.

Query:

```txt
GET /admin/units?status=active&unitType=HOT_DESK&search=Desk
```

Filter:

- `status=active|deactivated|all` (Default: `active`)
- `unitType=HOT_DESK|BOOTH|TEAM_ROOM|MEETING_ROOM`
- `search` sucht einfach nach Unit-Name

Response:

```ts
type AdminUnitListResponse = {
  units: AdminUnit[];
};

type AdminUnit = Unit & {
  descriptionDe: string | null;
  descriptionEn: string | null;
};
```

### `GET /admin/units/context`

Liefert Auswahlwerte für Admin-Unit-Formulare.

Response:

```ts
type AdminUnitContextResponse = {
  unitTypes: Array<{ id: string; name: UnitTypeName }>;
  areas: Array<{
    id: string;
    name: string;
    description: string | null;
    isActive: boolean;
  }>;
};
```

### `POST /admin/units`

Legt eine neue Unit an. `descriptionDe` und `descriptionEn` sind Pflichtfelder.
Das Legacy-Feld `description` wird serverseitig mit `descriptionDe` synchronisiert.

### `PUT /admin/units/:unitId`

Bearbeitet eine Unit. Die lokalisierten Beschreibungen werden über
`descriptionDe` und `descriptionEn` unabhängig gepflegt.

### `PATCH /admin/units/:unitId/deactivate`

Deaktiviert eine Unit.

### `GET /admin/bookings`

Liefert den gemeinsamen Datensatz der Admin Booking Operations View: gefilterte Bookings, den effektiv verwendeten Zeitraum und die operative Summary.

Query:

```txt
GET /admin/bookings?status=upcoming&range=month&limit=100&search=max@example.com
```

`status` ist ein View-Status: `upcoming`, `today`, `completed`, `cancelled` oder `all`.
`range` ist `week`, `month`, `quarter` oder `year` und wird im Backend als rollierender Berliner Kalenderzeitraum passend zum View-Status aufgelöst.
`all` umfasst alle Booking-Status symmetrisch um heute.
`from` und `to` sind inklusive Kalendertage im Format `YYYY-MM-DD`.
`range` darf nicht mit `from/to` kombiniert werden.
`limit` muss zwischen `1` und `500` liegen.
`search` durchsucht ausschließlich Customer-Name und Customer-E-Mail.
`limit` begrenzt nur `bookings`, nicht die Summary. Die Summary folgt Zeitraum und Suche, aber nicht dem View-Status.

Response:

```ts
type AdminBooking = Booking & {
  user: { id: string; name: string; email: string; role: "CUSTOMER" | "ADMIN" };
  unit: { id: string; name: string; unitType: { name: UnitTypeName } };
};

type AdminBookingOperations = {
  bookings: AdminBooking[];
  dateRange: { from: string; to: string };
  summary: {
    todayBookings: number;
    upcomingInRange: number;
    cancelledInRange: number;
    topBookedUnit?: {
      id: string;
      name: string;
      unitType: UnitTypeName;
      bookingCount: number;
    };
  };
};
```

### `GET /admin/analytics/booking-demand`

Liefert den Nachfrageverlauf für das Admin Analytics Dashboard.

Query:

```txt
GET /admin/analytics/booking-demand?from=2027-01-01&to=2027-01-31
```

Ohne explizite `from/to`-Werte nutzt der Endpoint 30 Tage zurück und 30 Tage voraus.
Die Metrik zählt aktive Bookings gruppiert nach Booking-Startdatum.
Zusätzlich liefert der Endpoint aktive Bookings im gewählten Zeitraum gruppiert nach `UnitType`.
Die Stornoquote vergleicht aktive und stornierte Bookings im selben Zeitraum.
Stornierte Bookings zählen nicht als Nachfrage.

Response:

```ts
type BookingDemandAnalytics = {
  cancellationStats: {
    activeBookings: number;
    cancelledBookings: number;
    totalBookings: number;
    cancellationRate: number;
  };
  dateRange: { from: string; to: string };
  granularity: "day";
  metric: "activeBookingsByStartDate";
  trend: { date: string; bookingCount: number }[];
  demandByUnitType: { unitType: UnitTypeName; bookingCount: number }[];
};
```

## Rollenlogik

- `customer` nutzt Auth, Units und eigene Bookings
- `customer` verwaltet eigene Teams, nutzt Team Booking Share und erstellt Contact Requests
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
- `409 Conflict` -> Buchung kollidiert, kein freier Hot Desk, ineligible Share oder Team-Limit/Duplikat
