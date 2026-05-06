# FSD Architecture

## Ziel

RoomFull nutzt im Frontend ein pragmatisches Feature-Sliced Design.

Die Struktur soll fachliche Verantwortung sichtbar machen und UI, Aktionen und Domänenobjekte sauber trennen.

## Verwendete Layer

- `app`
- `pages`
- `widgets`
- `features`
- `entities`
- `shared`

## Bedeutung der Layer

### `app`

Globale App-Konfiguration.

Beispiele:

- Provider
- Styles
- Layout
- App-Setup

### `pages`

Seiteneinstiege.

Beispiele:

- login
- register
- spaces
- space-details
- my-bookings
- admin-spaces
- admin-bookings

### `widgets`

Größere zusammengesetzte UI-Blöcke.

Beispiele:

- header
- spaces-list
- booking-panel
- my-bookings-list
- admin-spaces-table
- admin-bookings-table

### `features`

Nutzeraktionen.

Beispiele:

- `auth/sign-in`
- `auth/sign-up`
- `space/check-availability`
- `booking/create-booking`
- `booking/cancel-booking`
- `admin/create-space`
- `admin/update-space`
- `admin/deactivate-space`

### `entities`

Fachliche Objekte.

Beispiele:

- `user`
- `space`
- `booking`

### `shared`

Fachlich neutrale Bausteine.

Beispiele:

- Button
- Input
- Modal
- API-Client
- Formatter
- allgemeine Helpers

## Wichtige Trennung

- `space` ist eine Entity
- `booking` ist eine Entity
- `create-booking` ist ein Feature
- `cancel-booking` ist ein Feature
- `check-availability` ist ein Feature

## Typische Slice-Struktur

Jede Slice kann enthalten:

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

Jede Slice wird über `index.ts` exportiert.

Gut:

```ts
import { CreateBookingForm } from "@/features/booking/create-booking";
```

Nicht gut:

```ts
import { CreateBookingForm } from "@/features/booking/create-booking/ui/CreateBookingForm";
```

## Zielzustand

Die Struktur ist gut, wenn:

- fachliche Bereiche direkt erkennbar sind
- Entities und Features sauber getrennt sind
- Pages und Widgets nicht zu viel Business-Logik enthalten
- neue Features ohne Chaos ergänzt werden können
