# API Summary

## Ziel

Die API bildet den Kern von RoomFull 2.0 ab: Auth, Units, Verfügbarkeit, Bookings und Admin-Verwaltung.

Sie bleibt bewusst klein, aber bildet die zentrale Business-Logik sauber im Backend ab.

## Kernmodule

- `auth`
- `public booking options`
- `public units`
- `bookings`
- `customer contact`
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

`GET /public/booking-options` speist die Booking Options Page als fokussierten Buchungseinstieg.

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
- `maxCapacity`
- `areas`

`HOT_DESK` liefert Areas mit aktiver Unit-Anzahl. `BOOTH`, `TEAM_ROOM` und `MEETING_ROOM` liefern `areas: []`.

`GET /public/units` bleibt für konkrete Unit-Auswahl und Unit-Details bestehen.
`Unit.unitType` enthält ebenfalls `minDurationMinutes` und `maxDurationMinutes`.
Der Endpoint ist optional nach `unitType` filterbar, z. B. `GET /public/units?unitType=BOOTH`.
Der Endpoint unterstützt `locale=de|en` für lokalisierte DB-Content-Felder wie `description`; der Response-Contract bleibt ein einfaches `description`.
Ungültige `unitType`-Werte liefern `400 Bad Request`.

### Bookings

- `GET /bookings/context`
- `GET /bookings/availability?date=YYYY-MM-DD&unitId=...`
- `GET /bookings/availability?date=YYYY-MM-DD&areaId=...&unitType=HOT_DESK`
- `POST /bookings`
- `GET /me/bookings`
- `GET /units/:unitId/calendar-state?month=YYYY-MM`
- `DELETE /bookings/:bookingId`

`GET /me/bookings` liefert eigene Bookings inklusive minimaler Unit-Anzeigedaten (`unit.id`, `unit.name`, `unit.unitType.name`), damit die UI Buchungen typgerecht darstellen kann.

### Customer Contact

- `POST /contact-requests`

`POST /contact-requests` ist Customer-only und speichert eine Customer Contact Request ohne E-Mail-Versand.

Request:

- `type=QUESTION|FEEDBACK|CRITICISM`
- `message`

Neue Contact Requests starten mit globalem `isRead=false`.
Visitors erhalten `401`, Admins erhalten `403`.

### Admin

- `GET /admin/units`
- `GET /admin/units/context`
- `POST /admin/units`
- `PUT /admin/units/:unitId`
- `PATCH /admin/units/:unitId/deactivate`
- `GET /admin/bookings`
- `GET /admin/analytics/booking-demand`
- `GET /admin/contact-requests`
- `GET /admin/contact-requests/unread-count`
- `PATCH /admin/contact-requests/:contactRequestId/read`

`GET /admin/units` liefert BookableUnits für die Admin-Inventaransicht und darf aktive, deaktivierte oder alle Units enthalten.

Unterstützte Query-Parameter:

- `status=active|deactivated|all` (Default: `active`)
- `unitType=HOT_DESK|BOOTH|TEAM_ROOM|MEETING_ROOM`
- `search=<name>`

`GET /admin/units/context` liefert Auswahlwerte für Admin-Unit-Formulare:

- `unitTypes`
- `areas`

`GET /admin/bookings` liefert einen gemeinsamen Admin-Operations-Datensatz aus gefilterten Bookings, effektivem Zeitraum und operativer Summary.

Unterstützte Query-Parameter:

- `status=upcoming|today|completed|cancelled|all`
- `range=week|month|quarter|year`
- `from=YYYY-MM-DD`
- `to=YYYY-MM-DD`
- `limit=1..500`
- `search=<customer name or email>`

`status=all` umfasst Vergangenheit und Zukunft im gewählten Zeitraum, damit anstehende Bookings nicht aus der Gesamtsicht fallen.
`range` wird passend zum Status als rollierender Berliner Kalenderzeitraum aufgelöst und darf nicht mit `from/to` kombiniert werden.
`search` durchsucht ausschließlich Customer-Name und Customer-E-Mail, nicht Unit-Namen oder sonstige Booking-Felder.
Die Summary folgt Zeitraum und Customer-Suche, ignoriert Status und `limit` und zählt für `topBookedUnit` nur aktive Bookings.

`GET /admin/analytics/booking-demand` liefert den Nachfrageverlauf für das Admin Analytics Dashboard.
Die Metrik zählt aktive Bookings gruppiert nach Booking-Startdatum.
Zusätzlich liefert der Endpoint aktive Bookings im gewählten Zeitraum gruppiert nach `UnitType`.
Die Stornoquote vergleicht aktive und stornierte Bookings im selben Zeitraum.
Ohne explizite `from/to`-Werte nutzt der Endpoint 30 Tage zurück und 30 Tage voraus.

