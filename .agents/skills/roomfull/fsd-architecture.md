# FSD Architecture

## Ziel

RoomFull nutzt im Web-Frontend ein pragmatisches Feature-Sliced Design. Verantwortung soll an Dateiplatzierung und Import-Richtung erkennbar bleiben, ohne fuer kleine Bausteine kuenstliche Slices anzulegen.

## Verwendete Layer

- `app`
- `widgets`
- `features`
- `entities`
- `shared`

Der aktuelle Next-App-Router besitzt keinen separaten `src/pages`-Layer. `src/app/[lang]/**/page.tsx` bildet die Route-Grenze und bleibt eine duenne Komposition.

## Bedeutung der Layer

### `app`

- Next-Routen, Layouts und globale Styles
- Provider- und Metadaten-Komposition
- darf niedrigere Layer zusammensetzen
- keine wiederverwendbare Fachlogik in `page.tsx`

### `widgets`

Groessere UI-Kompositionen, zum Beispiel:

- `header`
- `booking-options-list`
- `units-list`
- `my-bookings-list`
- `admin-analytics-dashboard`
- `admin-bookings-table`
- `admin-contact-inbox`
- `admin-units-table`

### `features`

Nutzeraktionen und Use Cases, zum Beispiel:

- `auth/sign-in`, `auth/sign-up`, `auth/demo-login`, `auth/require-auth`
- `booking/create-booking`, `booking/cancel-booking`
- `booking/export-booking-calendar`, `booking/share-booking-with-team`
- `team/create-team`, `team/edit-team-settings`, `team/manage-team-members`
- `contact/create-contact-request`
- `language/switch-language`
- `admin/manage-unit`

### `entities`

Fachliche Typen, API-Zugriffe und entity-nahe Helfer:

- `analytics`
- `booking`
- `booking-option`
- `contact-request`
- `session`
- `team`
- `unit`
- `user`

`BookingOption` und `BookableUnit`/API-`Unit` bleiben getrennt: Die Option fuehrt in den Flow, gebucht wird eine konkrete Unit.

### `shared`

Fachlich neutrale Bausteine:

- UI-Primitives
- API-Basis und technische Request-Helfer
- i18n-Infrastruktur und Dictionaries
- locale-aware Routing
- allgemeine Formatter und Utilities

Keine Booking-, Rollen-, Team- oder Admin-Fachlogik nach `shared` verschieben.

## Typische Slice-Struktur

Nur benoetigte Segmente anlegen:

- `api/`
- `model/`
- `ui/`
- `lib/`
- `index.ts`

## Import-Regeln

- `shared` kennt nur `shared`
- `entities` duerfen `shared` nutzen
- `features` duerfen `entities` und `shared` nutzen
- `widgets` duerfen `features`, `entities` und `shared` nutzen
- `app` darf alle darunterliegenden Layer komponieren

Nicht erlaubt:

- Rueckimporte aus hoeheren Layern
- tiefe Direktimporte in andere Slices
- zirkulaere Slice-Abhaengigkeiten
- Business-Logik in Route-Dateien oder `shared`

## Public API

Andere Slices importieren ueber `index.ts`:

```ts
import { CreateBookingForm } from "@/features/booking/create-booking";
```

Keine tiefen Fremdimporte:

```ts
import { CreateBookingForm } from "@/features/booking/create-booking/ui/CreateBookingForm";
```

## Zielzustand

Die Struktur ist gut, wenn Route-Dateien duenn bleiben, Nutzeraktionen und Fachobjekte getrennt sind, Public APIs stabil bleiben und neue Slices ohne Abhaengigkeitsumkehr ergaenzt werden koennen.
