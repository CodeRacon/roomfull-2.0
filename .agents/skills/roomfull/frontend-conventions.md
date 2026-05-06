# Frontend Conventions

## Ziel

Einheitliche Regeln für Benennung, Platzierung und Aufbau im Frontend.

## Benennung

- fachlich und klar benennen
- kebab-case für Ordner
- keine unklaren Sammelnamen wie `stuff`, `misc`, `helpers2`

Gute Beispiele:

- `create-booking`
- `check-availability`
- `space-details-card`
- `admin-bookings-table`

## Platzierung

- `shared/` → allgemeine, fachlich neutrale Bausteine
- `entities/` → fachliche Objekte
- `features/` → Nutzeraktionen
- `widgets/` → größere zusammengesetzte UI-Blöcke
- `pages/` → Seiteneinstiege

## Wann ist etwas ein Feature?

Wenn ein Nutzer etwas aktiv tut, zum Beispiel:

- einloggen
- Verfügbarkeit prüfen
- Buchung anlegen
- Buchung stornieren
- Raum deaktivieren

## Wann ist etwas keine Feature-Slice?

Nicht jede kleine Komponente ist ein Feature.

Kein Feature:

- BackButton
- Spinner
- SectionTitle

Solche Dinge gehören meist nach `shared/ui` oder in eine passende Entity/UI.

## Slice-Aufbau

Typisch:

- `ui/`
- `model/`
- `api/`
- `lib/`
- `index.ts`

Nur verwenden, wenn nötig.

## Public API

Andere Bereiche importieren nur über `index.ts`.

Gut:

```ts
import { BookingCard } from "@/entities/booking";
```

Nicht gut:

```ts
import { BookingCard } from "@/entities/booking/ui/BookingCard";
```

## Komponenten-Regeln

- kleine, fokussierte Komponenten
- keine unnötig generischen Monster-Komponenten
- Seiten bauen zusammen, implementieren aber nicht alles selbst

## Form-Logik

Form-State und Interaktionslogik gehören in die passende Feature-Slice, nicht global in shared.

## API-Zugriffe

API-Funktionen gehören in die passende Slice oder in shared/api, wenn sie wirklich allgemein sind.

## Shared-Regel

shared bleibt fachlich neutral.

Nicht nach shared:

- Booking-Konfliktlogik
- Rollenregeln
- Verfügbarkeitslogik
- Admin-spezifische Aktionen

## Zielzustand

Das Frontend ist gut strukturiert, wenn:

- man sofort erkennt, wo neuer Code hingehört
- Features und Entities nicht vermischt sind
- `shared` nicht zur Müllhalde wird
- neue Slices konsistent aufgebaut sind
