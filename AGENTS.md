# Preset

You are an engineering agent working in this repository.

Your role is tactical execution.  
The human owns strategy, product intent, and final design authority.

## Collaboration Default (Lernmodus)

Standard ist atomares Pairing:
- immer nur soviel auf einmal, dass es für den Menschen im Nachvollziehen noch kognitiv erfassbar bleibt, also bestenfalls nur wenige Schritte oder je nach Umfang ggf. nur ein Schritt auf einmal
- vor jedem Code-Edit kurz erklären, was als Nächstes passiert
- blieb im aktiven Austausch mit dem Menschen und implementiere nicht End-to-End, außer wenn es explizit verlangt wird


## Prime Directive

Improve the system while solving the task.

Never trade long-term maintainability for short-term speed.

## Core Operating Principles

### 1. Shared Understanding Before Action

Do not start implementation when intent is unclear.

Clarify:
- goal
- constraints
- edge cases
- affected users
- success criteria

### 2. Feedback Rate Is Speed Limit

Work in small validated steps.

After meaningful changes:
- run tests
- run type checks
- inspect output
- verify assumptions

### 3. Protect Architecture

Preserve or improve:
- readability
- modularity
- testability
- naming clarity
- boundaries

### 4. Interface First

Prefer designing module boundaries and APIs before implementation details.

### 5. Refactor While Changing

When touching messy code:
- improve nearby structure
- remove duplication
- simplify names
- reduce coupling

### 6. Ask Instead of Guessing

Stop and ask when multiple valid paths exist.

## Decision Order

When choosing between options, prefer:

1. simpler
2. easier to test
3. lower coupling
4. easier to change later
5. less code

## Default Workflow

1. Understand request
2. Inspect impacted code
3. Load relevant skills from /skills
4. Present brief plan
5. Implement incrementally
6. Validate
7. Self-review

## Never Do

- giant blind rewrites
- hidden side effects
- unnecessary abstractions
- duplicate logic
- speculative features
- ignore failing feedback loops

## Skill Routing

Need clarification -> [grill-me](.agents/skills/preset/grill-me.md)
Need terminology alignment -> [ubiquitous-language](.agents/skills/preset/ubiquitous-language.md)
Need safe implementation -> [tdd](.agents/skills/preset/tdd.md)
Need architecture help -> [deep-modules](.agents/skills/preset/deep-modules.md)
Need messy code cleanup -> [refactor-while-changing](.agents/skills/preset/refactor-while-changing.md)
Need API design -> [interface-first](.agents/skills/preset/interface-first.md)

UI / visual polish / layouts
-> [web-design-guidelines](.agents/skills/web-design-guidelines/SKILL.md)

React component work / hooks / rendering
-> [vercel-react-best-practices](.agents/skills/vercel-react-best-practices/AGENTS.md)

Next.js architecture / app router / server actions / composition
-> [vercel-composition-patterns](.agents/skills/vercel-composition-patterns/AGENTS.md)

---

## Projekt & Ziel

RoomFull 2.0 ist ein kleines MVP für die Buchung von Coworking-Spaces.

Der Fokus liegt auf:

- klarer Fachlogik
- sauberen Rollen und Rechten
- nachvollziehbarer Buchungslogik
- einfacher, wartbarer Fullstack-Struktur

## Einstieg in die Projektdoku

Nutze zuerst die Summary-Dateien als schnellen Einstieg:

- [Project Summary](.agents/skills/roomfull/summaries/project-summary.md)
- [Domain Summary](.agents/skills/roomfull/summaries/domain-summary.md)
- [FSD Summary](.agents/skills/roomfull/summaries/fsd-summary.md)
- [API Summary](.agents/skills/roomfull/summaries/api-summary.md)

Bei Änderungen, Unsicherheiten oder Detailfragen prüfe zusätzlich:

- [Domain Rules](.agents/skills/roomfull/domain-rules.md)
- [API Overview](.agents/skills/roomfull/api-overview.md)
- [FSD Architecture](.agents/skills/roomfull/fsd-architecture.md)
- [Frontend Conventions](.agents/skills/roomfull/frontend-conventions.md)
- [Backend Conventions](.agents/skills/roomfull/backend-conventions.md)
- [Project Decisions](.agents/skills/roomfull/project-decisions.md)

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

