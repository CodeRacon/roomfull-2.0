---
name: roomfull
description: Fuer Arbeiten am RoomFull-Web-/Backend-Repo verwenden, insbesondere bei Domaene, API, Rollen, Booking-Regeln, Feature-Sliced Design, Backend-Layern und Projektdokumentation. Nicht fuer den separaten React-Native-Client verwenden; dort gilt der roomfull-mobile Skill.
---

# RoomFull Web und Backend

## Ziel

RoomFull ist ein fokussiertes Coworking-MVP mit Customer Self-Service und getrennten Admin-Arbeitsbereichen. Das System soll fachliche Regeln, Rollen, API-Contracts und Fullstack-Grenzen nachvollziehbar umsetzen, ohne unnoetige Plattformkomplexitaet.

## Quellenhierarchie

Vor substanzieller Arbeit:

1. `CONTEXT.md` fuer aktuelle Domaenensprache, Beziehungen und aufgeloeste Mehrdeutigkeiten lesen.
2. Die passenden Kurzreferenzen unter `summaries/` lesen.
3. Bei Detailfragen die verlinkten Skill-Referenzen und Flow-Dokumente unter `backend/docs/` pruefen.
4. Aussagen ueber vorhandene Endpunkte oder UI immer gegen aktuellen Code und `backend/openapi.json` verifizieren.

Kurzreferenzen:

- [Project Summary](summaries/project-summary.md)
- [Domain Summary](summaries/domain-summary.md)
- [FSD Summary](summaries/fsd-summary.md)
- [API Summary](summaries/api-summary.md)

Details:

- [Domain Rules](domain-rules.md)
- [API Overview](api-overview.md)
- [FSD Architecture](fsd-architecture.md)
- [Frontend Conventions](frontend-conventions.md)
- [Backend Conventions](backend-conventions.md)
- [Project Decisions](project-decisions.md)

Bei Widerspruch gilt der aktuelle implementierte Contract vor einer aelteren Zusammenfassung. Die widerspruechliche Dokumentation im selben Slice korrigieren.

## Aktueller Stack

- Web: Next.js App Router, React und TypeScript
- Backend: Express und TypeScript
- Datenbank: PostgreSQL mit Prisma
- Formatierung/Linting: Biome
- Tests: Vitest im Web, Node Test Runner im Backend

Vor Versionsbehauptungen immer die aktuellen `package.json`-Dateien pruefen.

## Domaenensprache

- `BookingOption`: Customer-facing Angebot und Einstieg in den Booking Flow
- `UnitType`: Kategorie mit Dauerregeln
- `Area`: Gruppierung konkreter BookableUnits
- `BookableUnit`: konkret buchbare Einheit; API-Kurzsprache `Unit`
- `Booking`: Reservierung genau einer BookableUnit fuer einen Zeitraum
- `Team`: private Kontaktgruppe eines Customers
- `TeamMember`: Kontakt innerhalb genau eines Teams, kein RoomFull-User
- `ContactRequest`: Customer-Anfrage ohne E-Mail-Versand

Nicht zurueck zu `space`, `spaceType`, `spaceId` oder `/spaces` wechseln.

## Frontend-Grenzen

Der aktuelle Web-Client nutzt pragmatisches Feature-Sliced Design:

- `src/app`: Next-Routen, Layouts und Seiteneinstiege; komponiert niedrigere Layer
- `src/widgets`: groessere UI-Kompositionen
- `src/features`: Nutzeraktionen und Use Cases
- `src/entities`: fachliche Typen, API und entity-nahe Helfer
- `src/shared`: fachlich neutrale UI, API-Basis, i18n, Routing und Utilities

Es gibt keinen separaten `src/pages`-Layer. Next-`page.tsx`-Dateien bleiben duenne Route-Kompositionen.

Import-Richtung:

- `shared` kennt nur `shared`
- `entities` nutzt `shared`
- `features` nutzt `entities` und `shared`
- `widgets` nutzt `features`, `entities` und `shared`
- `app` komponiert alle darunterliegenden Layer

