# Project Decisions

## Ziel

Diese Datei hält bewusste Produkt- und Architekturentscheidungen für RoomFull 2.0 fest.

## Produkt

- RoomFull wird als kleines MVP gebaut
- Fokus liegt auf Buchungslogik, Rollen, Verfügbarkeit und sauberer Struktur
- Version 1 soll bewusst nicht alles können

## Nicht Teil von Version 1

- Payments
- E-Mail-Benachrichtigungen
- Kalender-Sync
- Echtzeit-Updates
- Wartelisten
- komplexe Preislogik
- mehrere Standorte
- AI-Funktionen
- perfektes UI-Finishing

## Modell-Schnitt (Big-Bang)

- Legacy `space`/`spaceType` wird abgelöst
- neues Zielmodell:
  - `Area`
  - `UnitType`
  - `BookableUnit`
  - `Booking(unitId, ...)`
- Legacy-Routen auf `/spaces` werden entfernt (kein Parallelbetrieb)

## API-Sprache

- intern: `BookableUnit`
- extern (API): kurze Sprache mit `Unit`/`unitId`
- Endpunkte:
  - `/public/units`
  - `/public/booking-options`
  - `/admin/units`

## Public BookingOptions

- `/` ist die öffentliche Home Page und erklärt RoomFull als Service
- `/booking-options` ist die fokussierte Booking Options Page und zeigt `BookingOption`s als Customer-facing Einstieg in den Buchungsflow
- `/booking-options` bleibt eine schlanke Kategorie-Übersicht; konkrete Area- oder Unit-Auswahl passiert auf `/booking-options/[slug]`
- Angebots-Teaser auf der Home Page verlinken auf `/booking-options/[slug]`, nicht direkt auf `/bookings/new`
- Die Home Page nennt diese Teaser in der UI `Arbeitsbereiche`; fachlich bleiben es `BookingOption`s
- Die Home Page nutzt `BookingOption`s als Datenbasis und präsentiert sie kuratiert mit service-orientierten Texten
- Varianten werden auf der Home Page nur angeteasert; konkrete Area- oder Unit-Auswahl passiert auf `/booking-options/[slug]`
- Farbe, vertikales Kategorie-Label und markante Typografie sind die visuellen UnitType-Signale; eigene SVG-Icons sind nicht Teil dieses Musters
- Die Home Page nutzt auth-aware CTAs:
  - anonym: `Jetzt Platz finden`, `Einloggen`
  - angemeldet: `Jetzt Platz finden`, `Meine Buchungen`
- Eine `BookingOption` entspricht im MVP genau einem bewusst freigegebenen `UnitType`
- Public BookingOptions kommen aus einer expliziten Backend-Allowlist, nicht automatisch aus allen `UnitType`-Datensätzen
- Allowlist für V1:
  - `HOT_DESK`
  - `BOOTH`
  - `TEAM_ROOM`
  - `MEETING_ROOM`
- `BookingOption.key` entspricht dem jeweiligen `UnitTypeName`
- Endpoint: `GET /public/booking-options`
- Der Endpoint beschreibt grundsätzliche Buchungsoptionen ohne Zeitraum
- Zeitbezogene Verfügbarkeit kommt später in separaten Flow-Schritten
- `status` beschreibt nur grundsätzliche Verfügbarkeit:
  - `AVAILABLE`
  - `UNAVAILABLE`
- `bookingMode` beschreibt den nächsten Buchungsschritt:
  - `AUTO_ASSIGN`
  - `CHOOSE_UNIT`
- `areaSelection` beschreibt, ob der Customer eine Area wählen muss:
  - `REQUIRED`
  - `NOT_APPLICABLE`
- `HOT_DESK` nutzt `AUTO_ASSIGN` und `areaSelection: REQUIRED`
- `BOOTH`, `TEAM_ROOM` und `MEETING_ROOM` nutzen `CHOOSE_UNIT` und `areaSelection: NOT_APPLICABLE`
- `HOT_DESK.areas[]` wird mit buchbaren Areas und deren aktiver Unit-Anzahl befüllt
- `BOOTH`, `TEAM_ROOM` und `MEETING_ROOM` liefern `areas: []`, auch wenn konkrete Units intern Area-Zuordnungen haben
- Ein fehlender Allowlist-`UnitType` ist ein System-/Seed-Fehler und soll hart sichtbar werden
- UI-Labels, Descriptions und Color-Schemes bleiben Frontend-Presentation-Mapping und sind keine Backend-Fachlogik
- DB-Content wie konkrete Unit- und Area-Beschreibungen darf lokalisiert im Datenmodell liegen (`descriptionDe`, `descriptionEn`), wird in Public-/Booking-Context-Responses aber weiterhin als simples `description` ausgeliefert
- Public Content-Lokalisierung wird explizit per `locale=de|en` angefordert; unbekannte Locale-Werte fallen auf Deutsch zurück

## Zeitmodell

