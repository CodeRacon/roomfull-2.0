# Domain Rules

## Ziel

Diese Datei hält die fachlichen Kernregeln von RoomFull 2.0 fest.

## Rollen

Es gibt zwei Rollen:

- `customer`
- `admin`

### Customer darf

- aktive Units sehen
- Unit-Details sehen
- Unit-Verfügbarkeit prüfen
- eigene Bookings anlegen
- eigene Bookings sehen
- eigene zukünftige Bookings stornieren

### Customer darf nicht

- Units anlegen oder bearbeiten
- Units deaktivieren
- fremde Bookings sehen oder stornieren

### Admin darf

- Units anlegen
- Units bearbeiten
- Units deaktivieren
- alle Bookings sehen
- Bookings ebenfalls anlegen (operativer HelpDesk-Fall)

## Kernbegriffe

- `Area` (z. B. "Open World")
- `UnitType` (`HOT_DESK`, `BOOTH`, `TEAM_ROOM`)
- `BookableUnit` (konkretes buchbares Objekt)

Gebucht wird immer eine konkrete `BookableUnit`.

## Area-Regeln

Eine Area:

- gruppiert mehrere BookableUnits
- kann aktiv oder inaktiv sein

## Unit-Regeln

Eine BookableUnit:

- hat einen Namen
- gehört zu genau einem UnitType
- hat eine Kapazität
- hat eine `displayOrder` für deterministische Auswahl
- kann optional einer Area zugeordnet sein (`areaId` optional)
- ist aktiv oder deaktiviert

## Booking-Regeln

Eine Booking verbindet:

- `user`
- `unit`
- `start_time`
- `end_time`

### Booking-Status

- `active`
- `cancelled`

Bedeutung:

- `active` blockiert die Unit
- `cancelled` bleibt historisch erhalten, blockiert aber nicht mehr

## Zeitmodell

Version 1 arbeitet ohne feste Slots.

Verfügbarkeit wird aus bestehenden Bookings berechnet über:

- `start_time`
- `end_time`

## Öffnungszeiten

Für Version 1 gelten globale Öffnungszeiten:

- Montag bis Freitag
- 08:00 bis 22:00
- dieselben Öffnungszeiten gelten für alle UnitTypes

## Dauerregeln pro UnitType

- `HOT_DESK`: min 30 Minuten, max 240 Minuten
- `BOOTH`: min 60 Minuten, max 480 Minuten
- `TEAM_ROOM`: min 60 Minuten, max 480 Minuten

## Booking-Request-Modi

### Direktmodus

- Request enthält `unitId + start + end`
- Booking wird auf genau dieser Unit geprüft/angelegt

### Auto-Assign-Modus

- Request enthält `areaId + unitType + start + end`
- in V1 nur für `HOT_DESK` erlaubt
- System sucht freie Unit deterministisch:
  - `displayOrder` aufsteigend
  - bei Gleichstand `id` aufsteigend

## Verbindliche Buchungsregeln

- nur aktive Units sind buchbar
- nur zukünftige Zeiträume sind buchbar
- `start_time < end_time`
- Booking muss innerhalb globaler Öffnungszeiten liegen
- Dauer muss zur UnitType-Policy passen
- keine Überschneidung aktiver Bookings auf derselben Unit
- Customers dürfen nur eigene zukünftige Bookings stornieren
- Historie bleibt erhalten
- Auto-Assign muss race-sicher sein (Transaktion/Konflikt-Retry)

## Überlappungslogik

Eine neue Booking kollidiert mit einer bestehenden aktiven Booking derselben Unit, wenn:

```txt
new_start < existing_end
AND
new_end > existing_start
```

## Entitäten

- `Role`
- `User`
- `Area`
- `UnitType`
- `BookableUnit`
- `Booking`

## Beziehungen

- `Role` 1 --- n `User`
- `Area` 1 --- n `BookableUnit` (optional auf Unit-Seite)
- `UnitType` 1 --- n `BookableUnit`
- `User` 1 --- n `Booking`
- `BookableUnit` 1 --- n `Booking`

## Fachliche Validierung

### User

- E-Mail muss eindeutig sein
- Passwort darf nicht leer sein
- Rolle muss existieren

### Unit

- Name darf nicht leer sein
- Kapazität muss größer als 0 sein
- UnitType muss existieren
- `displayOrder` muss >= 0 sein
- `areaId` ist optional, muss bei Angabe existieren

### Booking

- User muss existieren
- Unit muss existieren
- Unit muss aktiv sein
- `start_time` muss in der Zukunft liegen
- `end_time` muss nach `start_time` liegen
- Dauer muss zur UnitType-Policy passen
- Zeitraum muss innerhalb der globalen Öffnungszeiten liegen
- es darf keine aktive kollidierende Booking geben

## Backend-Regel

Diese Fachregeln werden im Backend durchgesetzt, nicht nur im Frontend.