`GET /admin/contact-requests` liefert Customer Contact Requests inklusive minimaler Customer-Anzeigedaten (`user.name`, `user.email`) für die Admin Contact Inbox.

Unterstützte Query-Parameter:

- `type=QUESTION|FEEDBACK|CRITICISM`
- `readState=all|read|unread`
- `sort=received_desc|received_asc`

`GET /admin/contact-requests/unread-count` liefert die globale Anzahl ungelesener Contact Requests für dezente Admin-Hinweise.

`PATCH /admin/contact-requests/:contactRequestId/read` markiert eine Contact Request global als gelesen.
Der Lesestatus ist nicht pro Admin getrennt.

## Rollenbezug

- `customer` nutzt Auth, Units und eigene Bookings
- `customer` darf Customer Contact Requests absenden
- `admin` nutzt zusätzlich Admin-Endpunkte und darf ebenfalls Bookings anlegen

## Booking-Modi

`POST /bookings` unterstützt zwei Modi:

- direkt: `unitId + date + startTime + endTime`
- auto-assign: `areaId + unitType + date + startTime + endTime` (dauerhaft nur `HOT_DESK`)

`date` ist `YYYY-MM-DD`; `startTime` und `endTime` sind lokale `HH:mm`-Werte in `Europe/Berlin`. Der Browser erzeugt keine fachlichen ISO-Zeitpunkte.

`GET /bookings/context` ist auth-required und validiert den Einstiegskontext fuer `/bookings/new`:

- direkt: `unitId`
- auto-assign: `unitType=HOT_DESK + areaId`

Der Endpoint unterstützt `locale=de|en` für lokalisierte Unit-/Area-Beschreibungen.
Der Endpoint liefert Anzeige- und Dauerregel-Kontext, aber keine zeitbezogene Verfügbarkeit.

`GET /bookings/availability` liefert nach Datumsauswahl die gemeinsame Availability-Basis fuer Direct Booking und Hot-Desk-Auto-Assign:

- globales 15-Minuten-Grid
- Öffnungszeiten als lokale `HH:mm`
- `slots` als berechnete Availability Slots mit `availableUnitCount`
- `blockedIntervals` als lokale `HH:mm`
- keine konkreten Hot-Desk-Unit-IDs
- Submit bleibt finale Verfügbarkeitsprüfung

BookingOptions nutzen dieselbe fachliche Unterscheidung:

- `AUTO_ASSIGN` für Hot Desk
- `CHOOSE_UNIT` für Booth, Team Room und Meeting Room

## Validierung

### Booking

- `start < end`
- Start und Ende am selben Kalendertag
- nur zukünftige Zeiträume
- nur Mo-Fr und innerhalb 08:00-22:00
- Start und Ende auf globalem 15-Minuten-Grid
- Dauer nach UnitType-Policy
- keine Überschneidung aktiver Bookings auf derselben Unit
- Auto-Assign ist race-sicher (Transaktion/Konflikt-Retry)

### Direct Booking Calendar State

- auth-required
- Customer und Admin erlaubt
- liefert `available`, `partially-booked` oder `fully-booked` pro buchbarem Werktag eines Monats
- `fully-booked` bedeutet: Es existiert keine freie, zur Duration Policy der Unit passende Zeitspanne mehr
- berücksichtigt nur aktive Bookings
- liefert keine rohen Booking-, User- oder Owner-Daten
- `month` muss `YYYY-MM`, aktuell oder zukünftig sein
- unbekannte/inaktive Unit liefert `404`

### Unit Management

- Name nicht leer
- Kapazität > 0
- `unitTypeId` muss existieren
- `areaId` optional, muss bei Angabe existieren
- `HOT_DESK` braucht immer eine `areaId`

### Customer Contact

- nur eingeloggte Customers duerfen Contact Requests absenden
- erlaubte Typen sind `QUESTION`, `FEEDBACK`, `CRITICISM`
- `message` darf nicht leer sein
- kein E-Mail-Versand
- Lesestatus startet global ungelesen
- Admins duerfen Contact Requests lesen, filtern und global als gelesen markieren

## Fehlerbilder

- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `404 Not Found`
- `409 Conflict`

## Leitregel

Controller bleiben dünn, Services bündeln Fachlogik, DB-Layer kapselt Queries.