- keine gespeicherten TimeSlot-Objekte
- Bookings arbeiten mit `start_time` und `end_time`
- Der Create-Contract nutzt `date + startTime + endTime` als lokale Coworking-Zeit in `Europe/Berlin`; Browser-Zeitzonen bestimmen keine Fachzeit
- Verfügbarkeit wird aus bestehenden Bookings berechnet
- alle Bookings müssen auf dem globalen 15-Minuten-Booking-Time-Grid liegen
- Availability Slots sind berechnete Preview-Ergebnisse, keine gespeicherten Fachobjekte

## Öffnungszeiten-Entscheidung

- Source of Truth: globale Öffnungszeiten für alle UnitTypes
- Version 1: Montag bis Freitag, `08:00` bis `22:00`
- Öffnungszeiten werden nicht pro Area oder UnitType gepflegt
- Jede Booking-/Availability-Prüfung nutzt diese globalen Öffnungszeiten

## Dauerregeln-Entscheidung

- Dauerregeln sind datengetrieben über `unit_types`
- Startwerte:
  - `HOT_DESK`: min 30, max 240 Minuten
  - `BOOTH`: min 60, max 240 Minuten
  - `TEAM_ROOM`: min 60, max 480 Minuten
  - `MEETING_ROOM`: min 60, max 480 Minuten

## Hot-Desk-Entscheidung

- `Hot Desk` ist ein `UnitType` für einzelne buchbare Plätze
- `Open World` und `Quiet Space` sind Areas, keine buchbaren Einheiten
- `HOT_DESK` braucht immer eine `areaId`
- Auto-Assign-Modus:
  - Request: `areaId + unitType + date + startTime + endTime`
  - dauerhaft nur für `HOT_DESK`
  - Auswahl deterministisch nach `displayOrder`, dann `id`
  - race-sicher über Transaktion/Konflikt-Retry

## Booking-Modell

- Status in Version 1:
  - `active`
  - `cancelled`
- stornierte Bookings bleiben historisch erhalten
- stornierte Bookings blockieren keine Verfügbarkeit mehr
- `start_time < end_time`
- Start und Ende liegen am selben Kalendertag
- nur zukünftige Zeiträume
- nur Montag bis Freitag
- nur innerhalb globaler Öffnungszeiten (08:00-22:00)
- Start und Ende müssen auf dem 15-Minuten-Booking-Time-Grid liegen
- Zeit- und Kalenderumrechnung liegt zentral hinter der Coworking-Calendar-Seam; Tests verwenden einen Fixed-Clock-Adapter
- Overlap-Regel: `new_start < existing_end AND new_end > existing_start`
- Customers dürfen nur eigene zukünftige Bookings stornieren
- Admin darf Bookings lesen und ebenfalls Bookings anlegen
- Admin nutzt für operative oder testweise Booking-Erstellung bewusst den normalen Customer-Flow über `/booking-options`
- Es gibt in V1 keinen separaten Admin-Einstieg für "Buchungsflow prüfen"
- kein Admin-Fremd-Storno

## Fachliche Wahrheit

- das Backend ist die verbindliche Instanz für Business-Logik
- das Frontend unterstützt die Regeln, definiert sie aber nicht

## Frontend-Architektur

- Frontend nutzt pragmatisches Feature-Sliced Design
- keine globale `components`-Mischstruktur
- klare Trennung von `entities`, `features`, `widgets`, `shared` und duennen Next-Routen unter `src/app`
- `entities/session` ist die zentrale Auth-Quelle im Frontend
- die Session-Entity haelt User und Status; das Backend kontrolliert das fuer JavaScript unlesbare `HttpOnly`-Cookie
- Header, Login/Register, Logout und geschützte Pages konsumieren dieselbe Session API
- bestehende Sessions werden über `GET /auth/me` validiert
- auth-required UI-Flows nutzen eine Protected Route Boundary statt eigener Page-Tokenchecks
- der zentrale API-Client sendet Web-Requests mit `credentials: "include"`; Web setzt keinen Authorization Header

## Admin Analytics Charting

- Das umgesetzte Analytics Dashboard auf `/admin` nutzt Recharts direkt als Chart-Engine
- Recharts wird als Engine verwendet, nicht als eigenes Designsystem
- Styling, Layout, Empty States und Dashboard-Komposition bleiben RoomFull-eigene UI
- Keine Dashboard-Komplettbibliothek als UI-Basis
- Nicht gewählt für den ersten Slice:
  - Chart.js, weil Canvas weniger gut zur bestehenden React-/Tailwind-Komposition passt
  - Nivo, weil der Umfang für die ersten RoomFull-Charts zu groß ist
  - Tremor als UI-Library, weil RoomFull sein eigenes UI-System behält
  - eigenes D3, weil die ersten Charts keine Low-Level-Visualisierung brauchen
- Das Chart-Set bleibt auf Nachfrageentwicklung fokussiert:
  - Nachfrageverlauf
  - Nachfrage nach UnitType
  - Stornoquote

## Backend-Architektur

- klassisch modular mit `routes`, `controllers`, `services`, `db`, `middleware`
- Business-Logik gehört in `services`

## Leitregel

Erst:

- Regeln
- Datenmodell
- API
- UI
- Qualität
- Ausbau
