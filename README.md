# RoomFull 2.0

RoomFull 2.0 ist ein kleines MVP zur Buchung von Coworking-Units.

Ziel ist nicht maximaler Feature-Umfang, sondern eine saubere Umsetzung von:

- Rollen und Rechten
- Verfügbarkeiten
- Buchungen
- Konfliktprüfung
- klarer Fullstack-Struktur

## V1-Stand

Der V1-MVP-Stand ist fachlich erreicht.

Enthalten sind:

- Customer Self-Service für BookingOptions, Verfügbarkeit, Buchung und eigenes Storno
- Admin Dashboard mit Buchungsbetrieb und Unit-Inventar
- Admin-Verwaltung von BookableUnits inklusive Anlegen, Bearbeiten, Deaktivieren und Reaktivieren
- Backend-seitige Fachregeln für Buchbarkeit, Dauer, Öffnungszeiten, Konflikte und Rollenrechte

Bewusst nicht Teil von V1:

- Admin-Bearbeitung von UnitTypes oder deren Dauerregeln
- Admin-Fremd-Storno
- separater Admin-Einstieg für "Buchungsflow prüfen"
- automatisierte breite E2E-/Integrationstest-Abdeckung; V1 wird manuell und visuell geprüft

## MVP-Funktionen

### Customer

- registrieren
- einloggen
- BookingOptions als Einstieg in den Buchungsflow sehen
- aktive Units für konkrete Auswahl und Details sehen
- Verfügbarkeit prüfen
- Buchung anlegen
- eigene Buchungen sehen
- eigene zukünftige Buchungen stornieren

### Admin

- eigenes Admin-Dashboard nutzen
- Units anlegen
- Units bearbeiten
- Units deaktivieren
- Units reaktivieren
- alle Buchungen im Buchungsbetrieb sehen
- ebenfalls operative Buchungen über den normalen Customer-Flow anlegen

Wenn Admins Buchbarkeit prüfen oder testweise buchen wollen, nutzen sie bewusst den normalen Customer-Flow über `/booking-options`. Es gibt in V1 keinen separaten Admin-Einstieg für "Buchungsflow prüfen".

Nicht Teil des Admin-MVP:

- UnitTypes oder deren Dauerregeln im Admin-UI bearbeiten
- fremde Buchungen stornieren

## Nicht Teil von Version 1

- Payments
- E-Mail-Benachrichtigungen
- Kalender-Sync
- Echtzeit-Updates
- Wartelisten
- komplexe Preislogik
- mehrere Standorte
- AI-Funktionen

Geplante Themen stehen ausschliesslich in der [Roadmap](ROADMAP.md).

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
- Meeting Room

## Öffnungszeiten-Entscheidung

- Source of Truth sind globale Öffnungszeiten für das gesamte Angebot
- Für Version 1: Montag bis Freitag, 08:00 bis 22:00
- Öffnungszeiten werden nicht pro Area oder UnitType gepflegt
- Buchungs- und Verfügbarkeitslogik nutzt diese globalen Öffnungszeiten

## Tech Stack

- Runtime: Node.js 24 LTS, im Projekt über `.nvmrc` gepinnt
- Frontend: Next.js 16.2.9 + TypeScript + Tailwind CSS
- UI-Helfer: `clsx` für bedingte Klassen und Varianten
- Backend: Express + TypeScript
- Datenbank: PostgreSQL

## Lokale Voraussetzungen

- Node.js 24 LTS
- npm
- PostgreSQL 17

Wenn `nvm` installiert ist, nutzt das Projekt die Version aus `.nvmrc`:

```bash
nvm use
```

Prüfen:

```bash
node -v
npm -v
```

Erwartet wird Node `24.17.0` oder eine kompatible Node-24-LTS-Version.

## Lokales Setup Frontend

Dependencies im Projekt-Root installieren:

```bash
npm install
```

Frontend starten:

```bash
npm run dev
```

Der Next.js-Dev-Server läuft danach standardmäßig unter:

- `http://localhost:3000`

Next.js nutzt in diesem Projekt im Dev-Mode Turbopack. Der persistente
Turbopack-Dateisystemcache für den Dev-Server ist in `next.config.ts` bewusst
deaktiviert, da er lokal reproduzierbar zu stark wachsender CPU- und
Speicherauslastung führte. Turbopacks In-Memory-Cache bleibt dabei aktiv.

Wenn Navigation oder Kompilierung im lokalen Dev-Server auffällig langsam
wird, zuerst prüfen:

```bash
node -v
npm run lint
```

Bei Cache-Problemen kann der generierte Next-Cache neu aufgebaut werden:

```bash
rm -rf .next
npm run dev
```

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
cd backend
npm install
cp .env.example .env
```

Wichtig: In `backend/.env` muss `DATABASE_URL` zu deinem lokalen DB-User passen.
Auf einer Homebrew-PostgreSQL-Installation ist das häufig dein macOS-Username.

Beispiel:

```env
DATABASE_URL=postgresql://meikl@localhost:5432/roomfull?schema=public
```

Allgemein:

```env
DATABASE_URL=postgresql://DEIN_LOKALER_DB_USER@localhost:5432/roomfull?schema=public
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
  - `Meeting Room`

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
  README.md

  .agents/skills/roomfull/
    summaries/
      project-summary.md
      domain-summary.md
      fsd-summary.md
      api-summary.md
    domain-rules.md
    api-overview.md
    fsd-architecture.md
    frontend-conventions.md
    backend-conventions.md
    project-decisions.md

  backend/
    prisma/
    src/
      routes/
      controllers/
      services/
      db/
      middleware/

  src/
    app/
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
- `booking/create-booking`
- `booking/cancel-booking`
- `booking/export-booking-calendar`
- `admin/manage-unit`

## Dokumentation

- `.agents/skills/roomfull/summaries/project-summary.md` → Projektüberblick
- `.agents/skills/roomfull/summaries/domain-summary.md` → Domain-Kurzüberblick
- `.agents/skills/roomfull/summaries/fsd-summary.md` → Frontend-Architektur-Kurzüberblick
- `.agents/skills/roomfull/summaries/api-summary.md` → API-Kurzüberblick
- `.agents/skills/roomfull/domain-rules.md` → Fachregeln
- `.agents/skills/roomfull/api-overview.md` → API-Überblick
- `.agents/skills/roomfull/fsd-architecture.md` → Frontend-Architektur
- `.agents/skills/roomfull/frontend-conventions.md` → Frontend-Regeln
- `.agents/skills/roomfull/backend-conventions.md` → Backend-Regeln
- `.agents/skills/roomfull/project-decisions.md` → bewusste Entscheidungen
