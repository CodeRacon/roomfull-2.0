# Implementierte Architektur-Optimierungen

Stand: 2026-07-01

## Zweck

Diese Datei dokumentiert bereits umgesetzte Architektur-Optimierungen von
RoomFull 2.0. Sie soll verhindern, dass spaetere Reviews dieselbe Reibung erneut
diagnostizieren, geloeste Module unnoetig aufteilen oder neue shallow Seams um
bereits tiefe Interfaces legen.

Sie ist ein historisches Architektur-Register, keine zweite Source of Truth fuer
Fachregeln oder HTTP-Contracts.

## Dokumentationsrollen

- [`CONTEXT.md`](../../CONTEXT.md) definiert die aktuelle Fachsprache und
  aufgeloeste Produktentscheidungen.
- [Project Decisions](../../.agents/skills/roomfull/project-decisions.md) haelt
  aktuelle Architektur- und Produktentscheidungen fest.
- Die Flow-Dokumente unter [`backend/docs`](../../backend/docs) beschreiben das
  aktuelle Verhalten.
- ADRs unter [`docs/adr`](../adr) dokumentieren langfristige Entscheidungen und
  ihre Trade-offs.
- Diese Datei beantwortet: Welche Architektur-Reibung wurde bereits behoben,
  welche Tiefe wurde gewonnen und wann lohnt sich eine Neubewertung?

Wenn diese Datei einer aktuellen Source of Truth widerspricht, gilt die aktuelle
Source of Truth.

## Aktuelle Gesamteinschaetzung

RoomFull besitzt fuer den dokumentierten V1-Umfang einen sauberen und soliden
Architekturstand:

- Die fachliche Wahrheit fuer Booking, Availability, Rollen und Zeitregeln liegt
  im Backend.
- Zentrale fachliche Module bieten viel Leverage hinter kleinen Interfaces.
- Fachregeln und technische Details besitzen gute Locality.
- Persistenz- und Clock-Seams sind dort vorhanden, wo unterschiedliche Adapter
  oder deterministische Tests konkreten Nutzen bringen.
- Das Frontend konsumiert berechnete Contracts und rekonstruiert keine
  zeitbezogene Availability aus Rohdaten.

Der Stand ist performance-freundlich, aber nicht durch Lasttests oder Benchmarks
zertifiziert. Breite automatisierte E2E- und Integrationstests sind fuer V1
bewusst nicht Teil des erreichten Testumfangs.

## 1. Gemeinsame Booking Request Modes

### Vorherige Reibung

Booking Context, Availability und Erstellung interpretierten direkte Buchung und
Hot-Desk-Auto-Assign teilweise getrennt. Dadurch konnten erlaubte Kombinationen,
Modusnamen und Fehlerbilder auseinanderlaufen.

### Implementierter Stand

Das Booking Request Modes Module besitzt die gemeinsame Interface fuer:

- `DIRECT` mit `unitId`
- `AUTO_ASSIGN` mit `areaId + unitType=HOT_DESK`

Es normalisiert Eingaben, verhindert gemischte Modi und erzwingt, dass
Auto-Assign dauerhaft nur fuer `HOT_DESK` gilt. Context, Availability und
Erstellung verwenden dieselbe Implementation.

### Gewonnene Tiefe

Die Interface verbirgt Moduserkennung, Normalisierung, Invarianten und
Fehlerbilder. Der Deletion Test ist erfuellt: Ohne das Module wuerde dieselbe
Komplexitaet in drei fachlichen Callern wieder erscheinen.

### Zentrale Dateien und Tests

- `backend/src/services/booking-request-mode.ts`
- `backend/src/services/booking.service.ts`
- `backend/src/services/booking-availability.ts`
- `backend/tests/booking-request-mode.test.ts`

### Neubewertung erst bei

- einem dritten Booking Request Mode,
- abweichenden Modusregeln zwischen Context, Availability und Erstellung oder
- neuen fachlichen Zielarten neben BookableUnit und Hot-Desk-Auto-Assign.

## 2. Booking Time Policy und Coworking Calendar

### Vorherige Reibung

Zeitvalidierung, lokale Coworking-Zeit, Booking Time Grid, Oeffnungszeiten,
Duration Policy und Today Booking Start Rule waren ueber mehrere Caller verteilt.
Tests mussten Zeit teilweise als externes Detail durchreichen.

### Implementierter Stand

Die Booking Time Policy kapselt die fachlichen Zeitregeln. Der technische
Coworking Calendar kapselt Kalenderumrechnung in `Europe/Berlin` und besitzt eine
Clock-Seam. Die Produktiv-Clock und Fixed-Clock-Adapter fuer Tests sitzen an
dieser Seam.

