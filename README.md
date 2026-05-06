# RoomFull 2.0

RoomFull 2.0 ist ein kleines MVP zur Buchung von Coworking-Units.

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
- aktive Units sehen
- Unit-Details sehen
- Verfügbarkeit prüfen
- Buchung anlegen
- eigene Buchungen sehen
- eigene Buchungen stornieren

### Admin

- Units anlegen
- Units bearbeiten
- Units deaktivieren
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
- `unit`
- `start_time`
- `end_time`

Wichtige Regeln:

- nur aktive Units sind buchbar
- nur zukünftige Zeiträume sind buchbar
- `start_time < end_time`
- Buchungen müssen innerhalb der globalen Öffnungszeiten liegen (Mo-Fr 08:00-22:00)
- keine Überschneidung aktiver Buchungen auf derselben Unit
- Customers dürfen nur eigene Buchungen stornieren

## Raumtypen

- Hot Desk
- Booth
- Team Room

## Öffnungszeiten-Entscheidung

- Source of Truth sind globale Öffnungszeiten für das gesamte Angebot
- Für Version 1: Montag bis Freitag, 08:00 bis 22:00
- Öffnungszeiten werden nicht pro Area oder UnitType gepflegt
- Buchungs- und Verfügbarkeitslogik nutzt diese globalen Öffnungszeiten

## Tech Stack

- Frontend: Next.js + TypeScript
- Backend: Express + TypeScript
- Datenbank: PostgreSQL

## Lokales Setup Backend + PostgreSQL

### 1) PostgreSQL installieren und starten (macOS + Homebrew)

```bash
brew install postgresql@17
brew services start postgresql@17
```

Prüfen, ob Postgres läuft:

```bash
pg_isready
```

### 2) Datenbank `roomfull` anlegen

```bash
createdb roomfull
psql -l | rg roomfull
```

Falls `createdb` meldet, dass die DB schon existiert, ist das in Ordnung.

### 3) Backend-Umgebung einrichten

```bash
cp backend/.env.example backend/.env
```

Wichtig: In `backend/.env` muss `DATABASE_URL` zu deinem lokalen DB-User passen.

Beispiel:

```env
DATABASE_URL=postgresql://michaelbuschmann@localhost:5432/roomfull?schema=public
```

### 4) Bestehende Prisma-Migrationen anwenden

```bash
cd backend
npm run prisma:migrate:deploy
```

### Prisma-Migrationen: `dev` vs `deploy`

Für lokale Feature-Entwicklung und Schema-Änderungen ist der Unterschied wichtig:

- `npm run prisma:migrate:dev`
  - erstellt aus `prisma/schema.prisma` eine **neue Migration**
  - legt sie in `prisma/migrations/...` ab
  - wendet sie lokal direkt an
  - Verwendung: **wenn du am Datenmodell arbeitest**

- `npm run prisma:migrate:deploy`
  - erstellt **keine** neue Migration
  - spielt nur bereits vorhandene Migrationen aus `prisma/migrations/...` ein
  - Verwendung: **Setup/CI/Staging/Production**

### Prisma Studio (DB-Inhalte visuell prüfen)

Prisma Studio zeigt dir Tabelleninhalte in einer UI und ist ideal für schnelle Checks nach Migration/Seed.

```bash
cd backend
npx prisma studio
```

Beispiel-Check nach dem UnitType-Seed:
- Tabelle `UnitType` öffnen
- prüfen, dass genau diese Einträge vorhanden sind:
  - `Hot Desk`
  - `Booth`
  - `Team Room`

### 5) Backend starten

Standard Dev-Mode:

```bash
npm run dev
```

Dev-Mode mit Auto-Restart bei `src/*.ts` und `prisma/schema.prisma`:

```bash
npm run dev:hot
```

## API-Dokumentation mit OpenAPI und Swagger

Die API ist über OpenAPI dokumentiert und per Swagger UI direkt testbar.

- OpenAPI-Spezifikation: `backend/openapi.json`
- Swagger UI im laufenden Backend: `http://localhost:4000/docs`

Bei Endpoint-Änderungen immer Code und OpenAPI gemeinsam aktualisieren.


### Lokale Nutzung

1. Backend starten:
   ```bash
   cd backend
   npm run dev
   ```
2. Swagger öffnen:
   - `http://localhost:4000/docs`

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
- `unit`
- `booking`

Features:

- `auth/sign-in`
- `auth/sign-up`
- `unit/check-availability`
- `booking/create-booking`
- `booking/cancel-booking`
- `admin/create-unit`
- `admin/update-unit`
- `admin/deactivate-unit`

## Dokumentation

- `docs/domain-rules.md` → Fachregeln
- `docs/api-overview.md` → API-Überblick
- `docs/fsd-architecture.md` → Frontend-Architektur
- `docs/frontend-conventions.md` → Frontend-Regeln
- `docs/backend-conventions.md` → Backend-Regeln
- `docs/project-decisions.md` → bewusste Entscheidungen
