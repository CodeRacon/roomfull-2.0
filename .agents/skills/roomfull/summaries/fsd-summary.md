# FSD Summary

## Ziel

Das Frontend nutzt ein pragmatisches Feature-Sliced Design, damit fachliche Verantwortung sichtbar bleibt und UI, Nutzeraktionen und Domänenobjekte sauber getrennt sind.

## Layer

Verwendete Layer:

- `app`
- `widgets`
- `features`
- `entities`
- `shared`

## Bedeutung der Layer

- `app` enthält Next-Routen, Layouts, globale Konfiguration und dünne Seiteneinstiege
- `widgets` sind größere zusammengesetzte UI-Blöcke
- `features` bilden Nutzeraktionen ab
- `entities` repräsentieren fachliche Objekte
- `shared` enthält fachlich neutrale Bausteine

## Zentrale Trennung

Wichtig ist die saubere Unterscheidung zwischen Fachobjekt und Aktion:

- `unit` ist eine Entity
- `booking-option` ist eine Entity für den Customer-facing Einstieg in den Buchungsflow
- `booking` ist eine Entity
- `team` und `contact-request` sind Entities
- `create-booking` ist ein Feature
- `cancel-booking` ist ein Feature
- `share-booking-with-team` und Team-Verwaltung sind Features
- `check-unit-availability` ist ein Feature

`booking-option` ist nicht dasselbe wie `unit`: Eine BookingOption beschreibt ein öffentliches Angebot wie `HOT_DESK`, `BOOTH`, `TEAM_ROOM` oder `MEETING_ROOM`; gebucht wird am Ende trotzdem eine konkrete Unit.

Nicht jede kleine Komponente ist eine Feature-Slice. Allgemeine UI-Bausteine gehören nach `shared`.

## Import-Regeln

- `shared` kennt nur `shared`
- `entities` dürfen `shared` nutzen
- `features` dürfen `entities` und `shared` nutzen
- `widgets` dürfen `features`, `entities`, `shared` nutzen
- `app` setzt alles zusammen

Nicht erlaubt sind:

- Imports von `entities` aus `features`
- tiefe Direktimporte in andere Slices
- Business-Logik in `shared`

## Public API

Jede Slice wird über `index.ts` exportiert. Andere Bereiche importieren nur über diese öffentliche API, nicht über tiefe interne Pfade.

## Leitregeln

- klare fachliche Benennung
- kleine, fokussierte Komponenten
- keine God-Components
- Form- und Interaktionslogik in die passende Feature-Slice
- fachliche Regeln nicht in `shared` auslagern
- Frontend baut auf stabiler Domain- und API-Logik auf, nicht umgekehrt

## Zielzustand

Die Struktur ist gut, wenn sofort erkennbar ist, wo neuer Code hingehört, Entities und Features nicht vermischt werden und `shared` fachlich neutral bleibt.
