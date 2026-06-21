# RoomFull

RoomFull ist ein MVP für Buchungen in Coworking-Umgebungen. Das Backend ist fachliche Wahrheit für Verfügbarkeit, Buchungsregeln und Rollenrechte.

## V1 Status

Der V1-MVP-Stand ist fachlich erreicht.

Enthalten sind Customer Self-Service für BookingOptions, Availability, Booking-Erstellung und eigenes zukünftiges Storno sowie ein Admin-Bereich mit Dashboard, Buchungsbetrieb und Unit-Inventar.

Admins verwalten in V1 BookableUnits, nicht UnitTypes oder deren Dauerregeln. Admin-Fremd-Storno und ein separater Admin-Einstieg zum Buchungsflow-Prüfen sind bewusst nicht Teil von V1.

Automatisierte breite E2E-/Integrationstest-Abdeckung wird in V1 bewusst geskippt; Prüfung erfolgt manuell und visuell.

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

**Home Page**:
Die öffentliche Startseite `/` erklärt RoomFull als Service und zeigt ansprechende Angebots-Teaser mit auth-aware CTAs in den Buchungseinstieg.
_Avoid_: reine interne Unit-Liste oder fokussierter Buchungskatalog

**Localized Route**:
Eine sharebare RoomFull-URL mit explizitem Sprachsegment `de` oder `en`, die dieselbe fachliche Seite in der gewählten Sprache adressiert.
_Avoid_: Sprache nur als unsichtbarer Browser- oder Session-Zustand

**Canonical Localized Route Tree**:
Der einzige kanonische Frontend-Routenbaum unter `de` oder `en`; unlokalisierte Pfade dienen nur als Redirect-Einstiege.
_Avoid_: parallele lokalisierte und unlokalisierte Page-Baeume mit derselben Funktion

**Language Switch**:
Eine UI-Aktion, die zwischen `de` und `en` wechselt, den aktuellen Pfad inklusive Query erhaelt und die gewaehlte Locale fuer spaetere Root-Besuche speichert.
_Avoid_: Sprachwechsel als Navigation zur Startseite oder Verlust von fachlichem UI-Zustand

**Localized Auth Redirect**:
Ein Auth-Redirect, dessen `next`-Ziel ein sicherer interner App-Pfad mit explizitem Locale-Segment ist.
_Avoid_: externe `next`-URLs, API-Pfade als Login-Ziel, Sprachverlust nach Login oder Register

**HTTP Error Page**:
Eine globale Fehlerseite, die einen HTTP-Statuscode wie `404` oder `500` sichtbar darstellt und die begleitende UI-Copy per Locale uebersetzt.
_Avoid_: deutsche feste Error-Page-Copy ohne Locale, API-Fehlerdetails als Page-Titel

**Localized API Error Copy**:
Frontend-Copy fuer bekannte API- und Formularfehler, abgeleitet aus stabilen Status- oder Fehlercodes statt aus Backend-Message-Strings.
_Avoid_: Backend-Fehlermeldungen als fertige UI-Uebersetzungsquelle, sprachabhaengige API-Contracts

**RoomFull UI Dictionary**:
Ein typisiertes Frontend-Woerterbuch fuer sichtbare RoomFull-UI-Texte pro Locale.
_Avoid_: verteilte Hardcoded-UI-Texte ohne Locale-Bezug, fruehe i18n-Library-Abhaengigkeit ohne Bedarf

**Copy Workbench**:
Die typisierten Locale-Dictionaries dienen zugleich als kompakte Arbeitsflaeche, um sichtbare UI-Copy gemeinsam zu pruefen und zu schaerfen.
_Avoid_: separate Copy-Listen neben der technischen Uebersetzungsquelle, flache unsortierte Textsammlungen

**UI Localization Scope**:
Die erste i18n-Ausbaustufe uebersetzt sichtbare Frontend-Texte und Metadaten, waehrend Backend-Contracts, Enum-Werte und gespeicherte Daten sprachstabil bleiben.
_Avoid_: uebersetzte API-Codes, lokalisierte Datenbankinhalte im ersten Slice, Backend-Fehlertexte als fertige UI-Copy

**UI Copy Voice**:
Die sichtbare Frontend-Copy darf nutzerorientierter und produktiger sein als Code-, API- und Domaenenbegriffe, wird aber je UI-Flaeche bewusst entschieden.
_Avoid_: Backend-Fachbegriffe ungefiltert als Customer-Copy, vorab festgelegte Marketing-Sprache ohne Kontext

**I18n Slice 1**:
Der erste i18n-Lieferschnitt umfasst technische Locale-Infrastruktur, kanonische lokalisierte Routen und den oeffentlichen Booking-Einstieg bis zur Auth-Kante.
_Avoid_: komplette Admin-, Account- und Booking-Historie-Uebersetzung im ersten Schritt

**I18n Translation Transition**:
Ein bewusster Zwischenzustand, in dem alle Frontend-Routen unter `de` und `en` funktionieren, aber noch nicht migrierte Bereiche voruebergehend deutsche UI-Copy behalten duerfen.
_Avoid_: Blockieren lokalisierter Routen fuer noch nicht uebersetzte Bereiche, Mischsprache als Zielzustand

**Booking Options Page**:
Die schlanke Buchungsübersicht `/booking-options`, auf der Customers eine BookingOption-Kategorie auswählen und in die passende Detailauswahl einsteigen.
_Avoid_: Marketing-Seite, allgemeine Service-Erklärung, alle konkreten Varianten gleichzeitig anzeigen

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

**Booking Time Grid**:
Alle Bookings nutzen ein globales 15-Minuten-Zeitraster: Start und Ende müssen auf Rasterpunkten liegen. UnitTypes unterscheiden sich über Dauergrenzen, nicht über eigene Raster. Das Backend erzwingt diese Regel; die Create Booking Page bietet nur erlaubte Start- und Endzeiten an.
_Avoid_: beliebige Minutenwerte, UnitType-spezifische Raster, nur UI-seitige Rasterung, gespeicherte TimeSlot-Objekte

