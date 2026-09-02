# Domain Summary

## Ziel

RoomFull 2.0 ist ein kleines Buchungssystem für Coworking-Umgebungen mit Fokus auf klaren Rollen, sauberen Zuständen und verlässlicher Buchungslogik.

## Rollen

- `customer`
- `admin`

Customer nutzt Self-Service für eigene Bookings.
Admin verwaltet Units, sieht alle Bookings und darf operativ Bookings anlegen.

## Kernentitäten

- `User`
- `Team`
- `TeamMember`
- `Area`
- `UnitType` (`HOT_DESK`, `BOOTH`, `TEAM_ROOM`, `MEETING_ROOM`)
- `BookableUnit`
- `Booking`
- `ContactRequest`

Gebucht wird immer eine konkrete `BookableUnit`.

`Team` und `TeamMember` bilden eine private, Customer-eigene Kontaktgruppe für spätere Booking Shares. Team Members sind keine Users und Teams keine Organisationen.

`ContactRequest` speichert eine Customer-Anfrage für die Admin Contact Inbox; RoomFull versendet dabei keine E-Mail.

## Customer-Einstieg

Die Booking Options Page `/booking-options` zeigt `BookingOption`s, nicht einzelne BookableUnits als Startseiten-Inventar.

Eine `BookingOption` ist ein Customer-facing Angebot und entspricht im MVP einem bewusst freigegebenen UnitType:

- `HOT_DESK`
- `BOOTH`
- `TEAM_ROOM`
- `MEETING_ROOM`

`BookingOption.status` beschreibt nur grundsätzliche Verfügbarkeit ohne Zeitraum. Zeitbezogene Verfügbarkeit wird später im Booking-Flow geprüft.

Die Booking Options Page darf aktive Area- beziehungsweise Unit-Namen als Vorschau zeigen. Die konkrete Auswahl und Buchung bleibt auf der jeweiligen Detailseite.

## Struktur

- `Area` gruppiert mehrere BookableUnits (z. B. Open World)
- `BookableUnit.areaId` ist optional
- `BookableUnit` gehört zu genau einem `UnitType`
- `HOT_DESK` braucht für Public Booking immer eine Area
- `BOOTH`, `TEAM_ROOM` und `MEETING_ROOM` dürfen optional Areas haben, nutzen Areas im Customer-Flow aber zunächst nicht als Auswahlentscheidung

## Zustände

### BookableUnit

- `active`
- `deactivated`

### Booking

- `active`
- `cancelled`

`cancelled` bleibt historisch erhalten und blockiert nicht mehr.

## Zeitmodell

- keine festen Slots
- Booking-Erstellung nutzt `date` plus lokale `startTime`/`endTime` in `Europe/Berlin`
- globale Öffnungszeiten: Mo-Fr, 08:00-22:00
- nur zukünftige Zeiträume
- `start_time < end_time`
- Start und Ende am selben Kalendertag

## Dauerregeln pro UnitType

- `HOT_DESK`: min 30, max 240 Minuten
- `BOOTH`: min 60, max 240 Minuten
- `TEAM_ROOM`: min 60, max 480 Minuten
- `MEETING_ROOM`: min 60, max 480 Minuten

## Hot-Desk-Auto-Assign

- Request: `areaId + unitType + date + startTime + endTime`
- dauerhaft nur `HOT_DESK`
- Area-Auswahl ist für Hot Desk im Customer-Flow erforderlich
- freie Unit deterministisch nach `displayOrder`, dann `id`
- race-sicher über Transaktion/Konflikt-Retry

## Overlap-Regel

Eine neue Booking kollidiert mit einer aktiven Booking derselben Unit, wenn:

```txt
new_start < existing_end
AND
new_end > existing_start
```

## Teams und Booking Share

- ein Team gehört genau einem Customer
- Teamnamen sind pro Customer normalisiert eindeutig
- ein Team darf leer sein und höchstens 50 Team Members enthalten
- ein Customer darf höchstens 20 Teams besitzen
- Team Members bestehen aus Name und normalisierter E-Mail und benötigen keinen Account
- Team Booking Share ist nur für eigene aktive Bookings mit `endTime >= now` erlaubt
- RoomFull persistiert weder Empfängerauswahl noch persönliche Nachricht oder Versandstatus
- RoomFull versendet nichts; es bereitet BCC, Betreff, Nachricht und eine empfängerfreundliche `.ics` getrennt vor

## Leitregel

Fachliche Wahrheit liegt im Backend. Frontend unterstützt Regeln, definiert sie nicht.