Booking-Erstellung akzeptiert `date + startTime + endTime`; Browser-generierte
ISO-Zeitpunkte sind kein Booking Time Input.

### Gewonnene Tiefe

Caller erhalten validierte UTC-Zeitpunkte, Tagesplaene und berechnete Slots,
ohne Zeitzonen-, Raster- oder Oeffnungszeitenwissen zu duplizieren. Zeitwissen,
Fehler und Tests besitzen dadurch hohe Locality.

### Zentrale Dateien und Tests

- `backend/src/services/coworking-calendar.ts`
- `backend/src/services/booking-time-policy.ts`
- `backend/src/services/booking-availability.ts`
- `backend/tests/booking-time-policy.test.ts`

### Neubewertung erst bei

- mehreren Coworking-Zeitzonen,
- Oeffnungszeiten pro Area oder UnitType,
- einem veraenderten Booking Time Grid oder
- neuen Duration Policies, die mit der bestehenden Interface nicht ausdrueckbar
  sind.

## 3. Direct Booking Calendar State

### Vorherige Reibung

Der Direct-Booking-Kalender benoetigte Rohintervalle oder einen Request pro Tag.
Das Frontend musste daraus fachliche Tageszustaende ableiten.

### Implementierter Stand

Das Direct Booking Calendar State Module berechnet fuer einen sichtbaren Monat
`available`, `partially-booked` und `fully-booked`. Ein Monat benoetigt einen
Range-Read und einen HTTP-Request. Rohintervalle, Booking-Owner und User-Daten
verlassen das Backend nicht.

`fully-booked` bedeutet, dass keine freie Zeitspanne mehr die Duration Policy der
BookableUnit erfuellt. Die Today Booking Start Rule veraendert diesen
Monatszustand nicht.

### Gewonnene Tiefe

Die Interface liefert direkt die fachliche Antwort, waehrend Range-Reads,
Intervallzuordnung und Duration-Pruefung Implementation bleiben. Das schafft
Leverage fuer den Custom Calendar und Locality fuer Monatslogik und Tests.

### Zentrale Dateien und Tests

- `backend/src/services/direct-booking-calendar-state.ts`
- `backend/tests/direct-booking-calendar-state.test.ts`
- `src/entities/booking/api/get-direct-booking-calendar-state.ts`
- `src/features/booking/create-booking/ui/CreateBookingForm.tsx`

### Neubewertung erst bei

- Kalenderzustand fuer Auto-Assign,
- zusaetzlichen fachlichen Tageszustaenden oder
- einem nachgewiesenen Performanceproblem des monatlichen Range-Reads.

## 4. Admin Booking Operations

### Vorherige Reibung

Die Admin-Ansicht berechnete Zeitraeume und operative Summary im Browser und
benoetigte mehrere voneinander abhaengige Requests. Status, Suche, Zeitraum und
Summary-Scopes waren dadurch verteilt.

### Implementierter Stand

Das Admin Booking Operations Module liefert Bookings, effektiv verwendeten
Zeitraum und operative Summary in einem gemeinsamen Contract. Presets, explizite
Ranges, Suche, Status und Summary-Scopes werden im Backend aufgeloest. Unabhaengige
Reads laufen parallel.

### Gewonnene Tiefe

Das Frontend kennt keine Query-Orchestrierung oder Zeitraumregeln mehr. Die
Interface liefert den vollstaendigen Operations-Datensatz; Scope-Regeln und
Persistenzabbildung bleiben Implementation.

### Zentrale Dateien und Tests

- `backend/src/services/admin-booking-operations.ts`
- `backend/src/db/booking.repository.ts`
- `backend/src/controllers/bookings.controller.ts`
- `backend/tests/admin-booking-operations.test.ts`
- `src/entities/booking/api/get-admin-booking-operations.ts`
- `src/app/[lang]/admin/bookings/AdminBookingsPageClient.tsx`

### Neubewertung erst bei

- neuen operativen Kennzahlen mit abweichender Zeitsemantik,
- Pagination jenseits des aktuellen V1-Limits oder
- einem zweiten Adapter mit grundlegend anderer Query-Faehigkeit.

## 5. Cancel Booking Confirmation Workflow

### Vorherige Reibung

Karten- und Listenansicht besassen eigenen Confirmation-, Submit- und
Fehlerzustand. Mehrere parallele Bestaetigungen, Prop-Drilling und abweichendes
Retry-Verhalten waren moeglich.

### Implementierter Stand

