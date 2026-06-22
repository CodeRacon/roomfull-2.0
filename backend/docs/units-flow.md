## Public Units List Flow `GET /api/public/units`

### Request

- Client sendet `GET /api/public/units`
- Response-Units enthalten `unitType.minDurationMinutes` und `unitType.maxDurationMinutes`
- Optionaler Query-Parameter: `unitType`
- Erlaubte Werte:
  - `HOT_DESK`
  - `BOOTH`
  - `TEAM_ROOM`
  - `MEETING_ROOM`
- Beispiel: `GET /api/public/units?unitType=BOOTH`

### Route

- Datei: [public-units.routes.ts](../src/routes/public-units.routes.ts)
- Mapping: `publicUnitsRouter.route("/units").get(listPublicUnitsController)`

### Controller

- Datei: [public-units.controller.ts](../src/controllers/public-units.controller.ts)
- Funktion: `listPublicUnitsController`
- Aufgabe: optionalen `unitType`-Query lesen, `getPublicUnits(...)` aufrufen und Ergebnis als `{ units }` zurückgeben

### Service

- Datei: [unit.service.ts](../src/services/unit.service.ts)
- Funktion: `getPublicUnits`
- Aufgabe: optionalen `unitType` validieren und nur aktive Units laden lassen

### Repository

- Datei: [unit.repository.ts](../src/db/unit.repository.ts)
- Funktionen:
  - `listActiveUnitsWithRelations`
  - `listActiveUnitsWithRelationsByUnitType`
- Aufgabe: DB-Query mit `where: { isActive: true }`, optional gefiltert nach `unitType.name`

### Mermaid (Happy Path)

```mermaid
sequenceDiagram
  participant C as Client
  participant R as public-units.routes
  participant CT as public-units.controller
  participant S as unit.service
  participant UR as unit.repository
  participant DB as PostgreSQL

  C->>R: GET /api/public/units?unitType=BOOTH
  R->>CT: listPublicUnitsController
  CT->>S: getPublicUnits({unitType})
  S->>S: unitType validieren
  S->>UR: listActiveUnitsWithRelationsByUnitType(BOOTH)
  UR->>DB: SELECT units WHERE is_active=true AND unit_type=BOOTH
  DB-->>UR: units
  UR-->>S: units
  S-->>CT: units
  CT-->>C: 200 OK { units }
```

### Error-Matrix

| Fehlerfall | HTTP |
|---|---|
| Ungültiger `unitType`-Query | `400` |

---

## Public Unit Detail Flow `GET /api/public/units/:unitId`

### Request

- Client sendet `GET /api/public/units/:unitId`

### Route

- Datei: [public-units.routes.ts](../src/routes/public-units.routes.ts)
- Mapping: `publicUnitsRouter.route("/units/:unitId").get(getPublicUnitByIdController)`

### Controller

- Datei: [public-units.controller.ts](../src/controllers/public-units.controller.ts)
- Funktion: `getPublicUnitByIdController`
- Aufgabe: `unitId` prüfen, `getPublicUnitById(...)` aufrufen, Ergebnis als `{ unit }` zurückgeben

### Service

- Datei: [unit.service.ts](../src/services/unit.service.ts)
- Funktion: `getPublicUnitById`
- Aufgabe: nur aktive Units zulassen, sonst `404`

### Repository

- Datei: [unit.repository.ts](../src/db/unit.repository.ts)
- Funktion: `findActiveUnitById`

### Mermaid (Happy Path)

```mermaid
sequenceDiagram
  participant C as Client
  participant R as public-units.routes
  participant CT as public-units.controller
  participant S as unit.service
  participant UR as unit.repository
  participant DB as PostgreSQL

  C->>R: GET /api/public/units/:unitId
  R->>CT: getPublicUnitByIdController
  CT->>S: getPublicUnitById(unitId)
  S->>UR: findActiveUnitById(unitId)
  UR->>DB: SELECT active unit by id
  DB-->>UR: unit
  UR-->>S: unit
  S-->>CT: unit
  CT-->>C: 200 OK { unit }
```

