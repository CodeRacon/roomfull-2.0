## Customer Create Booking Flow `POST /api/bookings`

### Request

- Client sendet `POST /api/bookings`
- Header enthält `Authorization: Bearer <token>`
- Body nutzt einen von zwei Modi:
  - direkt: `unitId + start + end`
  - auto-assign: `areaId + unitType + start + end` (in V1 nur `HOT_DESK`)

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
  - Zeitvalidierung (`start < end`, Zukunft, Mo-Fr, `08:00-22:00`)
  - Modus auflösen (direkt vs auto-assign)
  - Dauerregel aus UnitType-Policy prüfen
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

  C->>R: POST /api/bookings {unitId,start,end}
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

  C->>S: createBookingForUser({areaId,unitType,start,end})
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
  A[start/end parsebar?] -->|nein| E400a[400]
  A -->|ja| B[start < end?]
  B -->|nein| E400b[400]
  B -->|ja| C[in Zukunft?]
  C -->|nein| E400c[400]
  C -->|ja| D[Mo-Fr + 08:00-22:00?]
  D -->|nein| E400d[400]
  D -->|ja| E[Request-Modus korrekt?]
  E -->|nein| E400e[400]
  E -->|ja| F[Dauerregel pro UnitType ok?]
  F -->|nein| E400f[400]
  F -->|ja| G[Direkt oder Auto-Assign]
  G -->|nichts frei/kollision| E409[409]
  G -->|Ziel gültig| H[Booking erstellen]
  H --> S201[201]
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

## Admin List Bookings Flow `GET /api/admin/bookings`

### Request

- Client sendet `GET /api/admin/bookings`
- Header enthält `Authorization: Bearer <adminToken>`

### Route

- Datei: [bookings.routes.ts](../src/routes/bookings.routes.ts)
- Mapping: `bookingsRouter.route("/admin/bookings").get(requireRole("ADMIN"), listAdminBookingsController)`

### Middleware

- `requireAuth` (router-level)
- `requireRole("ADMIN")` (route-level)

### Service

- Datei: [booking.service.ts](../src/services/booking.service.ts)
- Funktion: `listAllBookingsForAdmin`

### Error-Matrix

| Fehlerfall | HTTP |
|---|---|
| Kein/ungültiger Token | `401` |
| Rolle nicht `ADMIN` | `403` |
