# RoomFull 2.0

RoomFull 2.0 ist ein kleines MVP zur Buchung von Coworking-Spaces.

Ziel ist nicht maximaler Feature-Umfang, sondern eine saubere Umsetzung von:

- Rollen und Rechten
- Verfügbarkeiten
- Buchungen
- Konfliktprüfung
- klarer Fullstack-Struktur

## MVP-Funktionen

### Customer

- registrieren
- einloggen
- aktive Räume sehen
- Raumdetails sehen
- Verfügbarkeit prüfen
- Buchung anlegen
- eigene Buchungen sehen
- eigene Buchungen stornieren

### Admin

- Räume anlegen
- Räume bearbeiten
- Räume deaktivieren
- alle Buchungen sehen
- Buchungen verwalten

## Nicht Teil von Version 1

- Payments
- E-Mail-Benachrichtigungen
- Kalender-Sync
- Echtzeit-Updates
- Wartelisten
- komplexe Preislogik
- mehrere Standorte
- AI-Funktionen

## Fachlicher Kern

Eine Buchung verbindet:

- `user`
- `space`
- `start_time`
- `end_time`

Wichtige Regeln:

- nur aktive Räume sind buchbar
- nur zukünftige Zeiträume sind buchbar
- `start_time < end_time`
- Buchungen müssen innerhalb der Öffnungszeiten liegen
- keine Überschneidung aktiver Buchungen im selben Raum
- Customers dürfen nur eigene Buchungen stornieren

## Raumtypen

- Hot Desk
- Booth
- Team Room

## Tech Stack

- Frontend: Next.js + TypeScript
- Backend: Express + TypeScript
- Datenbank: PostgreSQL

## Projektstruktur

```txt
/
  SKILL.md
  README.md

  docs/
    domain-rules.md
    api-overview.md
    fsd-architecture.md
    frontend-conventions.md
    backend-conventions.md
    project-decisions.md

  src/
    app/
    pages/
    widgets/
    features/
    entities/
    shared/
```

## Architektur

- Backend ist die fachliche Wahrheit
- Frontend nutzt pragmatisches Feature-Sliced Design
- Business-Logik gehört nicht nur ins UI
- Entities und Features werden sauber getrennt

## Wichtige Bereiche

Entities:

- `user`
- `space`
- `booking`

Features:

- `auth/sign-in`
- `auth/sign-up`
- `space/check-availability`
- `booking/create-booking`
- `booking/cancel-booking`
- `admin/create-space`
- `admin/update-space`
- `admin/deactivate-space`

## Dokumentation

- `docs/domain-rules.md` → Fachregeln
- `docs/api-overview.md` → API-Überblick
- `docs/fsd-architecture.md` → Frontend-Architektur
- `docs/frontend-conventions.md` → Frontend-Regeln
- `docs/backend-conventions.md` → Backend-Regeln
- `docs/project-decisions.md` → bewusste Entscheidungen
