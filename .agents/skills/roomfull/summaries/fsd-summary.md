# FSD Summary

## Ziel

Das Frontend nutzt ein pragmatisches Feature-Sliced Design, damit fachliche Verantwortung sichtbar bleibt und UI, Nutzeraktionen und Domänenobjekte sauber getrennt sind.

## Layer

Verwendete Layer:

- `app`
- `pages`
- `widgets`
- `features`
- `entities`
- `shared`

## Bedeutung der Layer

- `app` enthält globale App-Konfiguration
- `pages` sind Seiteneinstiege
- `widgets` sind größere zusammengesetzte UI-Blöcke
- `features` bilden Nutzeraktionen ab
- `entities` repräsentieren fachliche Objekte
- `shared` enthält fachlich neutrale Bausteine

## Zentrale Trennung

Wichtig ist die saubere Unterscheidung zwischen Fachobjekt und Aktion:

- `unit` ist eine Entity
- `booking` ist eine Entity
- `create-booking` ist ein Feature
- `cancel-booking` ist ein Feature
- `check-unit-availability` ist ein Feature

Nicht jede kleine Komponente ist eine Feature-Slice. Allgemeine UI-Bausteine gehören nach `shared`.

## Import-Regeln

- `shared` kennt nur `shared`
- `entities` dürfen `shared` nutzen
- `features` dürfen `entities` und `shared` nutzen
- `widgets` dürfen `features`, `entities`, `shared` nutzen
- `pages` dürfen `widgets`, `features`, `entities`, `shared` nutzen
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
