---
name: roomfull
description: Für RoomFull-2.0-Aufgaben verwenden, insbesondere bei Architektur, Dateiplatzierung, Feature-Sliced Design, Backend-Service-Logik, Rollen/Rechten, Buchungsregeln, API-Struktur und Projektdokumentation. Nicht für generische, projektfremde Coding-Aufgaben verwenden.
---

# RoomFull 2.0 Skill

## Ziel

RoomFull 2.0 ist ein kleines MVP für die Buchung von Coworking-Spaces.

Der Fokus liegt auf:

- klarer Fachlogik
- sauberen Rollen und Rechten
- nachvollziehbarer Buchungslogik
- einfacher, wartbarer Fullstack-Struktur

## Einstieg in die Projektdoku

Nutze zuerst die Summary-Dateien als schnellen Einstieg:

- [Project Summary](summaries/project-summary.md)
- [Domain Summary](summaries/domain-summary.md)
- [FSD Summary](summaries/fsd-summary.md)
- [API Summary](summaries/api-summary.md)

Bei Änderungen, Unsicherheiten oder Detailfragen prüfe zusätzlich:

- [Domain Rules](domain-rules.md)
- [API Overview](api-overview.md)
- [FSD Architecture](fsd-architecture.md)
- [Frontend Conventions](frontend-conventions.md)
- [Backend Conventions](backend-conventions.md)
- [Project Decisions](project-decisions.md)

## Tech Stack

- Frontend: Next.js + TypeScript
- Backend: Express + TypeScript
- Datenbank: PostgreSQL

## Grundprinzipien

- Backend ist die fachliche Wahrheit
- Frontend wird pragmatisch mit Feature-Sliced Design organisiert
- Business-Logik wird nicht nur im UI gelöst
- Das MVP bleibt bewusst klein und verständlich
- Keine künstliche Komplexität

## Frontend-Layer

- `app` → globale App-Konfiguration
- `pages` → Seiteneinstiege
- `widgets` → größere zusammengesetzte UI-Blöcke
- `features` → Nutzeraktionen
- `entities` → fachliche Objekte
- `shared` → fachlich neutrale Bausteine

## Platzierungsregeln

Lege Code in:

- `shared/`, wenn er allgemein und fachlich neutral ist
- `entities/`, wenn er ein fachliches Objekt beschreibt
- `features/`, wenn er eine Nutzeraktion abbildet
- `widgets/`, wenn er mehrere Teile zu einem UI-Block kombiniert
- `pages/`, wenn er eine Seite zusammensetzt

## Wichtige Trennung

- `space` ist eine Entity
- `booking` ist eine Entity
- `create-booking` ist ein Feature
- `cancel-booking` ist ein Feature
- `check-availability` ist ein Feature

Nicht jede kleine Komponente ist ein Feature. Allgemeine UI-Bausteine gehören meist nach `shared`.

## Slice-Regel

Typischer Aufbau einer Slice:

- `ui/`
- `model/`
- `api/`
- `lib/`
- `index.ts`

Nur anlegen, wenn wirklich gebraucht.

## Import-Regeln

- `shared` kennt nur `shared`
- `entities` dürfen `shared` nutzen
- `features` dürfen `entities` und `shared` nutzen
- `widgets` dürfen `features`, `entities`, `shared` nutzen
- `pages` dürfen `widgets`, `features`, `entities`, `shared` nutzen
- `app` darf alles zusammensetzen

Nicht erlaubt:

- `entities` importieren aus `features`
- tiefe Direktimporte in andere Slices
- Business-Logik in `shared`

## Public API

Importe nur über `index.ts`.

### Gut

```ts
import { CreateBookingForm } from "@/features/booking/create-booking";
```

### Nicht gut

```ts
import { CreateBookingForm } from "@/features/booking/create-booking/ui/CreateBookingForm";
```

## Backend-Regeln

- `routes` → Routing
- `controllers` → Request/Response
- `services` → Business-Logik
- `db` → Queries/Persistenz
- `middleware` → Auth, Rollen, technische Checks

### Nicht in Controller

- Konfliktprüfung
- zentrale Fachregeln
- Rollenlogik als Business-Entscheidung
- fachliche Kernregeln

## Verbindliche Fachregeln im Backend

Diese Regeln gelten im Backend verbindlich:

- nur aktive Räume sind buchbar
- nur zukünftige Zeiträume sind buchbar
- `start_time < end_time`
- Buchungen müssen innerhalb der globalen Öffnungszeiten liegen (Mo-Fr 08:00-22:00)
- keine Überschneidung aktiver Buchungen im selben Raum
- Customers dürfen nur eigene Buchungen stornieren

## RoomFull-Kernbereiche

### Entities

- `user`
- `space`
- `booking`

### Features

- `auth/sign-in`
- `auth/sign-up`
- `space/check-availability`
- `booking/create-booking`
- `booking/cancel-booking`
- `admin/create-space`
- `admin/update-space`
- `admin/deactivate-space`

### Widgets

- `header`
- `spaces-list`
- `booking-panel`
- `my-bookings-list`
- `admin-spaces-table`
- `admin-bookings-table`

## Do

- fachlich klar benennen
- klein und verständlich strukturieren
- Business-Logik im Backend halten
- `shared` fachlich neutral halten
- über Public APIs importieren
- bei Änderungen die passende Doku mitprüfen

## Don't

- kein großer globaler `components/`-Ordner
- keine Business-Logik in `shared`
- keine Konfliktlogik nur im Frontend
- keine Vermischung von Entity und Feature
- keine tiefen Direktimporte

## Doku-Regel

Wenn du Architektur, Fachlogik, API, Dateiplatzierung oder Konventionen änderst, prüfe immer auch die passenden Dokumente.

Nutze zuerst:

- [Project Summary](summaries/project-summary.md)
- [Domain Summary](summaries/domain-summary.md)
- [FSD Summary](summaries/fsd-summary.md)
- [API Summary](summaries/api-summary.md)

Prüfe bei Bedarf zusätzlich die Detaildokumente:

- [Domain Rules](domain-rules.md)
- [API Overview](api-overview.md)
- [FSD Architecture](fsd-architecture.md)
- [Frontend Conventions](frontend-conventions.md)
- [Backend Conventions](backend-conventions.md)
- [Project Decisions](project-decisions.md)
