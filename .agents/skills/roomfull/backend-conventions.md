# Backend Conventions

## Ziel

Klare Verantwortungen im Express-Backend von RoomFull 2.0.

## Struktur

Typische Bereiche:

- `routes/`
- `controllers/`
- `services/`
- `db/`
- `middleware/`

## Verantwortungen

### `routes`

- Endpoints definieren
- Middleware verdrahten
- keine Business-Logik

### `controllers`

- Request lesen
- Input an Service weitergeben
- Response zurückgeben
- Fehler sauber weiterreichen

Nicht in Controller:

- Konfliktprüfung
- Rollenlogik als Business-Entscheidung
- komplexe Validierung
- SQL

### `services`

Hier liegt die Business-Logik.

Zum Beispiel:

- Buchung prüfen
- Überschneidungen erkennen
- Rollenregeln durchsetzen
- Statuswechsel ausführen
- Verfügbarkeit berechnen

### `db`

- Queries
- Persistenz
- Datenbankzugriffe
- keine verstreute Geschäftslogik

### `middleware`

- Auth
- Rollenchecks
- technische Vorbedingungen

## Kernregel

Die fachliche Wahrheit liegt im Backend-Service-Layer.

Wichtige Regeln wie diese werden dort geprüft:

- nur aktive Units sind buchbar
- nur zukünftige Zeiträume sind buchbar
- `start_time < end_time`
- Buchungen müssen innerhalb der globalen Öffnungszeiten liegen
- keine Überschneidung aktiver Buchungen auf derselben Unit
- Customers dürfen nur eigene Buchungen stornieren

## Validierung

Unterscheide zwischen:

- technischer Request-Validierung
- fachlicher Validierung im Service

Beispiel:

- fehlendes Feld → Request-Validierung
- Buchung kollidiert mit bestehender Buchung → Service-Logik

## SQL-Regel

SQL soll Daten lesen und schreiben, aber nicht die fachliche Gesamtlogik unübersichtlich verstecken.

## Fehlerbehandlung

Saubere und einheitliche Fehler:

- `400` für ungültige Eingaben
- `401` für nicht eingeloggt
- `403` für fehlende Berechtigung
- `404` für nicht gefunden
- `409` für Buchungskonflikte

## Do

- Controller dünn halten
- Fachregeln in Services bündeln
- Queries zentral halten
- Rollen sauber prüfen
- Fehler konsistent behandeln

## Don’t

- keine Business-Logik in Controller
- keine Rechteprüfung nur im Frontend
- keine SQL-Queries direkt in Route-Dateien
- keine verstreute Konfliktlogik an mehreren Stellen
