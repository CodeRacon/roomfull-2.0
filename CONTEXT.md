# RoomFull

RoomFull ist ein MVP für Buchungen in Coworking-Umgebungen. Das Backend ist fachliche Wahrheit für Verfügbarkeit, Buchungsregeln und Rollenrechte.

## Language

**Area**:
Ein übergeordneter Bereich (z. B. "Open World"), der mehrere buchbare Einheiten gruppiert.
_Avoid_: Raumtyp, Einzelplatz

**BookableUnit**:
Eine konkret buchbare Einheit mit eigener ID, optional einer Area zugeordnet (`areaId` ist optional).
_Avoid_: Bereich, Hallenfläche, bloßer Typname

**Space**:
Technischer Legacy-Begriff im aktuellen Backend; wird fachlich durch **BookableUnit** abgelöst.
_Avoid_: kanonischer Fachbegriff für neues Modell

**Booking Target**:
Eine Booking referenziert fachlich genau eine **BookableUnit** (nicht mehr `Space`).
_Avoid_: `spaceId` als langfristige Fachsprache

**Booking Request Modes**:
`POST /bookings` unterstützt zwei Modi: direkt (`unitId + start + end`) und auto-assign (`areaId + unitType + start + end`).
_Avoid_: separater Endpoint pro Buchungsmodus

**Auto-Assign Scope**:
Der Auto-Assign-Modus ist in V1 ausschließlich für `HOT_DESK` erlaubt.
_Avoid_: automatische Zuordnung für `BOOTH` oder `TEAM_ROOM`

**Hot Desk Allocation Mode**:
Hot-Desk-Buchung läuft über Auto-Zuweisung: Request gibt Area + Zeitraum, System weist eine freie Unit zu.
_Avoid_: manuelle Unit-Auswahl als Standard für Hot Desk

**Hot Desk Allocation Strategy**:
Bei mehreren freien Hot-Desk-Units wählt das System deterministisch nach `displayOrder` aufsteigend, dann `id` aufsteigend.
_Avoid_: Zufallszuweisung

**Allocation Concurrency Rule**:
Auto-Zuweisung muss race-sicher sein (Transaktion + konfliktfeste Insert-Strategie mit Retry bei Kollision).
_Avoid_: nicht-atomare Auswahl/Erstellung unter Parallelzugriff

**API Language Rule**:
Die öffentliche API nutzt kurze Namen (`unitId`, `/units`) bei fachlich konsistentem Mapping auf **BookableUnit**.
_Avoid_: gemischte API-Semantik aus altem und neuem Modell

**Legacy Route Policy**:
Legacy-Routen auf `space`-Basis werden im Big-Bang-Cut entfernt und nicht parallel weitergeführt.
_Avoid_: Doppel-Contract (`/spaces` und `/units`) zur selben Zeit

**UnitType**:
Eine Kategorie für BookableUnits, die Buchungsregeln (z. B. Dauergrenzen) beeinflussen kann.
_Avoid_: Buchungseinheit

**UnitType Catalog**:
UnitTypes werden als eigener Katalog geführt (`HOT_DESK`, `BOOTH`, `TEAM_ROOM`) und tragen die Dauergrenzen pro Typ.
_Avoid_: Dauerregeln als harte If-Else-Logik ohne Datenquelle

**Duration Policy**:
Dauergrenzen werden pro UnitType in Minuten geführt und vom Booking-Service dynamisch ausgewertet.
_Avoid_: global harte Dauerkonstante im Service

**Hot Desk**:
Ein UnitType für Einzelplatzbuchung innerhalb einer Area.
_Avoid_: Halle als buchbare Einheit

**Booth**:
Ein UnitType für kleine abgeschlossene Einheiten, bleibt in V1 ein normaler UnitType.
_Avoid_: Sonderlogik-Typ

**Team Room**:
Ein UnitType für Teamräume, bleibt in V1 ein normaler UnitType.
_Avoid_: Sonderlogik-Typ

**Booking**:
Eine Reservierung einer konkreten BookableUnit für einen Zeitraum.
_Avoid_: Anfrage, Slot

**Customer Booking Permission**:
In V1 dürfen Customers eigene Bookings erstellen und eigene zukünftige Bookings stornieren.
_Avoid_: Storno fremder Bookings

**Admin Booking Permission**:
In V1 darf Admin ebenfalls Bookings erstellen und Bookings lesen (Übersicht), auch als operative HelpDesk-Rolle.
_Avoid_: Admin nur als Lesesicht

**Admin Cancel Scope**:
In V1 gibt es kein separates Fremd-Storno durch Admin; ein späterer Admin-Cancel-Use-Case ist bewusst offen.
_Avoid_: implizites Fremd-Storno ohne expliziten Endpoint

**Opening Hours**:
Globale Zeitgrenze für alle Bookings in V1: Mo-Fr, 08:00-22:00.
_Avoid_: Typ-spezifische Öffnungszeiten