Eine Instanz des Cancel Booking Confirmation Workflow umschliesst die gesamte My
Bookings View. Sie besitzt Oeffnen, Keyword-Pruefung, Abbruch, Submit, Retry,
Fehlerzuordnung und Session-Ende bei `401`.

Card Action und Compact Action sind explizite Darstellungs-Adapter an derselben
Workflow-Seam. Beide benoetigen von ihrem Caller nur die `bookingId`.

### Gewonnene Tiefe

Die Interface konzentriert den vollstaendigen Stornoablauf, waehrend die
Darstellungs-Adapter nur visuelle Unterschiede besitzen. Zustand und Verhalten
haben hohe Locality; alle My Bookings View Modes erhalten dieselbe Leverage.

### Zentrale Dateien und Tests

- `src/features/booking/cancel-booking/ui/CancelBookingWorkflow.tsx`
- `src/features/booking/cancel-booking/CancelBookingWorkflow.test.tsx`
- `src/features/booking/cancel-booking/index.ts`
- `src/widgets/my-bookings-list/ui/MyBookingsList.tsx`

### Neubewertung erst bei

- einer zweiten fachlich unterschiedlichen Stornoart,
- Admin-Fremd-Storno oder
- einem Dialogsystem, das nachweislich mehrere fachliche Workflows gemeinsam
  traegt.

## 6. Admin Unit Management

### Vorherige Reibung

Public Units, BookingOption-Projektion und Admin-Inventarlogik lagen in einem
gemeinsamen Module. Admin-Filter, Normalisierung, Validierung und Mutationen
waren nicht gemeinsam ueber ihre fachliche Interface testbar.

### Implementierter Stand

Das Admin Unit Management Module buendelt `list`, `getContext`, `create`,
`update` und `deactivate`. Die Implementation verbirgt Normalisierung,
Validierung sowie effektive UnitType- und Area-Regeln.

Prisma und der In-Memory-Test-Adapter bilden die Persistenz-Seam. Das Public
Units Module besitzt nur noch Public Units und BookingOptions.

### Gewonnene Tiefe

Ein Caller muss weder Validierungsreihenfolge noch Persistenzdetails kennen. Die
Interface bietet hohe Leverage fuer den gesamten Admin-Unit-Lebenszyklus und
konzentriert Regeln und Tests an einer Stelle.

### Zentrale Dateien und Tests

- `backend/src/services/admin-unit-management.ts`
- `backend/src/controllers/admin-units.controller.ts`
- `backend/src/services/unit.service.ts`
- `backend/tests/admin-unit-management.test.ts`

### Neubewertung erst bei

- Admin-Verwaltung fuer UnitTypes oder Areas,
- neuen Unit-Lebenszyklen neben aktiv/deaktiviert oder
- einem zweiten produktiven Persistenz-Adapter.

## 7. Create Booking Flow Model

### Vorherige Reibung

Die Create Booking Form buendelte sichtbare UI, Submit-Payload-Erzeugung,
Selection-Transitions, Summary-Daten und Submit-Fehlerzuordnung in einem grossen
Client Module. Tests fuer diese Flow-Entscheidungen haetten dadurch viel
Formular-UI rendern muessen.

### Implementierter Stand

Das Create Booking Flow Model kapselt reine Frontend-Workflow-Ableitungen:

- Context-View-Daten fuer `DIRECT` und `AUTO_ASSIGN`
- Vollstaendigkeit der Booking-Auswahl
- Reset-Regeln bei Datum- und Startzeitwechsel
- Submit-Payload-Erzeugung aus Booking Context und Auswahl
- display-only Summary-Daten
- Zuordnung bekannter Submit-Fehler auf Workflow-Outcomes

Die echte fachliche Booking Time Policy, Availability-Berechnung und finale
Konfliktpruefung bleiben weiterhin im Backend. Das Frontend verarbeitet nur
bereits berechnete Contracts und definiert keine eigenen Zeit- oder
Availability-Regeln.

### Gewonnene Tiefe

Die Interface bietet Tests und UI eine kleine, stabile Oberflaeche fuer den
Create-Booking-Workflow. Die Implementation konzentriert Flow-Wissen, das sonst
im Formular verstreut waere. Der Deletion Test ist fuer diese UI-Flow-Regeln
erfuellt: Ohne das Model wuerden Payload-, Reset-, Summary- und Fehlerlogik
wieder in der Form auftauchen.

### Zentrale Dateien und Tests

- `src/features/booking/create-booking/model/create-booking-flow.ts`
- `src/features/booking/create-booking/model/create-booking-flow.test.ts`
- `src/features/booking/create-booking/ui/CreateBookingForm.tsx`

