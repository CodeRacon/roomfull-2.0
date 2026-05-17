## Frontend Auth Redirect

- Login und Register duerfen einen `next`-Query-Parameter nutzen.
- `next` muss ein interner relativer Pfad sein, z. B. `/bookings/new?unitId=...`.
- Externe URLs, protocol-relative URLs wie `//example.com`, kaputte Werte und Auth-Loops werden auf `/` zurueckgefuehrt.
- Nach erfolgreichem Login/Register speichert das Frontend den Access Token clientseitig und navigiert zu `next`.
- Der eigentliche BookingFlow bleibt zusaetzlich auth-required und darf sich nicht nur auf diesen Redirect verlassen.

---

## Login Flow `POST /api/auth/login`

### Request

- Client sendet `POST /api/auth/login`
- Body enthält `email` und `password`

### Route

- Datei: [auth.routes.ts](../src/routes/auth.routes.ts)
- Mapping: `authRouter.post("/login", loginController)`

### Controller

- Datei: [auth.controller.ts](../src/controllers/auth.controller.ts)
- Funktion: `loginController`
- Aufgabe: Body mit `parseLoginBody(...)` prüfen und `loginUser(...)` aufrufen

### Service

- Datei: [auth.service.ts](../src/services/auth.service.ts)
- Funktion: `loginUser`
- Aufgabe: User per E-Mail laden, Passwort mit `bcrypt.compare(...)` prüfen, bei Erfolg `buildAuthResponse(...)`

### Repository

- Datei: [user.repository.ts](../src/db/user.repository.ts)
- Funktion: `findUserByEmail(email)`
- Aufgabe: User aus der DB per E-Mail holen

### Response

- Status: `200 OK`
- Body:
  - `token: string`
  - `user: { id, name, email, role, createdAt }`

### Mermaid (Happy Path)

```mermaid
sequenceDiagram
  participant C as Client
  participant R as auth.routes
  participant CT as auth.controller
  participant S as auth.service
  participant UR as user.repository
  participant DB as PostgreSQL

  C->>R: POST /api/auth/login
  R->>CT: loginController
  CT->>S: loginUser(email,password)
  S->>UR: findUserByEmail(email)
  UR->>DB: SELECT user by email
  DB-->>UR: user
  UR-->>S: user
  S-->>CT: authResponse(token,user)
  CT-->>C: 200 OK
```

### Error-Matrix

| Fehlerfall | HTTP |
|---|---|
| Body ungültig (`email/password`) | `400` |
| User fehlt oder Passwort falsch | `401` |

---

## Register Flow `POST /api/auth/register`

### Request

- Client sendet `POST /api/auth/register`
- Body enthält `name`, `email` und `password`

### Route

- Datei: [auth.routes.ts](../src/routes/auth.routes.ts)
- Mapping: `authRouter.post("/register", registerController)`

### Controller

- Datei: [auth.controller.ts](../src/controllers/auth.controller.ts)
- Funktion: `registerController`
- Aufgabe: Body mit `parseRegisterBody(...)` prüfen und `registerUser(...)` aufrufen

### Service

- Datei: [auth.service.ts](../src/services/auth.service.ts)
- Funktion: `registerUser`
- Aufgabe: E-Mail per `findUserByEmail(...)` prüfen, Passwort mit `bcrypt.hash(...)` hashen, User anlegen, dann Token und Response bauen

### Repository

- Datei: [user.repository.ts](../src/db/user.repository.ts)
- Funktionen: `findUserByEmail(email)` und `createUser(input)`
- Aufgabe: Vorhandenen User prüfen und neuen User in die DB schreiben

### Response

- Status: `201 Created`
- Body:
  - `token: string`
  - `user: { id, name, email, role, createdAt }`

### Mermaid (Happy Path)

```mermaid
sequenceDiagram
  participant C as Client
  participant R as auth.routes
  participant CT as auth.controller
  participant S as auth.service
  participant UR as user.repository
  participant DB as PostgreSQL

  C->>R: POST /api/auth/register
  R->>CT: registerController
  CT->>S: registerUser(name,email,password)
  S->>UR: findUserByEmail(email)
  UR->>DB: SELECT user by email
  DB-->>UR: null
  UR-->>S: null
  S->>UR: createUser(...)
  UR->>DB: INSERT user
  DB-->>UR: created user
  UR-->>S: user
  S-->>CT: authResponse(token,user)
  CT-->>C: 201 Created
```

### Error-Matrix

| Fehlerfall | HTTP |
|---|---|
| Body ungültig (`name/email/password`) | `400` |
| E-Mail bereits vergeben | `409` |

---

## Me Flow `GET /api/auth/me`

### Request

- Client sendet `GET /api/auth/me`
- Header enthält `Authorization: Bearer <token>`

### Route

- Datei: [auth.routes.ts](../src/routes/auth.routes.ts)
- Mapping: `authRouter.get("/me", requireAuth, meController)`

### Middleware

- Datei: [auth.middleware.ts](../src/middleware/auth.middleware.ts)
- Funktion: `requireAuth`
- Aufgabe: Bearer-Token prüfen, JWT verifizieren, `req.auth` setzen

### Controller

- Datei: [auth.controller.ts](../src/controllers/auth.controller.ts)
- Funktion: `meController`
- Aufgabe: `req.auth.userId` lesen und `getCurrentUser(...)` aufrufen

### Service

- Datei: [auth.service.ts](../src/services/auth.service.ts)
- Funktion: `getCurrentUser`
- Aufgabe: User per ID laden und als Public-User zurückgeben

### Repository

- Datei: [user.repository.ts](../src/db/user.repository.ts)
- Funktion: `findUserById(id)`
- Aufgabe: User aus der DB per ID holen

### Response

- Status: `200 OK`
- Body:
  - `user: { id, name, email, role, createdAt }`

### Mermaid (Happy Path)

```mermaid
sequenceDiagram
  participant C as Client
  participant R as auth.routes
  participant M as requireAuth
  participant CT as auth.controller
  participant S as auth.service
  participant UR as user.repository
  participant DB as PostgreSQL

  C->>R: GET /api/auth/me + Bearer token
  R->>M: requireAuth
  M->>CT: meController(req.auth.userId)
  CT->>S: getCurrentUser(userId)
  S->>UR: findUserById(userId)
  UR->>DB: SELECT user by id
  DB-->>UR: user
  UR-->>S: user
  S-->>CT: publicUser
  CT-->>C: 200 OK
```

### Error-Matrix

| Fehlerfall | HTTP |
|---|---|
| Token fehlt/ungültig | `401` |
| User nicht gefunden | `404` |
