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

**Create Booking Page**:
Gemeinsame Customer-Seite `/bookings/new`, die je nach Einstiegskontext einen der Booking Request Modes vorbereitet.
_Avoid_: separate Buchungsseiten pro UnitType

**Create Booking Entry Context**:
Ein gültiger Einstieg in `/bookings/new` ist entweder `unitId` für Direktbuchung oder `unitType=HOT_DESK&areaId=...` für Hot-Desk-Auto-Assign.
_Avoid_: gemischte oder unvollständige Query-Kontexte

**Booking Context**:
Vom Backend validierter Einstiegskontext für die Create Booking Page; beschreibt entweder eine konkrete BookableUnit oder einen Hot-Desk-Auto-Assign-Kontext inklusive Anzeigenamen und Dauerregeln.
_Avoid_: Frontend-Rekonstruktion aus rohen Unit-Listen

**Booking Context Permission**:
Der Booking Context ist auth-required und gehört zum eigentlichen BookingFlow, nicht zur öffentlichen Angebotsübersicht.
_Avoid_: public Booking-Context-Endpoint

**Booking Context Shape**:
Der Booking Context ist ein diskriminierter Contract: `DIRECT` beschreibt eine konkrete BookableUnit, `AUTO_ASSIGN` beschreibt einen Hot-Desk-Area-Kontext ohne konkrete Unit.
_Avoid_: freie Plätze ohne Zeitraum oder konkrete Hot-Desk-Unit im Context

**Booking Context Errors**:
Booking Context nutzt `400` für ungültige Entry-Kontexte, `401` für fehlende Auth, `404` für nicht buchbare Zielressourcen und kein `409` ohne Zeitfenster.
_Avoid_: Konfliktstatus ohne konkreten Zeitraum

**Booking Availability Timing**:
Die Create Booking Page lädt initial nur Booking Context; zeitbezogene Belegung wird erst nach Datumsauswahl geprüft.
_Avoid_: Availability-Fetch ohne Datum

**Booking Time Grid Selection**:
Die Create Booking Page nutzt ein 30-Minuten-Raster als UI-Auswahlhilfe: Datum wählen, Startzeit wählen, dann erlaubte Endzeiten wählen.
_Avoid_: gespeicherte oder fachlich feste Slots

**Direct Booking Day Occupancy Display**:
Bei direkter Unit-Buchung zeigt die UI nach Datumsauswahl alle Rasterpunkte und markiert belegte Zeiten sichtbar als blockiert.
_Avoid_: blockierte Zeiten still ausblenden

**Hot Desk Availability Preview Scope**:
Hot Desk zeigt im MVP keine Area-Availability-Preview; die finale Verfügbarkeit wird beim Submit durch Auto-Assign geprüft.
_Avoid_: freie Hot-Desk-Plätze ohne konkreten Submit-Konflikt versprechen

**Create Booking Frontend Placement**:
Die App-Route `/bookings/new` bleibt dünn; interaktive Buchungslogik liegt in `features/booking/create-booking`, Booking-Requests in `entities/booking/api`.
_Avoid_: God-Page mit Formular-, API- und Fehlerlogik

**Create Booking Success Destination**:
Nach erfolgreicher Buchung landet der Customer auf `/me/bookings?created=1` und sieht dort einen ruhigen Success-Hinweis.
_Avoid_: separate Confirmation-Seite im MVP

**User Settings**:
Ein geplanter Account-Bereich im Header fuer nutzerbezogene Praeferenzen wie Darstellung, ausgeblendete Listenbereiche oder spaetere Booking-Presets.
_Avoid_: lose Header-Idee ohne festen Produktplatz

**Frontend Session**:
Der aktuelle Auth-Zustand der laufenden Frontend-App inklusive angemeldetem Session-User, Ladezustand und Logout-Moeglichkeit.
_Avoid_: einzelne Widgets oder Pages lesen Auth-Zustand direkt aus Token Storage