**Today Booking Start Rule**:
Für Buchungen am aktuellen Tag ist die erste auswählbare Startzeit der nächste zukünftige Punkt im Booking Time Grid.
_Avoid_: zusätzliche Pufferzeit ohne Fachgrund, Startzeiten in der Vergangenheit

**Booking End Time Selection**:
Nach gewählter Startzeit bietet die Create Booking Page nur Endzeiten an, die die Duration Policy erfüllen und nicht über die nächste blockierende Buchung hinausreichen.
_Avoid_: Endzeiten, die einen belegten Zeitraum überspringen oder eine nicht zusammenhängende Verfügbarkeit suggerieren

**Booking Availability Contract**:
Die Create Booking Page nutzt einen gemeinsamen Availability-Contract für Direct Booking und Hot-Desk-Auto-Assign. Der Request beschreibt entweder eine konkrete Unit oder einen Area-/UnitType-Kontext; die Response liefert Tagesraster, Öffnungszeiten, Availability Slots und blockierende Intervalle. Availability Slots und blockierende Intervalle nutzen lokale `HH:mm`-Zeiten; das Datum steht separat im Contract.
_Avoid_: Frontend rekonstruiert Modus-spezifische Verfügbarkeit aus unterschiedlichen Rohdaten

**Availability Slot**:
Ein berechnetes, nicht gespeichertes verfügbares Zeitfenster im Booking Availability Contract. Ein Availability Slot hat lokale `HH:mm`-Start-/Endzeiten, verfügbare Unit-Anzahl und reserviert nichts; das zugehörige Datum steht separat im Contract.
_Avoid_: Slot als gespeichertes Fachobjekt, Slot als Synonym für Booking

**Custom Calendar**:
Ein eigener Kalender fuer den Booking Flow, der erlaubte Tage sichtbar macht und nicht buchbare Tage blockiert.
_Avoid_: nativer Browser-Datepicker fuer fachlich markierte Booking-Tage

**Calendar UI Base**:
Die wiederverwendbare Kalenderbasis liegt fachlich neutral in `shared/ui`; Booking-spezifische Bedeutungen wie Verfuegbarkeit, Belegung oder eigene Bookings werden in Features oder Widgets darueber komponiert.
_Avoid_: Feature-interne Kalenderkomponenten zwischen Slices importieren oder fachliche Booking-Regeln in `shared` verlagern

**Direct Booking Calendar State**:
Der Custom Calendar kann bei direkter Unit-Buchung belegte und voll belegte Tage anhand der Unit-Belegung markieren.
_Avoid_: belegte Direct-Booking-Tage erst nach versteckter Datumsauswahl sichtbar machen

**Auto-Assign Calendar Scope**:
Bei Hot-Desk-Auto-Assign blockiert der Custom Calendar fachlich unmoegliche Tage; zeitbezogene Area-Verfügbarkeit wird erst nach Datumsauswahl als Tagesraster geprüft.
_Avoid_: freie Hot-Desk-Verfuegbarkeit ohne Zeitraum behaupten

**Direct Booking Day Occupancy Display**:
Bei direkter Unit-Buchung zeigt die UI nach Datumsauswahl alle Rasterpunkte und markiert belegte Zeiten sichtbar als blockiert.
_Avoid_: blockierte Zeiten still ausblenden

**Booking Start Time Selection**:
Die Startzeit-Auswahl zeigt Rasterpunkte sichtbar an; belegte, vergangene oder fachlich ungültige Startzeiten werden deaktiviert statt ausgeblendet.
_Avoid_: versteckte Lücken in der Zeitliste

**Hot Desk Availability Preview Scope**:
Hot Desk lädt nach Datumsauswahl eine Area-Availability-Preview als Tagesraster für den gewählten Area-/UnitType-Kontext. Die Preview deaktiviert Start- und Endzeiten ohne verfügbare Hot-Desk-Unit; der Submit bleibt trotzdem die finale race-sichere Auto-Assign-Prüfung.
_Avoid_: Glücksspiel-UX mit erstem Verfügbarkeitscheck beim Submit, Preview als finale Reservierung missverstehen

**Hot Desk Availability Preview Result**:
Die Hot-Desk-Preview liefert für den gewählten Tag Availability Slots auf dem Booking Time Grid inklusive `availableUnitCount`, aber keine konkreten Unit-IDs.
_Avoid_: Auto-Assign durch manuelle Unit-Auswahl oder Unit-ID-Leakage unterlaufen

**Availability Count Display**:
`availableUnitCount` wird bei Hot Desk dezent angezeigt, weil mehrere Units verfügbar sein können. Bei Direct Booking wird die Anzahl nur intern für enabled/disabled genutzt.
_Avoid_: Direct Booking mit irrelevanter `0/1`-Kapazitätsanzeige überfrachten

**Create Booking Frontend Placement**:
Die App-Route `/bookings/new` bleibt dünn; interaktive Buchungslogik liegt in `features/booking/create-booking`, Booking-Requests in `entities/booking/api`.
_Avoid_: God-Page mit Formular-, API- und Fehlerlogik

**Booking Time Picker Placement**:
Die fachliche Zeitwahl liegt als eigene UI-Komponente in `features/booking/create-booking`, weil sie Duration Policy, Booking Time Grid und Availability Slots kennt.
_Avoid_: Booking-Zeitlogik in `shared` oder direkt in der App-Route

**Create Booking Success Destination**:
Nach erfolgreicher Buchung landet der Customer auf `/me/bookings?created=1` und sieht dort einen ruhigen Success-Hinweis.
_Avoid_: separate Confirmation-Seite im MVP

**Account Settings**:
Ein geplanter Bereich fuer angemeldete Users, der User- und Login-nahe Einstellungen wie Profilanzeige, Name oder Passwort buendelt.
_Avoid_: Booking-Fachlogik, Admin-Verwaltung, lose Header-Idee ohne festen Produktplatz