**Booking Duration Rule**:
Dauergrenzen kommen aus der Duration Policy je UnitType.
_Avoid_: einheitliche Dauer für alle Typen

**Initial Duration Defaults**:
`HOT_DESK`: min 30, max 240; `BOOTH`: min 60, max 480; `TEAM_ROOM`: min 60, max 480.
_Avoid_: implizite Defaults ohne dokumentierte Werte

## Relationships

- Ein **UnitType** kategorisiert viele **BookableUnits**.
- Der **UnitType Catalog** ist die Quelle für typbezogene Dauergrenzen.
- Eine **Area** gruppiert mehrere **BookableUnits**.
- Eine **BookableUnit** kann viele **Bookings** haben.
- Eine **Booking** gehört genau einer **BookableUnit** und genau einem **User**.
- **Booking Target** ist die **BookableUnit**.
- **Booking Request Modes** erlauben direkte Unit-Buchung und Area-basierte Auto-Zuweisung in einem Endpoint.
- **Auto-Assign Scope** begrenzt den Automatikmodus in V1 auf `HOT_DESK`.
- **Hot Desk Allocation Mode** weist bei passender Anfrage automatisch eine freie Unit zu.
- **Hot Desk Allocation Strategy** macht die konkrete Unit-Auswahl reproduzierbar.
- **Allocation Concurrency Rule** verhindert Doppelvergabe derselben Unit bei parallelen Requests.
- `areaId` an **BookableUnit** ist optional (z. B. nötig für Hot Desk in Open World, optional für Booth/Team Room).
- **Opening Hours** gelten global für alle **UnitTypes** in V1.
- **Booking Duration Rule** folgt der **Duration Policy** je **UnitType**.
- **API Language Rule** hält die Endpunkt- und Feldnamen konsistent zur Domäne.
- **Legacy Route Policy** erzwingt einen klaren, einmaligen API-Schnitt.
- **Customer Booking Permission** erlaubt Self-Service-Booking inkl. eigenem Storno.
- **Admin Booking Permission** erlaubt operative Booking-Erstellung plus Lesesicht.
- **Admin Cancel Scope** trennt V1 bewusst von späterem Admin-Fremd-Storno.

## Example dialogue

> **Dev:** "Ist ein Hot Desk bei uns ein Bereich mit vielen parallelen Plätzen?"
> **Domain expert:** "Nein. In V1 ist Hot Desk ein einzelner buchbarer Space, wie jeder andere UnitType auch."

## Flagged ambiguities

- "Hot Desk" wurde semantisch als Bereich interpretiert; aufgelöst: In RoomFull V1 bedeutet es ein einzelner buchbarer Platz.
- "Buchungen verwalten" bei Admin war unscharf; aufgelöst: In V1 darf Admin auch Buchungen erstellen (operativer HelpDesk-Fall).
- "Admin darf stornieren" war unscharf; aufgelöst: kein Fremd-Storno in V1, aber explizit als späterer Ausbau vorgesehen.
- "Open World" als buchbare Einheit war unscharf; aufgelöst: **Area** gruppiert **BookableUnits**, gebucht wird die einzelne **BookableUnit**.
- "Seat" war zu eng für Booth/Team Room; aufgelöst: kanonischer Oberbegriff ist **BookableUnit**.
- "Booking zeigt auf Space" war Legacy-Semantik; aufgelöst: fachliches Zielmodell nutzt **Booking -> BookableUnit**.
- "Hot Desk Auswahlmodus" war offen; aufgelöst: Auto-Zuweisung statt manueller Unit-Auswahl als Standard.
- "Welche freie Unit wird gewählt?" war offen; aufgelöst: deterministisch nach `displayOrder`, dann `id`.
- "Parallelanfragen bei Auto-Zuweisung" war offen; aufgelöst: race-sicher per Transaktion + Konflikt-Retry.
- "Getrennte Booking-Endpoints je Modus?" war offen; aufgelöst: ein Endpoint mit zwei klaren Request-Modi.
- "Auto-Assign für alle UnitTypes?" war offen; aufgelöst: in V1 nur für `HOT_DESK`.
- "Buchungsdauer global für alle Typen" war zu grob; aufgelöst: Dauergrenzen kommen je **UnitType**.
- "Öffnungszeiten je Typ/Area" war offen; aufgelöst: in V1 bleiben Öffnungszeiten global (Mo-Fr 08:00-22:00).
- "Area-Pflicht für alle buchbaren Einheiten" war offen; aufgelöst: `areaId` bleibt optional.
- "API-Namen in Legacy-Sprache" war offen; aufgelöst: API nutzt `/units` und `unitId` bei internem Begriff **BookableUnit**.
- "Legacy-Routen weiterführen?" war offen; aufgelöst: `/spaces` wird entfernt, nur `/units` bleibt.