**Session User**:
Die fuer die laufende Frontend Session benoetigten User-Daten. Er ist bewusst vom vollstaendigen fachlichen **User** entkoppelt.
_Avoid_: Header und Auth-Shell direkt an das User-Entity-Modell koppeln

**Session Lifecycle**:
Login- und Register-Features starten eine Frontend Session; Logout beendet eine Frontend Session. Token Storage bleibt dabei internes Detail.
_Avoid_: UI-Bereiche manipulieren Auth Storage direkt

**Authenticated API Request**:
Ein Frontend-API-Aufruf, dessen Authorization Header zentral durch den technischen API-Client aus der Frontend Session abgeleitet wird.
_Avoid_: Pages, Widgets oder fachliche API-Funktionen reichen `authToken` als Parameter weiter

**Upcoming Booking**:
Eine eigene aktive Booking, deren Ende noch nicht in der Vergangenheit liegt (`status=ACTIVE` und `endTime >= now`), inklusive gerade laufender Bookings.
_Avoid_: "aktuell" als Synonym nur fuer gerade laufende Bookings

**Past Booking**:
Eine eigene Booking, deren Ende bereits in der Vergangenheit liegt (`endTime < now`).
_Avoid_: stornierte Booking automatisch als vergangen behandeln

**Closed Booking**:
Eine eigene Booking, die entweder bereits vergangen oder storniert ist.
_Avoid_: stornierte Booking in anstehenden Buchungen anzeigen

