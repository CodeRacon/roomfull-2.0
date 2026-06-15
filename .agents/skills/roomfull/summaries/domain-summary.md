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
- `Area`
- `UnitType` (`HOT_DESK`, `BOOTH`, `TEAM_ROOM`, `MEETING_ROOM`)
- `BookableUnit`
- `Booking`

Gebucht wird immer eine konkrete `BookableUnit`.

## Customer-Einstieg

Die Booking Options Page `/booking-options` zeigt `BookingOption`s, nicht einzelne BookableUnits als Startseiten-Inventar.

Eine `BookingOption` ist ein Customer-facing Angebot und entspricht im MVP einem bewusst freigegebenen UnitType:

- `HOT_DESK`
- `BOOTH`
- `TEAM_ROOM`
- `MEETING_ROOM`

`BookingOption.status` beschreibt nur grundsätzliche Verfügbarkeit ohne Zeitraum. Zeitbezogene Verfügbarkeit wird später im Booking-Flow geprüft.

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

- Request: `areaId + unitType + start + end`
- in V1 nur `HOT_DESK`
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

## Leitregel

Fachliche Wahrheit liegt im Backend. Frontend unterstützt Regeln, definiert sie nicht.