**Account Overview**:
Die erste V1-Ausbaustufe der Account Settings als geschuetzte Nur-Lese-Ansicht `/me/account` fuer Name, E-Mail, Rolle und Registrierungsdatum jedes angemeldeten Users.
_Avoid_: eigener Account-Endpoint, Nutzeraktion, Profilbearbeitung, Passwortaenderung oder neue Account-Sicherheitslogik im ersten Slice

**Frontend Session**:
Der aktuelle Auth-Zustand der laufenden Frontend-App inklusive angemeldetem Session-User, Ladezustand und Logout-Moeglichkeit.
_Avoid_: einzelne Widgets oder Pages lesen Auth-Zustand direkt aus Token Storage

**Session User**:
Die fuer die laufende Frontend Session benoetigten User-Daten inklusive Registrierungsdatum. Er ist bewusst vom vollstaendigen fachlichen **User** entkoppelt.
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

**My Bookings View Modes**:
Die Customer-Sicht "Meine Buchungen" bietet drei Darstellungen derselben eigenen Bookings: Karten als ruhiger Default, Liste als kompakte Arbeitsansicht und Kalender als visuelle Monatsansicht.
_Avoid_: getrennte Datenquellen oder unterschiedliche fachliche Bedeutung pro Ansicht

**My Bookings View State**:
Der gewaehlte View Mode fuer "Meine Buchungen" wird ueber den URL-Queryparameter `view` abgebildet, damit die Ansicht reload-stabil und teilbar bleibt. Ungueltige Werte fallen auf die Kartenansicht zurueck.
_Avoid_: rein lokaler View-State ohne URL-Reproduktion

**My Bookings Section Grouping**:
Die Ansichten in "Meine Buchungen" behalten die fachliche Trennung zwischen anstehenden und abgeschlossenen Bookings bei; der View Mode veraendert nur die Darstellung innerhalb der jeweiligen Gruppe.
_Avoid_: Kalender- oder Listenansicht als ungegliederte Gesamtsicht aller eigenen Bookings

**My Bookings List View**:
Die Listenansicht in "Meine Buchungen" ist eine kompakte Darstellung mit denselben Customer-Aktionen wie die Kartenansicht: Kalenderexport fuer aktive anstehende Bookings und Stornierung fuer stornierbare eigene Bookings.
_Avoid_: Liste als read-only Sonderansicht oder als anderer Rechtekontext

**My Bookings Calendar View**:
Die Kalenderansicht in "Meine Buchungen" zeigt eigene Bookings als farbige UnitType-Marker am jeweiligen Kalendertag. Ein Tag zeigt zunaechst bis zu drei Marker direkt und fasst weitere Bookings als Ueberlauf zusammen. Tage mit Bookings sind auswaehlbar; darunter erscheinen alle Bookings des gewaehlten Tages in der kompakten Listenansicht. Auf Desktop duerfen Marker Text zeigen, auf Mobile bleiben sie textlose Farbbalken.
_Avoid_: Kalender als neue Availability-Pruefung oder als anderer Booking-Contract

**My Bookings Action Parity**:
Karten-, Listen- und Kalenderansicht bieten fuer eine eigene Booking dieselben verfuegbaren Customer-Aktionen; Unterschiede liegen nur in Navigation und visueller Dichte.
_Avoid_: Aktionen nur in einer Ansicht auffindbar machen

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

**Customer Contact**:
Ein geschuetzter Customer-Kanal fuer Fragen, Feedback und Kritik zu RoomFull.
_Avoid_: oeffentliches Visitor-Kontaktformular, Admin-interner Supportkanal

**Customer Contact Request**:
Eine vom Customer abgesendete und im Backend gespeicherte Kontaktanfrage ohne E-Mail-Versand.
_Avoid_: reine Frontend-Nachricht, externe E-Mail-Integration im ersten Slice

**Contact Request Type**:
Die fachliche Kategorie einer Customer Contact Request: Frage, Feedback oder Kritik.
_Avoid_: freie unstrukturierte Kategorien, technische Ticket-Prioritaet im Customer-Formular

**Customer Contact Entry**:
Der Einstieg zu Customer Contact liegt im Profilmenue, in Account Settings und optional kontextuell in "Meine Buchungen".
_Avoid_: Top-Level-Hauptnavigation neben "Meine Buchungen", public Footer-Link

**Admin Contact Inbox**:
Eine Admin-Sicht auf eingegangene Customer Contact Requests, sortier- und filterbar nach Contact Request Type und Eingang.
_Avoid_: E-Mail-Postfach als primaerer Admin-Workflow, Kontaktanfragen nur auf dem Dashboard verstecken

**Admin Contact Inbox Scope**:
Die erste Admin Contact Inbox erlaubt Lesen, Filtern und als gelesen markieren, aber keine Antwortfunktion.
_Avoid_: Support-Chat, E-Mail-Versand, Customer-Benachrichtigungen im ersten Slice

**Contact Request Read State**:
Der Lesestatus einer Customer Contact Request ist systemweit `ungelesen` oder `gelesen`, nicht pro Admin getrennt.
_Avoid_: per-Admin-Lesestatus im ersten Support-Slice

**Admin Unread Contact Indicator**:
Ein dezenter Admin-Hinweis auf neue ungelesene Customer Contact Requests im Header oder Admin-Einstieg.
_Avoid_: laute globale Alerts fuer Customers, ungelesene Nachrichten ohne Admin-Kontext

**Admin Booking Permission**:
In V1 darf Admin ebenfalls Bookings erstellen und Bookings lesen (Übersicht), auch als operative HelpDesk-Rolle.
_Avoid_: Admin nur als Lesesicht

**Admin Booking Creation Entry**:
Admins nutzen fuer operative oder testweise Booking-Erstellung bewusst den normalen Customer-Flow ueber `/booking-options`; es gibt in V1 keinen separaten Admin-Einstieg fuer "Buchungsflow pruefen".
_Avoid_: Admin-Dashboard oder Header mit einem zusaetzlichen Pruef-/Testbooking-Shortcut ueberladen

**Admin Unit Management**:
Ein Admin verwaltet im MVP das buchbare Inventar als BookableUnits: Name, Beschreibung, Kapazitaet, UnitType, Area, Sortierung und Aktivierungsstatus.
_Avoid_: Admin Unit Management als Rohdatenbank-Editor oder als Pflege von UnitType-Buchungsregeln

