## Customer BookingFlow Entscheidungen

Diese Entscheidungen beschreiben das Zielbild fuer den Customer-BookingFlow. Einzelne technische Slices werden danach separat umgesetzt.

### Einstieg und Angebotsauswahl

- Homepage zeigt `BookingOption`s, nicht einzelne Units.
- BookingOptions verlinken auf oeffentliche Angebotsuebersichten:
  - `/booking-options/hot-desk`
  - `/booking-options/booth`
  - `/booking-options/team-room`
  - `/booking-options/meeting-room`
- Angebotsuebersichten sind public und enthalten noch keine zeitbezogene Verfuegbarkeit.
- Gueltiger UnitType ohne aktive Angebote zeigt einen Empty State.
- Ungueltiger Slug/UnitType fuehrt zu `404`.

### Auswahlmodell je UnitType

- `HOT_DESK`: User waehlt eine Area, z. B. `Open World` oder `Quiet Place`.
- `HOT_DESK`: User sieht und waehlt keinen konkreten Einzelplatz.
- `HOT_DESK`: Backend weist per Auto-Assign eine freie konkrete Unit zu.
- `BOOTH`, `TEAM_ROOM`, `MEETING_ROOM`: User waehlt eine konkrete Unit.
- Areas sind im Customer-Flow ausschliesslich fuer `HOT_DESK` relevant.

### Auth-Gate und Routen

- Angebotsuebersicht bleibt public.
- Eigentliche Buchung ist auth-required.
- Auth-Gate kommt bei "Angebot buchen", nicht schon beim Homepage-Klick.
- Login und Register sollen einen sicheren internen `next`-Parameter nutzen.
- Frontend-Routen `/login` und `/register` bereinigen `next` vor dem Redirect.
- Gemeinsamer BookingFlow:
  - `/bookings/new?unitId=...`
  - `/bookings/new?unitType=HOT_DESK&areaId=...`
- `/bookings/new` ohne gueltigen Kontext wird nicht als sinnvoller Einstieg behandelt.

### Zeit- und Verfuegbarkeitsmodell

- User waehlt konkrete Von-bis-Zeitraeume.
- UI und Backend nutzen das globale 15-Minuten-Raster; es gibt kein fachlich gespeichertes Slot-Modell.
- User waehlt Datum, dann Startzeit, dann eine erlaubte Endzeit.
- Startzeiten orientieren sich an den globalen Oeffnungszeiten `08:00-22:00`.
- Endzeiten werden aus Startzeit, UnitType-Dauerregel, Oeffnungsende und bei Direct Mode aus blockierenden Intervallen gefiltert.
- Fachliche Coworking-Zeit ist `Europe/Berlin`.
- Technische Zeitzonen-, Kalender- und Clock-Logik liegt in `coworking-calendar.ts`.
- Fachliche Zeitvalidierung und Slot-Berechnung laufen zentral ueber `booking-time-policy.ts`.
- Backend bleibt Source of Truth fuer Zeitregeln und Konflikte.
- Bookings starten und enden am selben Kalendertag.
- Kein Hold/5-Minuten-Timer im MVP.
- Race-Conflicts werden ueber `409 Conflict` behandelt.

### Kalender- und Tagesbelegung fuer konkrete Units

- Der Direct Booking Calendar State wird pro sichtbarem Monat mit einem Request geladen.
- Endpoint: `GET /units/:unitId/calendar-state?month=YYYY-MM`
- Response enthaelt `available`, `partially-booked` oder `fully-booked` pro aktuellem/zukuenftigem Werktag, aber keine rohen Booking- oder Owner-Daten.
- `fully-booked` bedeutet, dass keine freie Zeitspanne die Duration Policy der Unit mehr erfüllt; die Today Booking Start Rule beeinflusst nur den gewählten Tag, nicht den Monatszustand.
- Fuer die ausgewaehlte Tagesansicht nutzt der BookingFlow `GET /bookings/availability?date=...&unitId=...`.
- Die UI zeigt bei Direct Mode alle Rasterpunkte und markiert belegte Zeiten sichtbar als blockiert.
- Kalender- und Tagesbelegung sind auth-required.
- Hot Desk nutzt nach Datumsauswahl die Area-Availability-Preview; der Submit bleibt die finale race-sichere Auto-Assign-Pruefung.