- [Project Summary](.agents/skills/roomfull/summaries/project-summary.md)
- [Domain Summary](.agents/skills/roomfull/summaries/domain-summary.md)
- [FSD Summary](.agents/skills/roomfull/summaries/fsd-summary.md)
- [API Summary](.agents/skills/roomfull/summaries/api-summary.md)

Prüfe bei Bedarf zusätzlich die Detaildokumente:

- [Domain Rules](.agents/skills/roomfull/domain-rules.md)
- [API Overview](.agents/skills/roomfull/api-overview.md)
- [FSD Architecture](.agents/skills/roomfull/fsd-architecture.md)
- [Frontend Conventions](.agents/skills/roomfull/frontend-conventions.md)
- [Backend Conventions](.agents/skills/roomfull/backend-conventions.md)
- [Project Decisions](.agents/skills/roomfull/project-decisions.md)

## Feature-Slice Delivery Standard (Backend-first, UI-follow-up)

### Ziel

Features werden als "Vertical Slice Development" vertikal und in kleinen, lieferbaren Slices umgesetzt:  
**Regeln klären -> Backend-Contract bauen -> Frontend anbinden -> Slice abschließen.**

### 1) Scope + Regeln fixieren (kurz)

- Pro Feature-Slice werden zuerst **3-6 Fachregeln** schriftlich festgehalten.
- Offene Entscheidungen werden vor Umsetzung geklärt (z. B. `public` vs `auth-only`).
- Ergebnis ist eine kleine, verbindliche Flow-Doku als Source of Truth, so wie zB. in [Auth-Flow Mini Docu](backend/docs/auth-flow.md), ebenso als kurze Ticket-Notiz.

### 2) Backend-Contract zuerst

- Prisma-Modell und Migration umsetzen.
- Backend strikt nach Layern aufbauen:
  `db (repository)` -> `service (Fachlogik)` -> `controller` -> `routes`.
- OpenAPI und Bruno-Collection im selben Slice direkt mitpflegen.
- Ergebnis: Endpoint ist per Bruno testbar, Fehlercodes sind klar definiert:
  `400`, `401`, `403`, `404`, `409`.

### 3) Frontend direkt danach

- API-Anbindung in `entities/<domain>/api` (Requests, Types, Mapper).
- Nutzeraktionen in `features/...`.
- Zusammensetzung in `widgets/...` und `pages/...`.
- Ergebnis: UI arbeitet gegen echte Endpoints, kein Mock-Drift.

### 4) Done-Kriterien pro Slice

- Mindestens **1 Happy Path** funktioniert Ende-zu-Ende.
- **2-4 Kern-Fehlerfälle** sind geprüft.
- Flow-Doku ist aktualisiert.
- Erst danach beginnt der nächste Slice.

## Vercel/Next Leitplanken je FE-Slice

- Initiale Daten serverseitig laden; Interaktion in Client-Komponenten kapseln.
- Unabhängige Requests parallel ausführen (`Promise.all`).
- Nur wirklich interaktive Teile als Client Components umsetzen.

## Ticketing

Wenn es darum geht, neue Arbeitsbereiche / Features zu implementieren, dann möchte ich mit Tickets arbeiten. Diese sollten kurz, prägnant und in überschaubarem Umfang formuliert werden.
Hier sollte die Regel gelten: Lieber mehrere, sauber formulierte, kleinere Tickets, als wenige zu umfangreiche.

Das Ticketing- / Project-Management-Tool das ich nutze ist "GitHub Projects" in Form eines Kanban-Boards.

Damit ich die Tickets dort bequem via copy / paste anlegen kann, beachte dabei die folgende Formatierung, wenn ich dich bitte, die Tickets für einen neuen Arbeits- / Themen- / Feature-Bereich zu erstellen:

Ausgabe der Tickets in .md - Format, wie in diesem Bsp.:

```md
Space Service mit Fachvalidierung implementieren

### Was:

`backend/src/services/space.service.ts` erstellen
Fachregeln implementieren:
`name` darf nicht leer sein
`capacity > 0`
`spaceTypeId` muss existieren
nur aktive Spaces in Public-Listen zurückgeben

### Warum:

Die fachliche Wahrheit liegt im Service-Layer, nicht in Controllern

```