### Neubewertung erst bei

- einem weiteren Booking Request Mode,
- einer fachlich anderen Create-Booking-UI mit wiederverwendbarem Flow oder
- echtem Bedarf, die UI-Darstellung selbst weiter in kleinere Module zu teilen.

## Review-Leitplanken gegen Ueber-Verbesserung

Die folgenden Ideen wurden nach Umsetzung der obigen Optimierungen erneut
bewertet. Sie sind aktuell kein eigener Architektur-Scope.

### Kein zusaetzliches semantisches Booking-Target-Module

Booking Request Modes und Booking Time Policy kapseln bereits die komplexen
gemeinsamen Regeln. Context, Availability und Erstellung benoetigen bewusst
unterschiedliche Daten und Fehlerbilder. Ein weiteres vorgeschaltetes Module
wuerde derzeit vor allem Queries durchreichen und waere voraussichtlich shallow.

Erst neu bewerten, wenn konkrete Regelabweichungen auftreten oder ein weiterer
Booking Request Mode hinzukommt.

### Kein weiteres Booking-Placement-Module

`createBookingForUser` besitzt bereits eine tiefe Interface. Deterministische
Auto-Zuweisung, Retry und der Postgres-Overlap-Constraint liegen hinter dieser
Interface. Eine weitere externe Seam wuerde aktuell keine zusaetzliche Leverage
erzeugen.

Die technische Hygiene wurde am 2026-06-22 umgesetzt: Nur `P2004`-Fehler mit
dem konkreten Constraint `bookings_no_active_overlap_excl` werden als
Booking-Konflikt behandelt; andere Prisma-Fehler bleiben sichtbar. Die
transaktionale Erstellung liegt im Booking-Persistenzmodul, die ungenutzte
ungeschuetzte Persistenzfunktion wurde entfernt. Das ist kein zusaetzliches
Deepening-Projekt.

### Keine fachliche Booking Time Policy im Frontend

Das Backend bleibt fachliche Wahrheit. Das Frontend darf Berliner Datums- und
Zeitwerte konsistent darstellen, soll aber Oeffnungszeiten, Duration Policy,
Booking Time Grid oder Availability nicht selbst definieren.

Die schmale Vereinheitlichung der Darstellungszeitzone `Europe/Berlin` wurde am
2026-06-22 in `entities/booking/lib/booking-time.ts` umgesetzt. Sie projiziert
Booking-Zeitpunkte fuer Account-, Customer-, Admin- und Booking-Kalenderansichten,
definiert aber keine fachlichen Zeitregeln. Eine zweite fachliche Clock-Seam im
Frontend braucht weiterhin erst einen konkreten Verhaltens- oder Testdruck.

### Kein globales Session-Ende als versteckter Request-Seiteneffekt

Authenticated API Requests beziehen den Authorization Header zentral aus der
Frontend Session. Fachliche Workflows ordnen Fehler weiterhin ihrem eigenen
Zustand und ihrer Copy zu. Insbesondere besitzt der Cancel Booking Confirmation
Workflow sein dokumentiertes `401`-Verhalten.

Die technische Request-Implementation darf intern dedupliziert werden. Ein
global registrierter `401`-Handler wuerde dagegen Workflow-Verantwortung
verbergen und wird ohne neue Entscheidung nicht eingefuehrt.

## Historischer Validierungsstand

Nach Abschluss der Optimierungen am 2026-06-22 waren dokumentiert:

- Backend: 37/37 Tests erfolgreich
- Backend TypeScript-Build erfolgreich
- Backend Lint erfolgreich
- Frontend Cancel Booking Confirmation Workflow: 6/6 Tests erfolgreich
- Frontend Produktionsbuild und Lint erfolgreich
- OpenAPI-JSON erfolgreich geparst

Das ist ein historischer Stand. Vor neuen Aenderungen muessen die aktuell
relevanten Feedbackkanaele erneut ausgefuehrt werden.

## Zugehoerige Commits

- `42b68c4` - Architektur-Contracts dokumentiert
- `21402fc` - Booking- und Admin-Unit-Workflows vertieft
- `7c75f3a` - tiefe Booking-Contracts im Frontend konsumiert
- `9341e38` - Cancel Booking Confirmation Workflow vereinheitlicht

## Pflege

Diese Datei wird aktualisiert, wenn ein Architektur-Review zu einem tatsaechlich
implementierten Deepening fuehrt oder eine Review-Leitplanke durch neue Evidenz
aufgehoben wird. Reine Feature-Implementierungen und lokale Codebereinigungen
gehoeren nicht hierher.