### Abschluss und Fehlerverhalten

- Erfolgreiche Buchung fuehrt zu `Meine Buchungen` mit Success-Hinweis.
- Bestehende Buchungen koennen im MVP nicht geaendert werden.
- Aenderung bedeutet: stornieren und neu buchen.
- Storno ist nur fuer eigene zukuenftige Buchungen erlaubt.
- `400`: Eingaben korrigieren.
- `401`: Login mit `next`.
- `404`: Unit/Area nicht mehr verfuegbar, zur Angebotsuebersicht zurueck.
- `409`: Zeitraum inzwischen belegt, im Flow bleiben und neu waehlen.
- Netzwerkfehler: Retry anbieten.

### Dauerregeln Zielbild

- `HOT_DESK`: min 30, max 240 Minuten
- `BOOTH`: min 60, max 240 Minuten
- `TEAM_ROOM`: min 60, max 480 Minuten
- `MEETING_ROOM`: min 60, max 480 Minuten
- Public Contracts liefern diese Werte ueber `unitType.minDurationMinutes` und `unitType.maxDurationMinutes`.

### Booking Request Modes

- Datei: [booking-request-mode.ts](../src/services/booking-request-mode.ts)
- Funktion: `resolveBookingRequestMode`
- Gemeinsame Modus-Seam fuer Booking Context, Availability und Booking-Erstellung.
- Kanonische Modi: `DIRECT` und `AUTO_ASSIGN`.
- `AUTO_ASSIGN` ist dauerhaft ausschliesslich fuer `HOT_DESK` erlaubt.
- Fehlende, gemischte, unvollstaendige oder unzulaessige Auswahlen liefern `400`.

---

## Customer Booking Context Flow `GET /api/bookings/context`

### Request

- Client sendet `GET /api/bookings/context`
- Header enthält `Authorization: Bearer <token>`
- Query nutzt genau einen von zwei Einstiegskontexten:
  - direkt: `unitId=...`
  - auto-assign: `unitType=HOT_DESK&areaId=...`

### Ziel

- Backend validiert den Entry Context fuer `/bookings/new`.
- Response liefert Anzeige- und Dauerregel-Kontext.
- Response liefert keine zeitbezogene Verfuegbarkeit.
- Hot Desk liefert keine konkrete Unit, sondern Area-Kontext und `seatCount`.

### Route

- Datei: [bookings.routes.ts](../src/routes/bookings.routes.ts)
- Mapping:
  - `bookingsRouter.use(requireAuth)`
  - `bookingsRouter.route("/bookings/context").get(getBookingContextController)`

### Controller

- Datei: [bookings.controller.ts](../src/controllers/bookings.controller.ts)
- Funktion: `getBookingContextController`
- Aufgabe: Auth-User pruefen, Query technisch parsen, Service aufrufen

### Service

- Datei: [booking.service.ts](../src/services/booking.service.ts)
- Funktion: `getBookingContext`
- Aufgabe:
  - Entry Context ueber `resolveBookingRequestMode` aufloesen
  - `DIRECT` ueber aktive Unit + UnitType-Policy bauen
  - `AUTO_ASSIGN` nur fuer `HOT_DESK` erlauben
  - aktive Area + Hot-Desk-SeatCount + UnitType-Policy bauen

### Response

```txt
200 { bookingContext }
```

Modi:

- `DIRECT`: konkrete Unit mit `id`, `name`, `description`, `capacity`, `unitType`
- `AUTO_ASSIGN`: `unitType` + `area` mit `id`, `name`, `description`, `seatCount`

### Error-Matrix

| Fehlerfall | HTTP |
|---|---|
| Ungueltiger oder gemischter Query-Kontext | `400` |
| Nicht eingeloggt | `401` |
| Unit/Area/UnitType nicht gefunden oder nicht buchbar | `404` |

`409` wird hier nicht verwendet, weil ohne Datum/Zeitfenster kein Buchungskonflikt bewertet wird.

---

## Customer Create Booking Flow `POST /api/bookings`

### Request