**Admin Unit Inventory View**:
Die Admin-Unit-Ansicht zeigt aktive und deaktivierte BookableUnits, weil sie Inventarverwaltung ist und nicht die Customer-facing Public-Unit-Liste.
_Avoid_: deaktivierte Units im Admin-Bereich unsichtbar machen

**Admin Unit Activation State**:
Admins duerfen BookableUnits deaktivieren und reaktivieren; Reaktivierung ist eine Statusaenderung derselben BookableUnit, kein neues Fachobjekt und kein separater Use Case.
_Avoid_: deaktivierte Units neu anlegen muessen

**Unit Deactivation Meaning**:
Eine deaktivierte BookableUnit gehoert bis zur Reaktivierung nicht zum neu buchbaren Inventar; Deaktivierung ist kein Zeitraumblocker und storniert bestehende Bookings nicht automatisch.
_Avoid_: Deaktivierung als Wartungsfenster mit Start- und Endzeit verstehen

**Unit Blockout**:
Eine zeitlich begrenzte Sperrung einer ansonsten aktiven BookableUnit waere ein eigener spaeterer Use Case und gehoert nicht zum MVP Admin Unit Management.
_Avoid_: temporaere Sperrzeiten in `isActive` oder Deaktivierung hineinmodellieren

**Admin Unit Editable Fields**:
Admins duerfen an BookableUnits Name, Beschreibung, Kapazitaet, UnitType, Area, DisplayOrder und Aktivierungsstatus bearbeiten. Technische IDs, Zeitstempel, bestehende Bookings und UnitType-Dauerregeln sind nicht Teil des Unit-Formulars.
_Avoid_: historische Bookings oder systemweite Buchungsregeln im Unit-Editor veraendern

**Admin Unit Edit Flow**:
Admins bearbeiten BookableUnits ueber ein Formular-Panel statt per Inline-Editing in der Tabelle; Tabelle bleibt Uebersicht, Formular buendelt Validierung und Speichern.
_Avoid_: viele editierbare Tabellenzellen als primaeren Bearbeitungsmodus

**Admin Unit Form Modes**:
Das Admin-Unit-Formular wird fuer Anlegen und Bearbeiten wiederverwendet; Modus und vorausgefuellte Werte unterscheiden den Create- vom Edit-Fall.
_Avoid_: getrennte Formulare mit duplizierter Validierung fuer neue und bestehende Units

**Admin Unit Context**:
Das Admin-Unit-Formular bezieht UnitTypes und Areas aus einem Admin-spezifischen Context-Endpoint, nicht aus Customer-facing BookingOptions.
_Avoid_: Public BookingOptions als Quelle fuer Admin-Auswahlwerte zweckentfremden

**Admin Unit Filters**:
Die Admin-Unit-Tabelle filtert im MVP nach Status, UnitType und optional einfacher Namenssuche. Default ist aktive Units aller UnitTypes.
_Avoid_: komplexe Tabellenlogik oder Analytics-Filter im Inventar-MVP

**UnitType Policy Management**:
Die Dauerregeln eines UnitType sind im MVP systemverwaltet und werden nicht im Admin Unit Management bearbeitet.
_Avoid_: Mindest- oder Maximaldauer einzelner BookableUnits im Admin-Formular pflegen

**Admin Booking Operations View**:
Eine Admin-Sicht fuer den Tagesbetrieb, die anstehende Bookings priorisiert und abgeschlossene oder stornierte Bookings nur bei Bedarf einblendet.
_Avoid_: unstrukturierte Gesamtliste aller Bookings als Default, Analytics-Dashboard

**Admin Booking Calendar View**:
Ein spaeterer Admin-Ausbau zur visuellen Tages- oder Wochenansicht von Bookings.
_Avoid_: V1-Default fuer Listenarbeit, Ersatz fuer die Operations View

**Admin Booking Filter**:
Die V1-Filter der Admin Booking Operations View: Heute, Anstehend, Abgeschlossen, Storniert und Alle.
_Avoid_: unklare Mischung aus Status und Zeitraum ohne definierte Bedeutung

**Admin Booking Sort Order**:
Die Sortierung je Admin Booking Filter: Anstehend und Heute nach Startzeit aufsteigend, Abgeschlossen nach Endzeit absteigend, Storniert nach Aktualisierung absteigend.
_Avoid_: eine globale Sortierung fuer alle operativen Situationen

**Admin Booking Summary**:
Kleine operative Kennzahlen der Admin Booking Operations View fuer Heute, Anstehend und Storniert.
_Avoid_: Charts oder Analytics-Auswertung in V1

**Admin Analytics Dashboard**:
Ein V2-Dashboard auf `/admin`, das Buchungs- und Inventardaten als auswertbare Kennzahlen und Charts darstellt.
_Avoid_: reine Arbeitsbereich-Navigation, V1-Operationsliste, dekorative Graphen ohne Admin-Entscheidungswert

**Admin Analytics Primary Question**:
Die zentrale V2-Frage des Admin Analytics Dashboard ist, wie sich Nachfrage ueber Zeit entwickelt.
_Avoid_: Revenue-Auswertung ohne Pricing, reine Inventarverwaltung, Chart-Auswahl ohne Leitfrage

**Admin Booking Demand**:
Die V2-Nachfrage-Metrik fuer Analytics ist die Anzahl aktiver Bookings gruppiert nach Booking-Startdatum.
_Avoid_: Availability-Checks, Seitenaufrufe, gebuchte Stunden als erste Nachfrage-Definition

**Admin Analytics Default Window**:
Das V2-Default-Fenster fuer Analytics umfasst 30 Tage zurueck und 30 Tage voraus, jeweils nach Booking-Startdatum.
_Avoid_: rein historische Auswertung als Default, Erstellzeitpunkt der Booking als Nachfragezeitpunkt

