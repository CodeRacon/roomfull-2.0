# Project Summary

## Ziel

RoomFull 2.0 ist ein kleines, bewusst fokussiertes MVP für die Buchung von Coworking-Units.

Das Projekt dient vor allem dazu, Business-Logik, Rollen/Rechte, Datenmodellierung, API-Struktur und Fullstack-Architektur sauber zu verstehen und umzusetzen. Ziel ist keine überladene Plattform, sondern ein glaubwürdiges, technisch sauberes Kernsystem.

## Produktfokus

Version 1 konzentriert sich auf den Buchungskern:

- Auth für Customer und Admin
- aktive Units anzeigen
- Verfügbarkeit prüfen
- Buchungen anlegen und stornieren
- Units administrativ anlegen, bearbeiten und deaktivieren
- Buchungen administrativ einsehen und verwalten

## Nicht Teil von Version 1

Bewusst ausgeschlossen sind unter anderem:

- Payments
- E-Mail-Benachrichtigungen
- Kalender-Sync
- Realtime
- Wartelisten
- komplexe Preislogik
- mehrere Standorte
- AI-Features
- perfektes UI-Finishing

## Technischer Rahmen

Geplanter Stack:

- Frontend: Next.js + TypeScript
- Backend: Express + TypeScript
- Datenbank: PostgreSQL

Express wird bewusst vor NestJS genutzt, damit Routing, Middleware, REST und Business-Logik direkt sichtbar und nachvollziehbar bleiben.

## Architekturprinzipien

- lieber klein und sauber als groß und halb fertig
- klare Trennung von UI, Business-Logik und Datenzugriff
- Business-Logik gehört ins Backend
- keine unnötige Komplexität und keine God-Components oder God-Services
- Patterns nur einsetzen, wenn sie das Modell wirklich klarer machen

## Umsetzungsreihenfolge

Die Reihenfolge ist bewusst backend- und domänengetrieben:

1. Domäne und Regeln klären
2. Datenmodell sauber definieren
3. Backend und API aufbauen
4. Frontend auf stabile Logik setzen
5. Validierung, Fehlerhandling, Tests und README verbessern

## Leitgedanke

RoomFull 2.0 soll zeigen, dass nicht nur UI gebaut wird, sondern fachlich saubere Systeme verstanden und umgesetzt werden: mit klaren Regeln, relationalem Datenmodell, sauberer API und nachvollziehbaren Architekturentscheidungen.