- Client sendet `POST /api/bookings`
- Header enthält `Authorization: Bearer <token>`
- Body nutzt einen von zwei Modi:
  - direkt: `unitId + date + startTime + endTime`
  - auto-assign: `areaId + unitType + date + startTime + endTime` (dauerhaft nur `HOT_DESK`)
- `date` ist `YYYY-MM-DD`; `startTime` und `endTime` sind lokale `HH:mm`-Werte in `Europe/Berlin`.

### Route

- Datei: [bookings.routes.ts](../src/routes/bookings.routes.ts)
- Mapping:
  - `bookingsRouter.use(requireAuth)`
  - `bookingsRouter.route("/bookings").post(createBookingController)`

### Controller

- Datei: [bookings.controller.ts](../src/controllers/bookings.controller.ts)
- Funktion: `createBookingController`
- Aufgabe: Auth-User prüfen, Body prüfen, Service aufrufen

### Service

- Datei: [booking.service.ts](../src/services/booking.service.ts)
- Funktion: `createBookingForUser`
- Aufgabe:
  - Modus ueber `resolveBookingRequestMode` aufloesen
  - Booking Target und dessen Duration Policy laden
  - Booking Time Input zentral ueber `booking-time-policy.ts` validieren und in UTC aufloesen (`startTime < endTime`, Zukunft, Mo-Fr, `08:00-22:00`, 15-Minuten-Raster und Duration Policy)
  - Overlap-freie Booking erstellen

### Repository

- Dateien:
  - [unit.repository.ts](../src/db/unit.repository.ts)
  - [booking.repository.ts](../src/db/booking.repository.ts)
- Funktionen:
  - `findActiveUnitByIdWithRelations`
  - `findActiveAreaById`
  - `findUnitTypeByName`
  - `listAvailableUnitsForAllocation`
  - `createBookingWithTransaction`

### Overlap-Regel

Eine Kollision liegt vor, wenn:

```txt
new_start < existing_end
AND
new_end > existing_start
```

### Mermaid (Happy Path, Direct)

```mermaid
sequenceDiagram
  participant C as Client
  participant R as bookings.routes
  participant M as requireAuth
  participant CT as bookings.controller
  participant S as booking.service
  participant UR as unit.repository
  participant DB as PostgreSQL

  C->>R: POST /api/bookings {unitId,date,startTime,endTime}
  R->>M: requireAuth
  M->>CT: createBookingController
  CT->>S: createBookingForUser(...)
  S->>S: Time Guards
  S->>UR: findActiveUnitByIdWithRelations(unitId)
  UR->>DB: SELECT active unit + unitType
  DB-->>UR: unit
  UR-->>S: unit
  S->>UR: createBookingWithTransaction(...)
  UR->>DB: check overlap + insert booking
  DB-->>UR: booking
  UR-->>S: booking
  S-->>CT: booking
  CT-->>C: 201 Created { booking }
```

### Mermaid (Happy Path, Auto Assign HOT_DESK)

```mermaid
sequenceDiagram
  participant C as Client
  participant S as booking.service
  participant AR as area.repository
  participant UR as unit.repository
  participant DB as PostgreSQL

  C->>S: createBookingForUser({areaId,unitType,date,startTime,endTime})
  S->>AR: findActiveAreaById(areaId)
  AR->>DB: SELECT active area
  DB-->>AR: area
  AR-->>S: area
  S->>UR: findUnitTypeByName(HOT_DESK)
  UR->>DB: SELECT unit type
  DB-->>UR: unit type
  UR-->>S: unit type
  S->>UR: listAvailableUnitsForAllocation(...)
  UR->>DB: SELECT free units ORDER BY displayOrder,id
  DB-->>UR: candidates[]
  UR-->>S: candidates[]
  loop candidates
    S->>UR: createBookingWithTransaction(candidate)
    UR->>DB: overlap check + insert
    DB-->>UR: booking | null
    UR-->>S: booking | null
  end
  S-->>C: 201 or 409
```

### Guard-Flow (Create)