**Admin Analytics Chart Set**:
Die erste V2-Ausbaustufe zeigt Nachfrageverlauf, Nachfrage nach UnitType und Stornoquote im gewaehlten Zeitraum.
_Avoid_: Inventarstatus als Hauptchart, Revenue-Charts ohne Pricing, dekorative Charts ohne Nachfragebezug

**Admin Booking Query**:
Der Backend-Contract fuer die Admin Booking Operations View mit Query-Filtern fuer Status, Zeitraum und Limit.
_Avoid_: alle historischen Bookings ungefiltert laden und nur clientseitig sortieren

**Admin Booking Search**:
Eine operative Suche in der Admin Booking Operations View nach Customer-Name oder Customer-E-Mail.
_Avoid_: Volltextsuche ueber Unit-Namen, Datumswerte oder alle Booking-Felder

**Admin Booking Date Range**:
Die `from`- und `to`-Querywerte der Admin Booking Query als inklusive Kalendertage im Format `YYYY-MM-DD`.
_Avoid_: Uhrzeitfilter in V1

**Admin Booking Query Default Window**:
Das V1-Default-Fenster der Admin Booking Query: 30 Tage und `limit=100`. Anstehende Bookings laufen ab heute vorwärts, historische Filter rückblickend, `all` umfasst Vergangenheit und Zukunft um heute herum.
_Avoid_: unlimitierte Admin-Listen

**Admin Booking View Status**:
Der `status`-Querywert der Admin Booking Query: `upcoming`, `today`, `completed`, `cancelled` oder `all`.
`all` bedeutet alle Booking-Status im gewählten Zeitraum, nicht nur Historie.
_Avoid_: rohe DB-Statuswerte `ACTIVE` und `CANCELLED` als alleinige Admin-Filter

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
- Die **Home Page** ist der Service-Einstieg; die **Booking Options Page** ist der fokussierte Buchungseinstieg.
- Die **Home Page** zeigt anonymen Visitors "Jetzt buchen", "Registrieren" und "Einloggen"; angemeldeten Users zeigt sie "Jetzt buchen" und "Meine Buchungen".
- Angebots-Teaser auf der **Home Page** fuehren zu `/booking-options/[slug]`, nicht direkt zu `/bookings/new`.
- Die **Home Page** nennt BookingOption-Teaser in der UI "Arbeitsbereiche".
- Die **Home Page** nutzt **BookingOptions** als Datenbasis, praesentiert sie aber kuratiert als Service-Angebote.
- Die **Home Page** teasert Varianten nur an; konkrete Area- oder Unit-Varianten werden erst auf `/booking-options/[slug]` ausgewaehlt.
- Die **Home Page** braucht visuelle Arbeitsbereich-Signale; der erste Slice darf vorhandene Assets nutzen, soll aber spaetere Medien je Arbeitsbereich ermoeglichen.
- Die **Booking Options Page** bleibt eine Kategorie-Übersicht; konkrete Area- oder Unit-Auswahl passiert auf `/booking-options/[slug]`.
- Die **Create Booking Page** ist der gemeinsame UI-Einstieg fuer beide Booking Request Modes.
- Der **Create Booking Entry Context** entscheidet, welcher Booking Request Mode vorbereitet wird.
- Der **Booking Context** ist die Backend-Quelle fuer die Darstellung und Validierung des Entry Context auf der Create Booking Page.
- **Booking Context Permission** trennt public Angebotsauswahl von auth-required Buchungsvorbereitung.
- **Booking Context Shape** unterscheidet direkte Unit-Buchung und Hot-Desk-Auto-Assign eindeutig.
- **Booking Context Errors** grenzen Kontextvalidierung von späterer Zeit-/Konfliktprüfung ab.
- **Booking Availability Timing** trennt Angebots-/Kontextanzeige von zeitbezogener Belegung.
- **Booking Time Grid** hält das Zeitraster als fachliche Zeitraumregel getrennt von gespeicherten TimeSlot-Objekten.
- **Booking Duration Rule** und **Booking Time Grid** ergänzen sich: Dauergrenzen kommen vom UnitType, Rasterpunkte gelten global.
- **Today Booking Start Rule** schränkt das Booking Time Grid am aktuellen Tag auf zukünftige Rasterpunkte ein.
- **Booking End Time Selection** bildet nur zusammenhängend freie Buchungszeiträume ab.
- **Booking Availability Contract** vereinheitlicht die Zeitfenster-Berechnung für Direct Booking und Hot-Desk-Auto-Assign.
- **Availability Slot** ist ein temporäres Preview-Ergebnis und kein gespeichertes Fachobjekt.
- **Custom Calendar** ersetzt den nativen Browser-Datepicker im Booking Flow.
- **Direct Booking Calendar State** erlaubt belegte/voll belegte Tage fuer konkrete Units sichtbar zu machen.
- **Auto-Assign Calendar Scope** trennt die datumlose Kalenderansicht von der zeitbezogenen Hot-Desk-Preview.
- **Direct Booking Day Occupancy Display** macht blockierende Intervalle bei konkreten Units sichtbar.
- **Booking Start Time Selection** macht ungültige Startzeiten sichtbar, ohne sie auswählbar zu machen.
- **Hot Desk Availability Preview Scope** reduziert Frust vor dem Submit, ersetzt aber nicht die finale Auto-Assign-Prüfung.
- **Hot Desk Availability Preview Result** erhält den Auto-Assign-Charakter, weil nur Verfügbarkeitsanzahlen, aber keine konkreten Units sichtbar werden.
- **Availability Count Display** macht Hot-Desk-Verfügbarkeit verständlicher, ohne Direct Booking unnötig zu verkomplizieren.
- **Create Booking Frontend Placement** hält Route, Nutzeraktion und API-Anbindung getrennt.
- **Booking Time Picker Placement** kapselt fachliche Zeitwahl im Create-Booking-Feature.
- **Create Booking Success Destination** schließt den BookingFlow in der eigenen Buchungsliste ab.
- **Upcoming Booking** und **Closed Booking** strukturieren die eigene Buchungsliste anhand von Status und Buchungsende.
- **Booking Context Delivery Order** stellt sicher, dass die Create Booking Page direkt gegen den langfristigen Contract gebaut wird.
- **Account Settings** sind als fester Bereich fuer angemeldete Users im Header geplant; **Account Overview** ist die erste Nur-Lese-Ausbaustufe davon.
- Der Header verlinkt den **Account Overview** fuer angemeldete Users alltagssprachlich als "Mein Account".
- **Account Overview** wird in V1 aus der **Frontend Session** gespeist und bekommt keinen eigenen Backend-Endpoint.
- **Account Overview** ist eine Informationsansicht, keine Account-Feature-Aktion.
- **Account Overview** ist fuer alle angemeldeten Rollen sichtbar; Admin-Verwaltung bleibt ein eigener Bereich.
- **Account Overview** zeigt das Registrierungsdatum als "Nutzer seit" an.
- **Account Overview** darf die nächste **Upcoming Booking** als Navigation zur eigenen Buchungsliste zeigen, bleibt aber selbst Account-Inhalt.
- Logout bleibt Teil des **Session Lifecycle** im Header und gehoert in V1 nicht auf **Account Overview**.
- Profilbearbeitung, Passwortaenderung und Booking-Praeferenzen sind spaetere eigene Account-Feature-Slices, keine Platzhalter in **Account Overview**.
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
- **Customer Contact** gehoert zum Customer Self-Service und setzt Login mit Customer-Rolle voraus.
- **Customer Contact Request** wird im Backend gespeichert und ueber die **Admin Contact Inbox** sichtbar.
- **Contact Request Type** strukturiert Customer-Anliegen, ohne bereits ein vollstaendiges Ticket-System einzufuehren.
- **Customer Contact Entry** haelt Support account-nah und vermeidet zusaetzliche globale Navigation.
- **Admin Contact Inbox Scope** haelt den ersten Support-Slice bei Intake und Admin-Lesesicht.
- **Contact Request Read State** ist global, damit der erste Support-Slice ohne Admin-Collaboration-Modell bleibt.
- **Admin Unread Contact Indicator** macht neue Customer Contact Requests fuer Admins sichtbar, ohne E-Mail-Versand vorauszusetzen.
- **Admin Booking Permission** erlaubt operative Booking-Erstellung plus Lesesicht.
- **Admin Booking Creation Entry** haelt operative/testweise Admin-Buchungen im normalen Customer-Flow.
- **Admin Booking Operations View** strukturiert Admin-Lesesicht zuerst nach Tagesbetrieb und anstehenden Bookings.
- **Admin Booking Calendar View** ist ein spaeterer Zusatz zur Operations View, kein V1-Default.
- **Admin Booking Filter** nutzt "Anstehend" als Default; "Heute" ist der operative Tagesfilter.
- **Admin Booking Sort Order** passt sich dem gewaehlten Filter an.
- **Admin Booking Summary** zeigt in V1 nur operative Zahlen, keine Graphs.
- **Admin Analytics Dashboard** ersetzt in V2 die reine `/admin`-Navigation durch entscheidungsorientierte Auswertungen.
- **Admin Analytics Primary Question** priorisiert Nachfrageentwicklung vor reiner Navigation oder Inventarpflege.
- **Admin Booking Demand** beantwortet die Nachfragefrage zuerst ueber aktive Bookings nach Startdatum.
- **Admin Analytics Default Window** verbindet historische Nutzung mit erwarteter Nachfrage.
- **Admin Analytics Chart Set** operationalisiert Nachfrageentwicklung ueber Verlauf, UnitType-Mix und Stornoquote.
- **Admin Booking Query** stuetzt Admin-Filter serverseitig, damit simulierte Daily-Traffic-Daten die UI nicht unkontrolliert aufblasen.
- **Admin Booking Search** ergaenzt die **Admin Booking Query** um Customer-Identitaet, waehrend **Admin Booking Date Range** Zeitraumfragen abbildet.
- **Admin Booking Date Range** filtert tageweise, nicht nach Uhrzeit.
- **Admin Booking Query Default Window** verhindert unlimitierte Admin-Listen.
- **Admin Booking View Status** mappt Admin-Filter auf DB-Status und Zeitlogik: upcoming, today, completed, cancelled, all.
- **Admin Cancel Scope** trennt V1 bewusst von späterem Admin-Fremd-Storno.