**Booking Context Delivery Order**:
Der Backend-Endpoint fuer Booking Context wird vor der Create Booking Page umgesetzt.
_Avoid_: temporaere Frontend-Rekonstruktion gegen Public Unit APIs

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
- Die **Create Booking Page** ist der gemeinsame UI-Einstieg fuer beide Booking Request Modes.
- Der **Create Booking Entry Context** entscheidet, welcher Booking Request Mode vorbereitet wird.
- Der **Booking Context** ist die Backend-Quelle fuer die Darstellung und Validierung des Entry Context auf der Create Booking Page.
- **Booking Context Permission** trennt public Angebotsauswahl von auth-required Buchungsvorbereitung.
- **Booking Context Shape** unterscheidet direkte Unit-Buchung und Hot-Desk-Auto-Assign eindeutig.
- **Booking Context Errors** grenzen Kontextvalidierung von späterer Zeit-/Konfliktprüfung ab.
- **Booking Availability Timing** trennt Angebots-/Kontextanzeige von zeitbezogener Belegung.
- **Booking Time Grid Selection** hält das Zeitraster als UI-Hilfe getrennt vom fachlichen Zeitraum-Modell.
- **Direct Booking Day Occupancy Display** macht blockierende Intervalle bei konkreten Units sichtbar.
- **Hot Desk Availability Preview Scope** begrenzt Hot Desk im MVP auf finalen Backend-Check beim Submit.
- **Create Booking Frontend Placement** hält Route, Nutzeraktion und API-Anbindung getrennt.
- **Create Booking Success Destination** schließt den BookingFlow in der eigenen Buchungsliste ab.
- **Upcoming Booking** und **Closed Booking** strukturieren die eigene Buchungsliste anhand von Status und Buchungsende.
- **Booking Context Delivery Order** stellt sicher, dass die Create Booking Page direkt gegen den langfristigen Contract gebaut wird.
- **User Settings** sind als fester Account-Bereich im Header geplant, werden aber in einem eigenen Feature-Slice umgesetzt.
- **Frontend Session** ist die zentrale Quelle fuer Auth-Zustand im Frontend; Header und auth-required UI konsumieren sie statt direkt Token Storage zu lesen.
- **Session User** haelt die Session-relevanten User-Daten ohne direkte Kopplung an das User-Entity-Modell.
- **Session Lifecycle** trennt Nutzeraktionen wie Login/Register/Logout von der internen Token-Speicherung.
- **Authenticated API Request** haelt `authToken` aus Pages, Widgets, Features und fachlichen API-Funktionen heraus.
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
- "Separate Buchungsseiten pro UnitType?" war offen; aufgelöst: eine gemeinsame **Create Booking Page** `/bookings/new` mit zwei Modi.
- "Welche Query-Parameter starten den BookingFlow?" war offen; aufgelöst: nur `unitId` oder `unitType=HOT_DESK&areaId=...`.
- "Woher kommt der Anzeige- und Regelkontext fuer `/bookings/new`?" war offen; aufgelöst: aus einem Backend-validierten **Booking Context**.
- "Ist Booking Context public?" war offen; aufgelöst: nein, Booking Context ist auth-required.
- "Welche Form hat Booking Context?" war offen; aufgelöst: diskriminierter Contract mit `DIRECT` und `AUTO_ASSIGN`.
- "Welche Fehlercodes nutzt Booking Context?" war offen; aufgelöst: `400`, `401`, `404`, kein `409` ohne Zeitraum.
- "Lädt `/bookings/new` initial Availability?" war offen; aufgelöst: nein, erst nach Datumsauswahl.
- "Ist ein TimeSlot ein Fachobjekt?" war offen; aufgelöst: nein, die UI nutzt nur ein 30-Minuten-Raster zur Zeitraumsauswahl.
- "Wie wird die Endzeit gewählt?" war offen; aufgelöst: nach Startzeit als Liste erlaubter Endpunkte.
- "Zeigt Hot Desk Area-Verfügbarkeit im MVP?" war offen; aufgelöst: nein, finaler Check beim Submit.
- "Wo liegt Create-Booking-Formularlogik?" war offen; aufgelöst: Feature-Slice `features/booking/create-booking`.
- "Wohin nach erfolgreicher Buchung?" war offen; aufgelöst: `/me/bookings?created=1` ohne Booking-ID.
- "Settings im Header" war offen; aufgelöst: Settings sind fest als spaeterer Account-Bereich im Header geplant, aber nicht Teil des ersten Header-Slices.
- "Wer besitzt aktuellen Auth-Zustand im Frontend?" war offen; aufgelöst: **Frontend Session** besitzt ihn zentral, Token Storage bleibt Implementierungsdetail.
- "Ist der aktuelle Session-User dasselbe wie das User-Entity?" war offen; aufgelöst: nein, **Session User** ist bewusst entkoppelt.
- "Wer darf Auth Storage manipulieren?" war offen; aufgelöst: Session Lifecycle kapselt Storage; Features starten oder beenden Sessions ueber die Session API.
- "Wer fuegt Authorization Header an Frontend-API-Requests?" war offen; aufgelöst: technische `Authenticated API Request`s im API-Client, gespeist durch die Frontend Session.
- "Aktuelle Buchungen" war unscharf; aufgelöst: **Upcoming Booking** meint eigene aktive Bookings mit `endTime >= now`, inklusive gerade laufender Bookings.
- "Stornierte Buchungen in der eigenen Liste" war offen; aufgelöst: stornierte Bookings erscheinen in **Closed Booking**, nicht in **Upcoming Booking**.
- "Booking Context zuerst oder Frontend-Zwischenlösung?" war offen; aufgelöst: eigener Backend-Endpoint zuerst.
- "Auto-Assign für alle UnitTypes?" war offen; aufgelöst: in V1 nur für `HOT_DESK`.
- "Buchungsdauer global für alle Typen" war zu grob; aufgelöst: Dauergrenzen kommen je **UnitType**.
- "Öffnungszeiten je Typ/Area" war offen; aufgelöst: in V1 bleiben Öffnungszeiten global (Mo-Fr 08:00-22:00).
- "Area-Pflicht für alle buchbaren Einheiten" war offen; aufgelöst: `areaId` bleibt optional.
- "API-Namen in Legacy-Sprache" war offen; aufgelöst: API nutzt `/units` und `unitId` bei internem Begriff **BookableUnit**.
- "Legacy-Routen weiterführen?" war offen; aufgelöst: `/spaces` wird entfernt, nur `/units` bleibt.