Andere Slices nur ueber ihre `index.ts`-Public-API importieren. Fachlogik nicht in `shared` oder Route-Dateien verschieben.

## Backend-Grenzen

Der aktuelle Backend-Fluss ist:

```txt
routes -> controllers -> services -> db/*repository -> Prisma
```

- Routes verdrahten Endpoint und Middleware.
- Controller uebersetzen HTTP und bleiben duenn.
- Services besitzen Fachlogik und Use-Case-Orchestrierung.
- Repository-Module unter `backend/src/db` kapseln Persistenz und Queries.
- Middleware behandelt Auth, Rollen und technische Vorbedingungen.

OpenAPI und passende Bruno-/Flow-Dokumentation im selben Contract-Slice aktualisieren. Keine fachliche Wahrheit nur im Controller, Frontend oder in Prisma-Queries verstecken.

## Verbindliche Booking-Regeln

Das Backend erzwingt mindestens:

- genau einen Request-Modus: `DIRECT` mit `unitId` oder `AUTO_ASSIGN` mit `areaId + unitType=HOT_DESK`
- nur aktive BookableUnits und zukuenftige Zeitraeume
- Start und Ende am selben Berliner Kalendertag mit `start < end`
- Montag bis Freitag innerhalb `08:00-22:00`
- Start und Ende auf dem globalen 15-Minuten-Raster
- Dauer entsprechend der UnitType-Policy
- keine Ueberschneidung aktiver Bookings derselben BookableUnit
- race-sicheres Hot-Desk-Auto-Assign
- Customers sehen und stornieren nur eigene erlaubte Bookings

Availability ist eine Vorschau; der Create-Request bleibt die finale Verfuegbarkeitspruefung.

## Aktuelle Kern-Slices

Entities:

- `analytics`, `booking`, `booking-option`, `contact-request`
- `session`, `team`, `unit`, `user`

Features:

- Auth: `demo-login`, `require-auth`, `sign-in`, `sign-up`
- Booking: `create-booking`, `cancel-booking`, `export-booking-calendar`, `share-booking-with-team`
- Team: `create-team`, `edit-team-settings`, `manage-team-members`
- Contact, Sprache und Admin Unit Management

Widgets:

- Customer: Header, Booking Options, Units und My Bookings
- Admin: Navigation, Analytics, Bookings, Contact Inbox und Units

Vor dem Anlegen einer neuen Slice zuerst die aktuelle Verzeichnisstruktur und bestehende Public APIs pruefen.

## Web-/Mobile-Grenze

RoomFull Mobile ist ein separater nativer Client. Domaene und bestehende Fachendpunkte bleiben upstream in diesem Repo; mobile UX- und Client-Architekturentscheidungen gehoeren ins Mobile-Repo.

Die dokumentierten `/auth/mobile/*`-Endpunkte und Bearer-Unterstuetzung sind ein beschlossener Mobile-Contract, aber am Sync-Stand 2026-09-01 noch nicht implementiert. Vor Mobile-Anbindung Routes, Auth-Middleware und OpenAPI erneut pruefen; einen geplanten Contract nie als vorhandenen Endpoint behandeln.

## Delivery

Bei Domain-, API- oder Architekturarbeit in kleinen vertikalen Slices vorgehen:

1. Fachregeln und Scope klaeren.
2. Schema und Backend-Contract umsetzen.
3. OpenAPI, Tests und Flow-Dokumentation aktualisieren.
4. Web-Client an den echten Contract anbinden.
5. Relevante Fehlerfaelle und mindestens einen Happy Path pruefen.

Nach Aenderungen passende Checks aus den aktuellen Package Scripts ausfuehren. Nicht ausgefuehrte Geraete-, Deployment- oder E2E-Pruefungen transparent benennen.

## Dokumentation

Architektur, Domaene, API oder Konventionen nicht nur im Code aendern. Mindestens `CONTEXT.md`, die passende Summary, Detailreferenz, Flow-Dokumentation und gegebenenfalls ADR/PRD auf Drift pruefen.