```mermaid
flowchart TD
  A[date und HH:mm parsebar?] -->|nein| E400a[400]
  A -->|ja| B[startTime < endTime?]
  B -->|nein| E400b[400]
  B -->|ja| D[in Zukunft?]
  D -->|nein| E400d[400]
  D -->|ja| E[Mo-Fr + 08:00-22:00?]
  E -->|nein| E400e[400]
  E -->|ja| F[Request-Modus korrekt?]
  F -->|nein| E400f[400]
  F -->|ja| G[Dauerregel pro UnitType ok?]
  G -->|nein| E400g[400]
  G -->|ja| H[Direkt oder Auto-Assign]
  H -->|nichts frei/kollision| E409[409]
  H -->|Ziel gültig| I[Booking erstellen]
  I --> S201[201]
```

### Error-Matrix

| Fehlerfall | HTTP |
|---|---|
| Body ungültig / Zeitvalidierung fehlgeschlagen | `400` |
| Nicht eingeloggt | `401` |
| Unit/Area/UnitType nicht gefunden | `404` |
| Overlap / kein freier Hot Desk | `409` |

---

## Customer My Bookings Flow `GET /api/me/bookings`

### Request

- Client sendet `GET /api/me/bookings`
- Header enthält `Authorization: Bearer <token>`

### Route

- Datei: [bookings.routes.ts](../src/routes/bookings.routes.ts)
- Mapping: `bookingsRouter.route("/me/bookings").get(listMyBookingsController)`

### Controller

- Datei: [bookings.controller.ts](../src/controllers/bookings.controller.ts)
- Funktion: `listMyBookingsController`
- Aufgabe: Auth-User prüfen, Service aufrufen

### Service

- Datei: [booking.service.ts](../src/services/booking.service.ts)
- Funktion: `listUserBookings`

### Repository

- Datei: [booking.repository.ts](../src/db/booking.repository.ts)
- Funktion: `listUserBookings`

---

## Customer Cancel Booking Flow `DELETE /api/bookings/:bookingId`

### Request

- Client sendet `DELETE /api/bookings/:bookingId`
- Header enthält `Authorization: Bearer <token>`

### Route

- Datei: [bookings.routes.ts](../src/routes/bookings.routes.ts)
- Mapping: `bookingsRouter.route("/bookings/:bookingId").delete(cancelBookingController)`

### Service-Regel

`cancelBookingForUser` prüft:

- Booking existiert
- Booking ist `ACTIVE`
- Booking gehört dem User
- Booking liegt in der Zukunft

Dann Statuswechsel auf `CANCELLED`.

### Mermaid (Cancel-Regel kompakt)

```mermaid
flowchart TD
  A[bookingId + userId ok?] -->|nein| E400[400]
  A -->|ja| B[Booking vorhanden?]
  B -->|nein| E404[404]
  B -->|ja| C[Status ACTIVE?]
  C -->|nein| E409a[409]
  C -->|ja| D[Owner == userId?]
  D -->|nein| E403[403]
  D -->|ja| E[Start in Zukunft?]
  E -->|nein| E409b[409]
  E -->|ja| F[Status -> CANCELLED]
  F --> S200[200]
```

### Error-Matrix

| Fehlerfall | HTTP |
|---|---|
| Ungültiger `bookingId`-Parameter | `400` |
| Nicht eingeloggt | `401` |
| Buchung gehört anderem User | `403` |
| Buchung nicht gefunden | `404` |
| Bereits storniert oder nicht mehr zukünftig | `409` |

---

## Admin Booking Operations Flow `GET /api/admin/bookings`

### Request

- Client sendet `GET /api/admin/bookings`
- Header enthält `Authorization: Bearer <adminToken>`

### Route

- Datei: [bookings.routes.ts](../src/routes/bookings.routes.ts)
- Mapping: `bookingsRouter.route("/admin/bookings").get(requireRole("ADMIN"), getAdminBookingOperationsController)`

### Middleware

- `requireAuth` (router-level)
- `requireRole("ADMIN")` (route-level)

### Operations Module

- Datei: [admin-booking-operations.ts](../src/services/admin-booking-operations.ts)
- Interface: `adminBookingOperations.get`
- Aufgabe: View-Status und Berliner Zeitraum auflösen, gefilterte Bookings und operative Summary als einen Datensatz liefern

### Error-Matrix

| Fehlerfall | HTTP |
|---|---|
| Kein/ungültiger Token | `401` |
| Rolle nicht `ADMIN` | `403` |
| Status, Zeitraum, Preset oder Limit ungültig | `400` |
