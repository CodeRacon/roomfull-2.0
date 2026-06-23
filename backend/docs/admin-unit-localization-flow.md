# Admin Unit Localization Flow

## Fachregeln

- Admins pflegen für jede BookableUnit eine deutsche und eine englische Beschreibung.
- Beim Anlegen sind `descriptionDe` und `descriptionEn` Pflichtfelder und dürfen nicht leer sein.
- Beim Bearbeiten können beide Sprachfelder unabhängig aktualisiert werden.
- Das Legacy-Feld `description` wird serverseitig mit `descriptionDe` synchronisiert.
- Admin-Responses liefern beide Sprachfelder; Public-Responses liefern weiterhin nur die für das angefragte Locale aufgelöste `description`.
- Wiederholtes Seeding legt fehlende Demo-Units an, überschreibt aber keine bereits vorhandenen oder im Admin-Bereich bearbeiteten Units.

## Datenpflege

Bestehende Units werden unter Beibehaltung ihrer IDs lokalisiert. Dadurch bleiben verknüpfte Bookings und andere Relationen unverändert.
