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

## Account Overview

`/me/account` ist in V1 eine geschützte Nur-Lese-Page für Session-User-Daten aller angemeldeten Rollen.

Sie zeigt Name, E-Mail, Rolle und "Nutzer seit" aus der Frontend Session.

Ein Einstieg zu `/me/bookings` ist erlaubt, bevorzugt als Anzeige der nächsten anstehenden Buchung statt als generischer Menü-Link. Das bleibt Navigation zur Booking-Liste und kein Account-Inhalt.

Ein Einstieg zu Customer Contact ist für Customers erlaubt, weil Contact fachlich zum Customer Self-Service gehört. Er bleibt account-nah und wird nicht als globale Hauptnavigation platziert.

Logout bleibt in V1 im Header-Profilmenü und wird nicht zusätzlich auf `/me/account` platziert.

Keine sichtbaren Platzhalter für spätere Account-Einstellungen. Profilbearbeitung, Passwortänderung und Booking-Präferenzen werden erst sichtbar, wenn sie als eigene Feature-Slices umgesetzt werden.

Solange dort nur Name, E-Mail und Rolle angezeigt werden, braucht sie keine eigene Feature-Slice und keinen eigenen Backend-Endpoint.

Erst echte Account-Aktionen wie Profilbearbeitung oder Passwortänderung werden als eigene Feature-Slices geschnitten.

## Form-Logik

Form-State und Interaktionslogik gehören in die passende Feature-Slice, nicht global in shared.

## API-Zugriffe

API-Funktionen gehören in die passende Slice oder in shared/api, wenn sie wirklich allgemein sind.

Auth-required API-Aufrufe nutzen zentrale authenticated API-Client-Funktionen aus `shared/api`.

Nicht erlaubt:

- `authToken` durch Pages, Widgets, Features oder fachliche Entity-API-Funktionen reichen
- `localStorage` außerhalb der Session-Entity lesen
- Header oder geschützte Pages als eigene Auth-Quelle behandeln

## Session Boundary

Die Frontend Session liegt in `entities/session`.

Sie kapselt:

- Token Storage
- aktuellen Session User
- Ladezustand
- Login-Session starten
- Logout-Session beenden
- bestehende Session über `GET /auth/me` validieren

Konsumierende Bereiche nutzen nur `useSession()`.

Beispiele:

- Header liest `status` und `user` aus `useSession()`
- Login/Register rufen `startSession(authResponse)` auf
- Logout ruft `endSession()` auf
- geschützte UI-Flows nutzen `RequireAuth`

## Admin Area

`/admin` ist der Einstieg in die Admin-Arbeitsoberfläche und kein Redirect auf eine Detailseite.

Admin-Navigation ist rollenbasiert von Customer-Navigation getrennt:

- Customer sehen Customer-Einstiege wie `Buchen` und `Meine Buchungen`
- Admins sehen im globalen Header nur den Einstieg `Admin`

Admin-Seiten nutzen eine konsistente Admin-Subnavigation für die Arbeitsbereiche `Dashboard`, `Buchungsbetrieb`, `Unit-Inventar` und `Contact Inbox`.

Die Admin-Subnavigation darf einen dezenten globalen Unread-Badge am `Contact Inbox`-Link zeigen. Der Count kommt aus dem Backend und ist nicht pro Admin getrennt.

Die Admin Contact Inbox liegt als zusammengesetzter Arbeitsbereich in `widgets/admin-contact-inbox`; Contact-Request-API-Funktionen und Typen liegen in `entities/contact-request`.

Admins dürfen technisch operative Bookings anlegen, nutzen dafür aber bewusst den normalen Customer-Flow über `/booking-options`.

Es gibt in V1 keinen separaten Admin-Einstieg für "Buchungsflow prüfen"; der Header und das Admin-Dashboard halten Admin-Arbeitsbereiche und Customer-Booking-Flow getrennt.

## Admin Analytics Charts

V2-Analytics auf `/admin` nutzt Recharts direkt als Chart-Engine.

Chart-Code wird nach Verantwortung platziert:

- fachlich neutrale Chart-Rahmen, Tooltip-Styles oder Empty States dürfen nach `shared/ui/charts`
- Admin-Analytics-Komposition gehört in ein Widget wie `widgets/admin-analytics-dashboard`
- Analytics-API-Funktionen und Types gehören in eine fachliche Entity-Slice, bevorzugt `entities/analytics`

Nicht nach `shared` gehören:

- Admin-spezifische Analytics-Fetches
- Booking-Demand-Berechnung
- UnitType- oder Storno-Fachlogik
- Dashboard-Komposition

Keine Dashboard-Komplettbibliothek als UI-Basis für den ersten Analytics-Ausbau. Recharts liefert nur die Visualisierungs-Engine; RoomFull behält Layout, Farben und UI-Zustände selbst.

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