## Example dialogue

> **Dev:** "Ist ein Hot Desk bei uns ein Bereich mit vielen parallelen Plätzen?"
> **Domain expert:** "Nein. In V1 ist Hot Desk ein einzelner buchbarer Space, wie jeder andere UnitType auch."

## Flagged ambiguities

- "Hot Desk" wurde semantisch als Bereich interpretiert; aufgelöst: In RoomFull V1 bedeutet es ein einzelner buchbarer Platz.
- "Buchungen verwalten" bei Admin war unscharf; aufgelöst: In V1 darf Admin auch Buchungen erstellen (operativer HelpDesk-Fall).
- "Braucht Admin einen eigenen Einstieg zum Buchungsflow-Pruefen?" war offen; aufgelöst: nein, Admin nutzt den normalen Customer-Flow ueber `/booking-options`.
- "Admin darf stornieren" war unscharf; aufgelöst: kein Fremd-Storno in V1, aber explizit als späterer Ausbau vorgesehen.
- "Ist das Kontaktformular public oder role-gated?" war offen; aufgelöst: **Customer Contact** ist nur fuer eingeloggte Customers, nicht fuer Visitors oder Admins.
- "Wo liegt der Kontakt-Einstieg?" war offen; aufgelöst: Profilmenue, Account Settings und optional kontextuell in "Meine Buchungen", nicht als Top-Level-Hauptnavigation.
- "Soll Customer Contact E-Mails versenden?" war offen; aufgelöst: nein, Kontaktanfragen werden gespeichert und in einer **Admin Contact Inbox** sichtbar.
- "Ist der Lesestatus pro Admin oder global?" war offen; aufgelöst: globaler **Contact Request Read State** pro Anfrage.
- "Kann Admin im ersten Contact-Slice antworten?" war offen; aufgelöst: nein, nur lesen, filtern und als gelesen markieren.
- "Braucht Admin einen Hinweis auf neue Kontaktanfragen?" war offen; aufgelöst: ja, als **Admin Unread Contact Indicator**.
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
- "Ist ein TimeSlot ein Fachobjekt?" war offen; aufgelöst: nein, Bookings bleiben freie Zeiträume, müssen aber auf dem **Booking Time Grid** liegen.
- "Wie wird die Endzeit gewählt?" war offen; aufgelöst: nach Startzeit als Liste erlaubter Endpunkte.
- "Native Datepicker oder eigener Kalender?" war offen; aufgelöst: Booking Flow nutzt **Custom Calendar**, nicht den Browser-Datepicker.
- "Zeigt Custom Calendar Hot-Desk-Auslastung?" war offen; aufgelöst: nein, der Kalender blockiert ohne Zeitraum nur fachlich unmoegliche Tage.
- "Zeigt Hot Desk Area-Verfügbarkeit im MVP?" war offen; zuerst nein, später korrigiert: nach Datumsauswahl lädt Hot Desk eine Area-Availability-Preview als Tagesraster; Submit bleibt final.
- "Wo liegt Create-Booking-Formularlogik?" war offen; aufgelöst: Feature-Slice `features/booking/create-booking`.
- "Wohin nach erfolgreicher Buchung?" war offen; aufgelöst: `/me/bookings?created=1` ohne Booking-ID.
- "Settings im Header" war offen; aufgelöst: **Account Settings** sind ein eigener User-/Login-naher Bereich, nicht Teil des ersten Header-Slices und kein Ort fuer Booking-Fachlogik oder Admin-Verwaltung.
- "Editierbare Settings in V1?" war offen; aufgelöst: V1 startet mit **Account Overview** als Nur-Lese-Ansicht ohne Profilbearbeitung oder Passwortaenderung.
- "Route fuer Account Settings" war offen; aufgelöst: **Account Overview** nutzt `/me/account` passend zum bestehenden eigenen User-Bereich `/me/bookings`.
- "Label im Profil-Menue" war offen; aufgelöst: Der Link zu **Account Overview** heisst "Mein Account", nicht "Einstellungen".
- "Braucht Account Overview einen eigenen Backend-Endpoint?" war offen; aufgelöst: nein, V1 nutzt die bestehenden Session-User-Daten aus `GET /auth/me`.
- "Ist Account Overview eine Feature-Slice?" war offen; aufgelöst: nein, solange keine Account-Aktion wie Profilbearbeitung oder Passwortaenderung umgesetzt wird.
- "Ist Account Overview Customer-only?" war offen; aufgelöst: nein, der Bereich gilt fuer alle authentifizierten Users inklusive Admin.
- "Soll Account Overview das Registrierungsdatum zeigen?" war offen; aufgelöst: ja, als "Nutzer seit" aus dem Session User.
- "Gehoert Meine Buchungen in Account Overview?" war offen; aufgelöst: nicht als generischer Link, sondern als optionaler Einstieg über die nächste **Upcoming Booking**.
- "Soll Account Overview einen Logout-Button enthalten?" war offen; aufgelöst: nein, Logout bleibt im Header-Profilmenue.
- "Sollen spaetere Account Settings als Platzhalter sichtbar sein?" war offen; aufgelöst: nein, spaetere Einstellungen werden erst als eigene Feature-Slices sichtbar.
- "Was ist der Hauptjob der Admin-Buchungsuebersicht?" war offen; aufgelöst: **Admin Booking Operations View** fuer Tagesbetrieb und anstehende Bookings, kein Analytics-Dashboard als Default.
- "Soll Admin Bookings in V1 eine Kalenderansicht haben?" war offen; aufgelöst: nein, Kalender bleibt als spaeterer **Admin Booking Calendar View** vorgemerkt.
- "Welche Filter braucht Admin Bookings in V1?" war offen; aufgelöst: **Admin Booking Filter** mit Heute, Anstehend, Abgeschlossen, Storniert und Alle; Default ist Anstehend.
- "Wie sortiert Admin Bookings?" war offen; aufgelöst: **Admin Booking Sort Order** sortiert Anstehend/Heute nach Startzeit aufsteigend, Abgeschlossen nach Endzeit absteigend und Storniert nach Aktualisierung absteigend.
- "Braucht Admin Bookings Graphs in V1?" war offen; aufgelöst: nein, V1 nutzt **Admin Booking Summary** mit Heute, Anstehend und Storniert; Analytics/Graphs bleiben spaeter.
- "Sind Dashboard-Graphen V1-Polish oder V2-Feature?" war offen; aufgelöst: echtes **Admin Analytics Dashboard** als V2-Ausbau.
- "Welche Entscheidung soll das Admin Analytics Dashboard zuerst unterstuetzen?" war offen; aufgelöst: Nachfrageentwicklung verstehen.
- "Was zaehlt als Nachfrage im Analytics-Dashboard?" war offen; aufgelöst: Anzahl aktiver Bookings nach Booking-Startdatum.
- "Welchen Default-Zeitraum nutzt das Analytics-Dashboard?" war offen; aufgelöst: 30 Tage zurueck plus 30 Tage voraus nach Booking-Startdatum.
- "Welche Charts gehoeren in die erste Analytics-Version?" war offen; aufgelöst: Nachfrageverlauf, Nachfrage nach UnitType und Stornoquote.
- "Filtert Admin Bookings clientseitig oder backendseitig?" war offen; aufgelöst: backendseitig ueber **Admin Booking Query**, weil simulierte Daily-Traffic-Daten geplant sind.
- "Sind from/to Uhrzeitfilter?" war offen; aufgelöst: nein, **Admin Booking Date Range** nutzt inklusive Kalendertage im Format `YYYY-MM-DD`.
- "Welches Default-Fenster nutzt Admin Booking Query?" war offen; aufgelöst: **Admin Booking Query Default Window** nutzt 30 Tage und `limit=100`.
- "Was bedeutet status in Admin Booking Query?" war offen; aufgelöst: `status` ist **Admin Booking View Status**, nicht roher DB-Status.
- "Soll Admin Booking Search auch Datum oder Unit-Namen durchsuchen?" war offen; aufgelöst: nein, bewusst nur Customer-Name und Customer-E-Mail.
- "Zeigen Home und Buchen auf dieselbe Route?" war offen; aufgelöst: nein, `/` wird **Home Page** als Service-Einstieg, `/booking-options` wird **Booking Options Page** als fokussierter Buchungskatalog.
- "Ist Sprache Teil der URL oder nur UI-Zustand?" war offen; aufgelöst: RoomFull nutzt **Localized Routes** mit explizitem `de`- oder `en`-Segment und `de` als Default Locale.
- "Welche Sprache nutzt `/` ohne Sprachsegment?" war offen; aufgelöst: Root-Redirect nutzt aktive Sprachauswahl per Cookie vor Browserpräferenz vor Default Locale `de`.
- "Bleiben alte unlokalisierte Routes als zweiter Page-Baum bestehen?" war offen; aufgelöst: nein, RoomFull nutzt einen **Canonical Localized Route Tree**; unlokalisierte Pfade redirecten locale-aware.
- "Werden Route-Pfade und Slugs uebersetzt?" war offen; aufgelöst: nein, nur das Locale-Segment wird lokalisiert; restliche Route-Pfade und Slugs bleiben technisch stabil.
- "Duerfen interne Links rohe App-Pfade nutzen?" war offen; aufgelöst: nein, interne Links und programmatic navigation nutzen zentrale locale-aware Route-Helper.
- "Was passiert beim Sprachwechsel?" war offen; aufgelöst: **Language Switch** erhaelt aktuellen Pfad und Query und speichert die gewaehlte Locale.
- "Wie behandeln Auth-Flows den `next`-Parameter?" war offen; aufgelöst: **Localized Auth Redirect** erlaubt nur sichere interne lokalisierte App-Pfade und erhaelt die aktive Locale.
- "Wer liefert sichtbare Fehlertexte?" war offen; aufgelöst: globale **HTTP Error Pages** uebersetzen ihre Page-Copy per Locale; API-/Formfehler nutzen **Localized API Error Copy** im Frontend statt Backend-Messages als UI-Quelle.
- "Braucht der erste i18n-Slice stabile Backend-Application-Error-Codes?" war offen; aufgelöst: nein, Application Error Codes bleiben ein spaeteres Backend-Contract-Slice; i18n Slice 1 nutzt HTTP-Status, Flow-Kontext und Fallback-Copy.
- "Wo liegt i18n-Code im FSD?" war offen; aufgelöst: technische i18n- und Routing-Basis liegt in `shared`, der **Language Switch** als Nutzeraktion in einer Feature-Slice.
- "Eigene Dictionaries oder i18n-Library?" war offen; aufgelöst: RoomFull startet mit einem eigenen typisierten **RoomFull UI Dictionary** nach Next.js-App-Router-Muster statt `next-intl`.
- "Wie wird Dictionary-Vollstaendigkeit gesichert?" war offen; aufgelöst: `de` ist die strukturelle Dictionary-Quelle, `en` muss dieselbe Shape per TypeScript `satisfies typeof de` erfuellen.
- "Sollen Locale-Dateien JSON oder TypeScript sein?" war offen; aufgelöst: RoomFull nutzt TypeScript-Dictionaries, weil sie als typgepruefte **Copy Workbench** fuer Mensch und Agent dienen.
- "Wie werden Dictionary-Keys gruppiert?" war offen; aufgelöst: nach UI-Flaechen wie Home, Header, Footer, Booking Options, Auth und Errors statt nach technischen Domaenenobjekten.
- "Was wird im ersten i18n-Slice uebersetzt?" war offen; aufgelöst: **UI Localization Scope** umfasst Frontend-UI-Texte und Metadaten, nicht Backend-Contracts, Enum-Werte oder gespeicherte Daten.
- "Muss UI-Copy die Backend-Fachbegriffe spiegeln?" war offen; aufgelöst: nein, **UI Copy Voice** darf produktiger und nutzernaeher sein; konkreter Sprech wird situativ pro UI-Flaeche entschieden.
- "Soll i18n Slice 1 die komplette App uebersetzen?" war offen; aufgelöst: nein, **I18n Slice 1** liefert Infrastruktur und den oeffentlichen Booking-Einstieg; Admin, Account und weitere Booking-Ansichten folgen in kleineren Slices.
- "Was passiert mit noch nicht uebersetzten Bereichen unter `/en`?" war offen; aufgelöst: waehrend **I18n Translation Transition** bleiben sie erreichbar und duerfen temporaer deutsche UI-Copy zeigen.
- "Soll Booking Options alle Varianten direkt zeigen?" war offen; aufgelöst: nein, `/booking-options` bleibt schlanke Kategorie-Übersicht, Details bleiben unter `/booking-options/[slug]`.
- "Welche CTAs zeigt die Home Page?" war offen; aufgelöst: anonym `Jetzt buchen`, `Registrieren`, `Einloggen`; angemeldet `Jetzt buchen`, `Meine Buchungen`.
- "Duerfen Home-Angebote direkt buchen?" war offen; aufgelöst: nein, Home-Angebots-Teaser verlinken auf `/booking-options/[slug]`; erst dort beginnt die konkrete Area- oder Unit-Auswahl.
- "Wie heissen Angebote auf der Home Page?" war offen; aufgelöst: UI nennt sie "Arbeitsbereiche", fachlich bleiben es **BookingOptions**.
- "Sind Home-Arbeitsbereiche statisch oder API-basiert?" war offen; aufgelöst: Home nutzt **BookingOptions** als Datenbasis und kuratiert deren Praesentation.
- "Wo werden Varianten ausgewaehlt?" war offen; aufgelöst: Home teasert Varianten nur an, konkrete Variantenwahl passiert auf `/booking-options/[slug]`.
- "Braucht Home visuelle Medien?" war offen; aufgelöst: ja, Home braucht klare Arbeitsbereich-Signale; erster Slice kann vorhandene Assets nutzen und spaeter Bilder aufnehmen.
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