### Error-Matrix

| Fehlerfall | HTTP |
|---|---|
| Ungültiger `unitId`-Parameter | `400` |
| Unit nicht gefunden/inaktiv | `404` |

---

## Admin Create Flow `POST /api/admin/units`

### Request

- Client sendet `POST /api/admin/units`
- Header enthält `Authorization: Bearer <token>`

### Route

- Datei: [admin-units.routes.ts](../src/routes/admin-units.routes.ts)
- Mapping:
  - `adminUnitsRouter.use(requireAuth, requireRole("ADMIN"))`
  - `adminUnitsRouter.route("/units").post(createAdminUnitController)`

### Controller

- Datei: [admin-units.controller.ts](../src/controllers/admin-units.controller.ts)
- Funktion: `createAdminUnitController`
- Aufgabe: Body parsen/prüfen, `createNewUnit(...)` aufrufen

### Service

- Datei: [unit.service.ts](../src/services/unit.service.ts)
- Funktion: `createNewUnit`
- Aufgabe: Fachregeln prüfen (`name`, `description`, `capacity`, `unitTypeId`, optional `areaId`)

### Repository

- Datei: [unit.repository.ts](../src/db/unit.repository.ts)
- Funktionen: `doesUnitTypeExist`, `createUnit`

### Error-Matrix

| Fehlerfall | HTTP |
|---|---|
| Kein Token | `401` |
| Rolle nicht `ADMIN` | `403` |
| Body ungültig | `400` |
| UnitType/Area nicht gefunden | `404` |

---

## Admin Update Flow `PUT /api/admin/units/:unitId`

### Route

- Datei: [admin-units.routes.ts](../src/routes/admin-units.routes.ts)
- Mapping: `adminUnitsRouter.route("/units/:unitId").put(updateAdminUnitController)`

### Controller

- Datei: [admin-units.controller.ts](../src/controllers/admin-units.controller.ts)
- Funktion: `updateAdminUnitController`
- Aufgabe: `unitId` + Body prüfen, `updateExistingUnit(...)` aufrufen

### Service

- Datei: [unit.service.ts](../src/services/unit.service.ts)
- Funktion: `updateExistingUnit`
- Aufgabe: Unit-Existenz prüfen, optionale Felder validieren, optional UnitType/Area prüfen

### Repository

- Datei: [unit.repository.ts](../src/db/unit.repository.ts)
- Funktionen: `findUnitById`, `doesUnitTypeExist`, `updateUnit`

### Error-Matrix

| Fehlerfall | HTTP |
|---|---|
| Kein Token | `401` |
| Rolle nicht `ADMIN` | `403` |
| `unitId` ungültig | `400` |
| Body ungültig | `400` |
| Unit/UnitType/Area nicht gefunden | `404` |

---

## Admin Deactivate Flow `PATCH /api/admin/units/:unitId/deactivate`

### Route

- Datei: [admin-units.routes.ts](../src/routes/admin-units.routes.ts)
- Mapping: `adminUnitsRouter.route("/units/:unitId/deactivate").patch(deactivateAdminUnitController)`

### Controller

- Datei: [admin-units.controller.ts](../src/controllers/admin-units.controller.ts)
- Funktion: `deactivateAdminUnitController`
- Aufgabe: `unitId` prüfen und `deactivateExistingUnit(...)` aufrufen

### Service

- Datei: [unit.service.ts](../src/services/unit.service.ts)
- Funktion: `deactivateExistingUnit`
- Aufgabe: Unit muss existieren, dann `isActive=false` setzen

### Repository

- Datei: [unit.repository.ts](../src/db/unit.repository.ts)
- Funktionen: `findUnitById`, `deactivateUnit`

### Error-Matrix

| Fehlerfall | HTTP |
|---|---|
| Kein Token | `401` |
| Rolle nicht `ADMIN` | `403` |
| `unitId` ungültig | `400` |
| Unit nicht gefunden | `404` |
