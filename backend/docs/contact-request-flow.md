## Customer Contact Request Flow `POST /api/contact-requests`

### Fachregeln

- Customer Contact ist ein geschuetzter Self-Service-Kanal.
- Nur eingeloggte Customers duerfen Contact Requests absenden.
- Admins und Visitors duerfen keine Customer Contact Requests absenden.
- Erlaubte Contact Request Types sind `QUESTION`, `FEEDBACK` und `CRITICISM`.
- Es wird keine E-Mail versendet.
- Neue Contact Requests werden im Backend gespeichert und starten mit `isRead: false`.

### Request

- Client sendet `POST /api/contact-requests`
- Header enthaelt `Authorization: Bearer <token>`
- Body enthaelt `type` und `message`

```json
{
  "type": "QUESTION",
  "message": "Ich habe eine Frage zu meiner Buchung."
}
```

### Route

- Datei: [contact-requests.routes.ts](../src/routes/contact-requests.routes.ts)
- Mapping: `contactRequestsRouter.post("/", requireRole("CUSTOMER"), createContactRequestController)`

### Controller

- Datei: [contact-requests.controller.ts](../src/controllers/contact-requests.controller.ts)
- Aufgabe: Body technisch pruefen, `req.auth.userId` lesen und Service aufrufen

### Service

- Datei: [contact-request.service.ts](../src/services/contact-request.service.ts)
- Aufgabe: Contact Request Type und Message fachlich validieren, globale Read-State-Regel setzen

### Repository

- Datei: [contact-request.repository.ts](../src/db/contact-request.repository.ts)
- Aufgabe: Contact Request persistieren

### Response

- Status: `201 Created`
- Body:
  - `contactRequest: { id, userId, type, message, isRead, createdAt }`

### Error-Matrix

| Fehlerfall | HTTP |
|---|---|
| Body ungueltig (`type/message`) | `400` |
| Nicht eingeloggt | `401` |
| Rolle ist nicht Customer | `403` |

---

## Admin Contact Inbox Flow

### Fachregeln

- Nur Admins duerfen eingegangene Customer Contact Requests lesen.
- Admins duerfen nach `type` und globalem Lesestatus filtern.
- Admins duerfen nach Eingangszeit auf- oder absteigend sortieren.
- Admins duerfen eine Contact Request global als gelesen markieren.
- Admins duerfen die globale Anzahl ungelesener Contact Requests abrufen.
- Es gibt im ersten Slice keine Antwortfunktion und keinen E-Mail-Versand.
- Der Lesestatus ist global pro Contact Request, nicht pro Admin.

### Endpoints

- `GET /api/admin/contact-requests`
- `GET /api/admin/contact-requests/unread-count`
- `PATCH /api/admin/contact-requests/:contactRequestId/read`

### Query

- `type=QUESTION|FEEDBACK|CRITICISM`
- `readState=all|read|unread`
- `sort=received_desc|received_asc`

### Response

- Liste: `contactRequests[]`
- Unread Count: `unreadCount`
- Mark-as-read: `contactRequest`
- Admin-Response enthaelt minimale Customer-Anzeigedaten: `user.id`, `user.name`, `user.email`

### Error-Matrix

| Fehlerfall | HTTP |
|---|---|
| Query oder Route-Parameter ungueltig | `400` |
| Nicht eingeloggt | `401` |
| Rolle ist nicht Admin | `403` |
| Contact Request fehlt beim Mark-as-read | `404` |
