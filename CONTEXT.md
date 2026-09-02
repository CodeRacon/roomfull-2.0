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

**Mobile Client**:
RoomFull Mobile ist ein nativer Client desselben RoomFull-Produkts und nutzt dieselbe Domänensprache sowie dieselben Backend-Contracts; Unterschiede liegen in UX und technischem Client-Verhalten, nicht in Fachregeln.
_Avoid_: eigenständiges Mobile-Produkt mit abweichenden Fachbegriffen oder Sonderlogik

**Mobile Customer Feature Parity**:
RoomFull Mobile uebertraegt innerhalb des ausdruecklich vereinbarten Customer-Self-Service-Scope den vorhandenen Funktionsumfang der WebApp; mobile Unterschiede betreffen Darstellung und native Interaktion, waehrend Admin und explizit vertagte Bereiche ausserhalb von V1 bleiben.
_Avoid_: mobile-only Produktfeatures, automatische Vollparitaet mit Admin oder stilles Streichen vorhandener Customer-Funktionen innerhalb des vereinbarten Scope

**Mobile Teams V1 Scope**:
RoomFull Mobile V1 umfasst My Teams mit Team- und Team-Member-Verwaltung sowie den optionalen Team Booking Share fuer eligible eigene Bookings; beides bildet einen zusammengehoerigen Customer-Self-Service-Bereich und folgt nach dem mobilen Booking-Kern.
_Avoid_: isolierte Kontaktverwaltung ohne Share-Nutzen, Kopplung an das Erstellen einer Booking oder Verschiebung allein aufgrund eines veralteten Web-Fertigstellungsstands

**Mobile Team Booking Share Flow**:
Der mobile Team Booking Share ist ein zweistufiger fluechtiger Flow im selben Share-Kontext: `Empfaenger vorbereiten` umfasst Team, Member und persoenliche Nachricht; `Einladung uebergeben` bietet das bereite vierteilige Share Package. Schritt 2 erlaubt die Rueckkehr zur Korrektur, ohne Auswahl oder Nachricht an der Booking zu speichern.
_Avoid_: ein einziger wachsender Langscreen, Share Package vor mindestens einem Empfaenger oder persistierter Share-Entwurf

**Mobile Team Share Booking Summary**:
Beide Schritte des mobilen Team Booking Share zeigen denselben kompakten read-only Booking-Kontext mit Raumname sowie Datum und Uhrzeit direkt; UnitType und Kapazitaet bleiben sekundaer sichtbar oder aufklappbar.
_Avoid_: grosse dauerhafte Kontext-Card, versteckte Booking-Identitaet oder Darstellung als editierbarer Booking-Schritt

**Mobile Team Share Handoff Notice**:
Der mobile Share zeigt den kompakten Hinweis zur Systemgrenze erst in `Einladung uebergeben` direkt vor den vier Aktionen: RoomFull versendet nicht, Empfaenger gehoeren in BCC und die `.ics` wird bei Bedarf manuell angehaengt.
_Avoid_: grosses Hinweis-Panel vor der Empfaengervorbereitung, Versandversprechen oder versteckter BCC-/Anhang-Hinweis nach den Aktionen

**Mobile Team Share Team Selection**:
`Team auswaehlen` oeffnet mobil ein alphabetisches Sheet mit Teamname und Member-Anzahl; nicht leere Teams sind vollflaechig waehbar, leere Teams sichtbar deaktiviert mit Einstieg zu `Kontakte hinzufuegen`, und kein Team wird automatisch vorausgewaehlt.
_Avoid_: alle bis zu 20 Teams dauerhaft inline, leere Teams verstecken oder ein einziges verwendbares Team ohne bewusste Auswahl laden

**Mobile Team Share Recipient Selection**:
Schritt 1 zeigt kompakt die ausgewaehlte Anzahl; `Empfaenger bearbeiten` oeffnet einen vollflaechigen fluechtigen Unterzustand mit alphabetischer performanter Memberliste, Checkboxen, Anzahl sowie `Alle auswaehlen`, `Alle abwaehlen`, `Abbrechen` und `Uebernehmen`. Initial sind alle Members des bewusst gewaehlten Teams ausgewaehlt.
_Avoid_: bis zu 50 Checkboxen dauerhaft im Share-Screen, Member-Modal ohne eigene Scrollflaeche oder Persistenz der Auswahl am Team

**Mobile Team Share Personal Message**:
Die optionale persoenliche Nachricht startet mobil mit etwa drei Zeilen, waechst bis zu einer begrenzten Hoehe und scrollt danach intern; der 500-Zeichen-Zaehler wird erst nahe dem Limit betont und der Text bleibt bei Team- und Schrittwechsel nur innerhalb des laufenden Share-Flows erhalten.
_Avoid_: dauerhaft grosses Textfeld, verstecktes Limit oder Beibehalten als persistierte Booking- oder Team-Eigenschaft missverstehen

**Mobile Team Share Capacity Warning Placement**:
Uebersteigt die ausgewaehlte Member-Anzahl die BookableUnit-Kapazitaet, zeigt Mobile die nicht blockierende Warnung unter der Empfaengerzusammenfassung in Schritt 1 und in der vollflaechigen Auswahl; `Weiter` bleibt ab einem Member erlaubt und der Customer wird nicht automatisch mitgezaehlt.
_Avoid_: Warnung nur nach der Auswahl, blockierter Share oder implizite Annahme ueber die Teilnahme des Customers

**Mobile Team Share Package Actions**:
`Einladung uebergeben` zeigt BCC-Adressen, Betreff, Einladungstext und Team-Share-Kalenderdatei als vier ruhige getrennte Aktionszeilen mit lokalem Feedback; Textaktionen kopieren einzeln, die Kalenderdatei oeffnet die native Freigabe.
_Avoid_: vier dominante Grossbuttons, gemeinsamer Senden-Button, globales unzuordenbares Feedback oder behaupteter Versandstatus

**Mobile Team Share Resume**:
Wird RoomFull waehrend der externen Uebergabe nur in den Hintergrund gelegt, bleibt der laufende Share-Zustand im Speicher und kehrt zu Schritt 2 zurueck; nach Beendigung des App-Prozesses darf er verloren sein, da kein persistierter Share-Draft existiert.
_Avoid_: Zustandsverlust bei jedem App-Wechsel, persistente Speicherung von Team, Empfaengern oder Nachricht oder behauptete Wiederherstellung nach Prozessende

**Mobile Team Share Completion**:
Die neutrale Aktion `Fertig` beendet den fluechtigen Team Share und fuehrt zu My Bookings, ohne Versand oder erfolgreichen Share zu behaupten und ohne die Booking zu veraendern; Zurueck aus Schritt 2 fuehrt dagegen zu Schritt 1 zur Korrektur.
_Avoid_: Erfolgsstatus, Share-Historie, automatische Booking-Aenderung oder Verwechslung von Korrektur-Zurueck und Flow-Abschluss

**Mobile Team Share Empty-State Return**:
Oeffnet ein Share ohne verwendbares Team `My Teams`, bleibt der Share im Navigation Stack; bei manueller Rueckkehr werden Team-Summaries aktualisiert, aber weder Team noch Empfaenger automatisch ausgewaehlt.
_Avoid_: Team-CRUD im Share, versteckter automatischer Ruecksprung, veraltete Teamliste oder Umgehung der bewussten Teamwahl

**Mobile My Teams Overview**:
Die mobile My-Teams-Uebersicht ist list-first: Auf starke Headline und kurzen Intro-Satz folgt ein kompakter Fach-Callout zu privater Kontaktliste, keiner geteilten Organisation und keinen automatischen E-Mails; nach getrenntem Demo-Datenhinweis folgen Create-Aktion und alphabetische Teamliste.
_Avoid_: dauerhaftes Create-Formular vor der Liste, verschachtelte Member-Erstellung oder Teamliste erst unter mehreren grossen Intro-Panels

**Mobile Team Card**:
Eine Team-Card in der mobilen My-Teams-Uebersicht zeigt Teamname, Member-Anzahl und Chevron und ist als gesamte Flaeche genau ein Navigationstouchziel zum Team Detail.
_Avoid_: separater innerer Button, sichtbares `Verwalten` als Konkurrenz zum gleichnamigen Settings-Einstieg oder nur das Chevron tappbar machen

**Mobile Team Creation Continuation**:
Nach erfolgreichem Anlegen eines Teams oeffnet Mobile direkt dessen leeres Team Detail, damit der Customer als naechsten fachlichen Schritt Members hinzufuegen kann; Zurueck fuehrt zur aktualisierten My-Teams-Uebersicht.
_Avoid_: nach erfolgreicher Erstellung im Sheet oder in der Liste verbleiben und einen zusaetzlichen Oeffnen-Schritt verlangen

**Mobile Team Detail Hierarchy**:
Das mobile Team Detail ist member-first: Nach kompakter Teamidentitaet und Member-Anzahl folgen Kontakt-hinzufuegen-Aktion und alphabetische Memberliste; Umbenennen und Loeschen bleiben als sekundaere Team-Verwaltung im Screen-Kopf erreichbar.
_Avoid_: dauerhaft geoeffnetes Settings- und Create-Member-Formular vor der Memberliste oder Team-CRUD zugunsten der Verdichtung entfernen

**Mobile Team Demo Notice Placement**:
Die My-Teams-Uebersicht zeigt den vollstaendigen kompakten Hinweis der Team Demo Data Boundary einmal; im Team Detail entfaellt das grosse Wiederholungs-Panel und Add-/Edit-Member-Sheets erinnern direkt am Formular kurz daran, nur fiktive Kontaktdaten zu verwenden.
_Avoid_: Warnung nur weit entfernt vom Eingabepunkt, grosses wiederholtes Detail-Panel oder Weglassen der Datenwarnung in Member-Formularen

**Mobile Team Management Sheet**:
Die beschriftete Aktion `Team verwalten` im Kopf des Team Details oeffnet ein Sheet mit Umbenennen als primaerem Inhalt und einer raeumlich getrennten destruktiven Aktion `Team loeschen` am unteren Ende.
_Avoid_: nur ein unbeschriftetes Mehr-Menue, Loeschen direkt neben Speichern oder dauerhaft sichtbares Settings-Formular im Screen-Inhalt

**Mobile Team Deletion Confirmation**:
Vor einer mobilen Team Deletion nennt die Bestaetigung Teamname und Member-Anzahl und verlangt die exakte Eingabe des Teamnamens; erst dann wird das endgueltige Loeschen von Team und Members freigegeben.
_Avoid_: einfacher Einzel-Tap, generischer Alert ohne betroffene Daten oder Loeschfreigabe trotz abweichendem Teamnamen

**Mobile Add Team Member Sheet**:
Die Aktion `Kontakt hinzufuegen` im Team Detail oeffnet ein fokussiertes Sheet fuer genau einen Team Member mit Name und E-Mail; Validierung und API-Feedback bleiben im Sheet und die Memberliste wird nach Erfolg aktualisiert.
_Avoid_: dauerhaftes Add-Formular vor der Memberliste, mehrere Members in einem Formular oder Member-Erstellung ausserhalb eines gespeicherten Teams

**Mobile Add Team Member Continuation**:
Nach erfolgreichem Hinzufuegen zeigt das Sheet einen kurzen Erfolgszustand mit `Weiteren Kontakt hinzufuegen` fuer geleerte Felder und `Fertig` zum Schliessen auf die bereits aktualisierte alphabetische Memberliste.
_Avoid_: erzwungenes Schliessen nach jedem Member, still geleertes Formular ohne Erfolgsorientierung oder Batch-Formular fuer mehrere Kontakte

**Mobile Team Member Management**:
Eine mobile Member-Card ist mit Name, E-Mail und Chevron genau ein Touch-Ziel und oeffnet das beschriftete Sheet `Kontakt verwalten`; dort stehen Bearbeiten sowie raeumlich getrennt `Kontakt entfernen` zur Verfuegung.
_Avoid_: zwei sichtbare Edit-/Remove-Buttons pro Listen-Card, separate Member-Detailseite oder Loeschen direkt neben Speichern

**Mobile Team Member Removal Confirmation**:
Das Entfernen eines einzelnen Team Members verlangt einen nativen Bestaetigungsdialog mit Name und E-Mail sowie getrennten Aktionen `Abbrechen` und destruktiv `Kontakt entfernen`, aber keine Texteingabe.
_Avoid_: sofortiges Entfernen aus der Card, generische Bestaetigung ohne betroffenen Kontakt oder Team-Loeschfriktion fuer einen einzelnen Member

**Booking Request Modes**:
Booking-Flow-Anfragen für Context, Availability und Erstellung wählen genau einen von zwei Modi: `DIRECT` (`unitId`) oder `AUTO_ASSIGN` (`areaId + unitType=HOT_DESK`).
_Avoid_: separater Endpoint pro Buchungsmodus, abweichende Modusnamen oder Zielregeln zwischen Flow-Schritten

**Booking Time Input**:
Eine Booking-Erstellung übermittelt `date` sowie lokale `HH:mm`-Werte für `startTime` und `endTime`, die das Backend verbindlich als Coworking-Zeit in `Europe/Berlin` interpretiert.
_Avoid_: vom Browser erzeugte ISO-Zeitpunkte, Browser-Zeitzone als fachliche Zeitquelle

**Booking Time Display**:
Sichtbare Datums- und Zeitangaben einer Booking werden im Frontend verbindlich in `Europe/Berlin` projiziert, unabhängig von der Browser-Zeitzone.
_Avoid_: browserlokale Booking-Gruppierung, unterschiedliche Anzeigezeitzonen zwischen Account-, Customer- und Admin-Ansichten

**Home Page**:
Die öffentliche Startseite `/` erklärt RoomFull als Service und zeigt ansprechende Angebots-Teaser mit auth-aware CTAs in den Buchungseinstieg.
_Avoid_: reine interne Unit-Liste oder fokussierter Buchungskatalog

**Mobile Screen Targets**:
RoomFull Mobile V1 behält dieselben fachlichen Zielpunkte wie die Web-App bei; mobile Abweichungen verdichten nur die Darstellung und Interaktion, nicht die fachlichen Ziele.
_Avoid_: fachlich unterschiedliche Ziele in unscharfen Super-Screens vermischen oder mobile Sonderfluesse als neue Fachobjekte behandeln

**Mobile Home Hero Density**:
Der mobile Home-Hero bewahrt die markante RoomFull-Headline und Orientierung, haelt den primaeren Booking-CTA aber auch auf kleinen iPhones ohne Scrollen erreichbar; die vier UnitType-Teaser duerfen erst unterhalb des ersten Viewports beginnen.
_Avoid_: konkrete BookableUnits auf Home erwarten oder Sichtbarkeit eines UnitType-Teasers im ersten Viewport erzwingen

**Mobile Home CTA Pair**:
Der mobile Home-Hero zeigt den gefuellten primaeren Booking-CTA zusammen mit genau einer auth-aware Outline-Aktion; beide stehen nur bei ausreichend Platz nebeneinander und werden sonst ohne Textumbruch gestapelt.
_Avoid_: dritter Hero-CTA, gequetschte Labels oder umbrechender Button-Text fuer eine erzwungene Ein-Zeilen-Anordnung

**Mobile Home UnitType Teaser Action**:
Jeder farbige UnitType-Teaser auf Mobile Home ist als gesamte Flaeche genau eine Auswahlaktion; ein sichtbares Aktionslabel dient nur als Orientierung innerhalb derselben Tap-Flaeche.
_Avoid_: verschachtelter Button, mehrere konkurrierende Touch-Ziele oder nur das kleine Aktionslabel tappbar machen

**Mobile Home UnitType Teaser Meta**:
Ein mobiler Home-Teaser zeigt genau Verfuegbarkeit, Mindestdauer und Kapazitaet in dieser Reihenfolge als kompakten Meta-Block; konkrete Area-, Varianten- oder BookableUnit-Details folgen erst spaeter im Auswahlfluss.
_Avoid_: Weglassen entscheidender Vorauswahl-Fakten oder Vorziehen konkreter Raumdetails auf Home

**Home UnitType Teaser Signal**:
Home kennzeichnet die vier UnitType-Teaser in Web und Mobile durch ihre etablierte Farbe, das vertikale Kategorie-Label und markante Typografie; zusaetzliche SVG-Icons sind nicht Teil dieses Signals.
_Avoid_: redundante Illustrationen oder Icons, die den kompakten Streifen ohne zusaetzliche Orientierung ueberladen

**Mobile Home UnitType Teaser Set**:
Mobile Home zeigt alle vier UnitTypes direkt in einer stabilen vertikalen Folge; die vollstaendige Auswahl bleibt ohne Carousel, Filter oder vorgelagerten Auswahlzustand erreichbar.
_Avoid_: horizontal versteckte Kategorien, wechselnde Reihenfolge oder nur kuratierte Teilmenge der vier UnitTypes

**Mobile Navigation Model**:
RoomFull Mobile V1 organisiert seine Navigation explizit ueber React Navigation mit klar modellierten Stacks, Overlays und Auth-Grenzen statt ueber dateibasierte Router-Magie.
_Avoid_: versteckte Navigationsstruktur oder implizite Dateisystem-Routen als primaeres Architekturmodell

**Mobile Sheet Presentation**:
Ein Mobile Sheet praesentiert einen fokussierten sekundaeren Arbeitsschritt unter Erhalt des sichtbaren Ausgangskontexts; umfangreiche Auswahl- oder Hauptablaeufe bleiben eigene vollflaechige Screens.
_Avoid_: jeden mobilen Flow in ein Sheet draengen, fachliche Hauptziele als verschachtelte Overlays modellieren oder Sheet und vollflaechigen Modal-Screen synonym verwenden

**Mobile App Header Density**:
Der wiederkehrende mobile App-Header besteht aus Safe Area und kompakter Markenzeile mit kleinerem RoomFull-Logo, Menue- beziehungsweise Schliessen-Aktion und vierfarbiger Unterkante; Auth-Screens verwenden stattdessen die getrennte Mobile Auth Shell.
_Avoid_: hohe Web-Header-Abstaende, fehlende Safe-Area-Beruecksichtigung oder globale Header-Huelle auf Auth-Screens

**Mobile App Header Scroll Behavior**:
Der kompakte mobile App-Header bleibt auf regulaeren Screens stabil sichtbar und reagiert nicht mit Ein-/Ausblenden auf die Scrollrichtung.
_Avoid_: scrollabhaengige Header-Animation, zeitweise unerreichbares Hauptmenue oder unterschiedliches Verhalten je Content-Screen

**Mobile Info & Recht Navigation**:
RoomFull Mobile verwendet keinen wiederkehrenden Screen-Footer; FAQ und Datenschutz beziehungsweise Privacy & Imprint bleiben stattdessen im App-Menue unter dem ruhigen Bereich `Info & Recht` dauerhaft erreichbar.
_Avoid_: Scope-Verlust der rechtlichen Ziele oder Web-Footer am Ende jedes mobilen Screens

**Mobile Main Menu Modal**:
Das mobile Hauptmenue oeffnet als nahezu vollflaechige modale Ebene unter Beruecksichtigung der Safe Area; der Hintergrund ist gedimmt, fuer Bedienung und Accessibility gesperrt, das Menue intern scrollbar und ueber eine explizite Schliessen-Aktion verlassbar. Dies ist eine bewusste native Abweichung vom verankerten Web-Dropdown.
_Avoid_: seitlicher Drawer, kleines Header-Dropdown, bedienbarer Hintergrund oder nur implizites Schliessen durch erneuten Menue-Tap

**Mobile Customer Menu Hierarchy**:
Das mobile Customer-Menue ordnet zuerst `Platz finden` und `Meine Buchungen`, danach eine nicht tappbare User-Summary mit `Mein Account`, `My Teams` und `Kontakt`, anschliessend Sprache sowie `Info & Recht` und ganz unten raeumlich getrennt `Abmelden`.
_Avoid_: flache ungegliederte Linkliste, tappbare User-Summary als Konkurrenz zu Mein Account oder Abmelden zwischen normalen Navigationszielen

**Mobile Anonymous Menu Hierarchy**:
Das anonyme mobile Menue zeigt zuerst `Platz finden`, danach eine eigene Auth-Gruppe mit primaer `Einloggen` und sekundaer `Registrieren` sowie abschliessend Sprache und `Info & Recht`; Konto-Summary und Abmelden entfallen vollstaendig.
_Avoid_: leere Konto-Platzhalter, gleichgewichtete flache Linkliste oder Registrierung als dritter Home-Hero-CTA statt Auth-Menueaktion

**Mobile Auth Shell**:
Die gemeinsame mobile Huelle fuer Login und Registrierung zeigt direkt unter der Safe Area nur eine kompakte RoomFull-Marken- und Ruecknavigation; globales Menue, Web-Header und Footer bleiben auf Auth-Screens verborgen, damit Formular und Hauptaktion frueh sichtbar sind.
_Avoid_: grosse dekorative Leerflaechen, vollstaendige App-Navigation oder Web-Footer im mobilen Auth-Einstieg

**Mobile Auth Switch**:
Der Wechsel zwischen Login und Registrierung ist eine kompakte sekundaere Textaktion unter dem primaeren Formular-Button und behaelt ein vorhandenes internes Weiterleitungsziel bei.
_Avoid_: gleichgewichteter zweiter Grossbutton oder Verlust des begonnenen Buchungsziels beim Wechsel des Auth-Modus

**Mobile Auth Intro Copy**:
Die Orientierungscopy eines mobilen Auth-Screens benennt eine fortzusetzende Buchung nur bei einem Auth-Einstieg aus dem Booking Flow; direkte Auth-Einstiege verwenden eine neutrale RoomFull-Anmeldung oder Kontoerstellung.
_Avoid_: pauschal behaupten, dass jeder Login oder jede Registrierung eine begonnene Buchung fortsetzt

**Mobile Auth Header Density**:
Der schwarze Kopf der mobilen Auth-Card bleibt als markantes RoomFull-Element erhalten, verwendet aber eine kompakte Headline, hoechstens zwei kurze Orientierungszeilen und reduzierte Innenabstaende.
_Avoid_: Web-typografische Groesse, die auf kleinen iPhones Formularfelder oder Hauptaktion unnoetig unter den sichtbaren Bereich drueckt

**Mobile Guest Login Entry**:
Der mobile Login bietet den Gastzugang als klar getrennten sekundaeren Einstieg in eine isolierte Demo Customer Session an; auf dem Registrierungs-Screen wird er nicht wiederholt und ein sicherer begonnener Auth-Zielpfad wird nach erfolgreichem Demo-Login fortgesetzt.
_Avoid_: Gastzugang als Registrierung, eigene Guest-Rolle, gleichrangige Konkurrenz zur regulaeren Anmeldung oder Rueckfall auf Home trotz begonnenem Booking Flow

**Mobile Guest Login Panel**:
Der Gastzugang erscheint direkt unter der regulaeren Login-Card als kompakte sekundaere Card mit kurzer Ueberschrift, genau einem Erklaersatz und einer klaren Outline-Aktion.
_Avoid_: eigener Hero-Kopf, Erklaerlisten oder eine visuelle Gewichtung wie beim regulaeren Login

**Mobile Auth Keyboard Baseline**:
Mobile Auth-Formulare halten das aktive Feld und die Hauptaktion bei eingeblendeter iOS-Tastatur erreichbar, fuehren per Return-Taste durch die Felder und senden am letzten Feld ab; das exakte Verhalten wird spaeter auf echten Zielgeraeten feinjustiert.
_Avoid_: dauerhaft sticky Auth-Aktion, verdeckte Eingabefelder oder eine als endgueltig behandelte Simulator-Abstimmung

**Mobile Auth Error Feedback**:
Mobile Auth-Formulare zeigen lokal korrigierbare Eingabefehler am betroffenen Feld und uebergreifende Serverfehler kompakt oberhalb der Felder; Name und E-Mail bleiben erhalten, der erste korrigierbare Fehler erhaelt Fokus und Bedeutung wird nie nur durch Farbe vermittelt.
_Avoid_: unspezifische Toast-only-Fehler, geloeschte unkritische Eingaben oder reine Farbcodierung

**Mobile Password Reset Scope**:
RoomFull Mobile bietet keinen Passwort-Reset an, solange die WebApp keinen entsprechenden vollstaendigen Funktionsfluss besitzt.
_Avoid_: mobile-only Reset-Aktion, nicht funktionierender Link oder reines UI ohne Backend- und E-Mail-Contract

**Mobile Registration Demo Notice**:
Die mobile Registrierung zeigt innerhalb der Register-Card einen kompakten Portfolio-Demo-Hinweis: RoomFull ist kein echter Coworking-Service, es sollen keine echten personenbezogenen Daten oder echten beziehungsweise wiederverwendeten Passwoerter eingegeben werden und Demo-Daten koennen geloescht werden.
_Avoid_: Ausblenden der Warnung, Verteilung ueber mehrere Screens oder Wiederholung auf dem regulaeren Login-Screen

**Mobile Screen Layer**:
RoomFull Mobile fuehrt `screens/` als schlanken Kompositionslayer fuer navigierbare Ansichten; fachliche Regeln, API-Logik und schwere Interaktionslogik bleiben in `features`, `entities`, `widgets` und `shared`.
_Avoid_: `screens/` als God-Layer fuer Datenzugriff, Business-Logik oder zustandsreiche Feature-Implementierung

**Localized Route**:
Eine sharebare RoomFull-URL mit explizitem Sprachsegment `de` oder `en`, die dieselbe fachliche Seite in der gewählten Sprache adressiert.
_Avoid_: Sprache nur als unsichtbarer Browser- oder Session-Zustand

**Canonical Localized Route Tree**:
Der einzige kanonische Frontend-Routenbaum unter `de` oder `en`; unlokalisierte Pfade dienen nur als Redirect-Einstiege.
_Avoid_: parallele lokalisierte und unlokalisierte Page-Baeume mit derselben Funktion

**Language Switch**:
Eine UI-Aktion, die zwischen `de` und `en` wechselt, den aktuellen Pfad inklusive Query erhaelt und die gewaehlte Locale fuer spaetere Root-Besuche speichert.
_Avoid_: Sprachwechsel als Navigation zur Startseite oder Verlust von fachlichem UI-Zustand

**Mobile Locale**:
Der zentrale nicht routengebundene Sprachzustand von RoomFull Mobile fuer `de` oder `en`, aus dem UI-Copy, Formatierung, lokalisierte API-Projektionen und Share-Inhalte abgeleitet werden.
_Avoid_: locale-abhaengige Mobile-Routen, eigene Locale pro Screen oder Share-Flow oder Sprache nur implizit aus dem Geraet ableiten

**Mobile Locale Initialization**:
Beim ersten Mobile-Start wird ein unterstuetztes `de` oder `en` aus der bevorzugten Geraetesprache uebernommen, sonst `de`; danach hat eine persistierte bewusste Customer-Auswahl Vorrang vor der Geraetesprache.
_Avoid_: gespeicherte Auswahl bei jedem Start mit der Geraetesprache ueberschreiben, andere Geraetesprachen ungeprueft uebernehmen oder Locale als sensibles Secret speichern

**Mobile Language Switch**:
Die Mobile-Aktion zum unmittelbaren Wechsel der zentralen Mobile Locale auf dem aktuellen Screen, ohne Navigation-Reset und ohne Verlust von Navigation-Parametern oder sicher erhaltbarem Flow-Zustand.
_Avoid_: Ruecksprung auf Home, Neuaufbau des Navigation Stacks oder nur teilweise aktualisierte Screen-Copy

**Mobile UI Dictionary**:
Die statisch gebuendelte typisierte `de`/`en`-Copy des vereinbarten Mobile-Customer-Scope; `de` definiert die Struktur und `en` muss dieselbe Shape per TypeScript erfuellen.
_Avoid_: gesamten Web-Admin-Scope kopieren, rohe Backend-Messages als sichtbare Copy oder fuer zwei Sprachen unnoetig eine zweite Uebersetzungs-Engine einfuehren

**RoomFull Development Build**:
Ein Mobile-Build mit `expo-dev-client` fuer lokale Simulator-Entwicklung oder interne Installation auf registrierten iPhones; er dient nativer Feature-Abnahme und wird nicht an TestFlight uebermittelt.
_Avoid_: Development Build als App-Store-Artefakt, dauerhafter Expo-Go-Ersatz ohne eigenes App-Binary oder identischer Build fuer Entwicklung und TestFlight

**RoomFull TestFlight Build**:
Ein separates App-Store-signiertes Production-Artefakt, das nach erfolgreicher Development-Build-Abnahme ueber EAS Build erzeugt und in V1 bewusst manuell an TestFlight uebermittelt wird.
_Avoid_: Development Client in TestFlight, automatische Submission bei jedem Push, TestFlight ohne Production-Profil oder Build vor nativer Geraeteabnahme

**Mobile Build Profile Boundary**:
Mobile V1 trennt `development-device` fuer internen Development-Client-Zugriff und `production` fuer TestFlight; ein eigenes Preview-Profil und EAS Update gehoeren nicht zum vereinbarten V1-Workflow.
_Avoid_: Profile ohne klaren Distributionszweck, Preview nur aus Template-Vollstaendigkeit oder EAS Update als unbeabsichtigter weiterer Release-Kanal

**Mobile UI Localization**:
RoomFull Mobile V1 behandelt `de` und `en` von Beginn an als Teil der App-Struktur, setzt die UI-Lokalisierung aber pragmatisch ueber ein schlankes lokales Dictionary statt ueber schwere i18n-Infrastruktur um.
_Avoid_: monolinguale V1-Struktur mit spaeterem i18n-Nachziehen als Umbauprojekt oder lokalisierte Backend-Contracts

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
Die schlanke Buchungsübersicht `/booking-options`, auf der Customers eine BookingOption-Kategorie auswählen und in die passende Detailauswahl einsteigen. Aktive Area- beziehungsweise Unit-Namen werden als nicht-interaktive Vorschau aus der DB angezeigt.
_Avoid_: Marketing-Seite, allgemeine Service-Erklärung, konkrete Unit-Auswahl bereits auf der Kategorie-Übersicht

**Mobile Booking Options Density**:
RoomFull Mobile zeigt die Booking-Options-Uebersicht als verdichtete Auswahlflaeche; jede Option transportiert Typcharakter, kurzen Nutzen und minimale Vorschau, waehrend ausfuehrliche Erklaerung erst auf der Detailseite erfolgt.
_Avoid_: die mobile Uebersicht zu einer Folge nahezu vollstaendiger Detailkarten werden lassen

**Mobile Booking Option Tap Surface**:
In der mobilen Booking-Options-Uebersicht ist die gesamte Option-Card die primaere Tap-Flaeche; ein separater dominanter CTA-Button ist nicht notwendig.
_Avoid_: kleine interne Button-Ziele als eigentliche Hauptinteraktion einer grossen Auswahlkarte

**Mobile Booking Option Preview Scope**:
Die mobile Booking-Options-Uebersicht zeigt pro Option nur minimale Vorschau auf konkrete Areas oder Units, hoechstens ein bis zwei Namen plus kompakten Ueberlaufhinweis.
_Avoid_: laengere Listen konkreter Namen bereits auf der Uebersichtskarte

**Mobile Booking Option Label Style**:
Das charakteristische Kategorien-Label einer Booking Option bleibt mobil als RoomFull-Stilmerkmal erhalten, wird aber deutlich kompakter als in der Web-Mobilansicht ausgefuehrt.
_Avoid_: die dominante hohe Seitenleiste der Web-Karte unveraendert auf Mobile uebernehmen oder das Stilmerkmal vollstaendig verlieren

**Mobile Booking Option Count Hierarchy**:
Count-Badges wie Platz- oder Raumanzahlen bleiben in der mobilen Booking-Options-Uebersicht sichtbar, sind aber klar sekundaere Metainformation gegenueber Titel, Farbcharakter und Auswahlrichtung.
_Avoid_: die Kartenhierarchie ueber Zahlen statt ueber den Bedarfstyp zu definieren

**Mobile Booking Options Intro Copy**:
Die mobile Booking-Options-Seite behaelt eine starke orientierende Headline, kuerzt die einleitende Copy darunter aber bewusst auf einen knappen Erklaersatz.
_Avoid_: mehrzeilige Intro-Texte, die die erste relevante Auswahl auf kleinen Screens zu weit nach unten schieben

**Mobile Booking Options Entry Structure**:
RoomFull Mobile V1 zeigt alle vier Booking Options weiterhin direkt auf der Uebersichtsseite und fuehrt keinen vorgeschalteten Bedarfsschalter oder Filter als zusaetzlichen Einstiegsschritt ein.
_Avoid_: vor der eigentlichen Auswahl erst eine weitere Filter- oder Segmentierungsinteraktion zu erzwingen

**Mobile Booking Option Detail Hero Density**:
Die mobile Detailseite einer Booking Option behaelt einen klaren Kategorie-Hero zur Orientierung, verdichtet ihn aber deutlich staerker als die Web-Mobilansicht, damit die konkrete Raumauswahl frueher sichtbar wird.
_Avoid_: die Detailseite mobil mit einem zu hohen Intro-Block zu beginnen, obwohl der User die Kategorie bereits aus der Uebersicht kennt

**Mobile Unit Choice Card Density**:
Die konkreten Raumkarten auf der mobilen Booking-Option-Detailseite werden als verdichtete Auswahlkarten mit Name, Kapazitaet und kurzer Nutzenzeile statt als lange Textkarten dargestellt.
_Avoid_: mehrere fast vollstaendige Langbeschreibungen untereinander, bevor die eigentliche Raumwahl getroffen wird

**Mobile Unit Choice Numbering**:
Eine grosse laufende Nummerierung wie `01/02/03` ist auf mobilen Raumkarten hoechstens subtiler Zierakzent und kein dominantes Hierarchieelement.
_Avoid_: dekorative Nummern groesser oder aufmerksamer als den eigentlichen Raumnamen inszenieren

**Mobile Detail Back Navigation**:
Die Back-Navigation auf mobilen Booking-Option-Detailseiten wird als schlanke Navigationshilfe und nicht als schwerer Action-Button gestaltet.
_Avoid_: den Rueckweg visuell mit den eigentlichen Auswahl- oder Buchungsaktionen konkurrieren lassen

**Mobile Unit Choice CTA Shape**:
Die mobile Raumwahl auf der Detailseite behaelt pro konkreter Unit einen kompakten expliziten CTA bei, statt die gesamte informationsreichere Raumkarte als einzigen Ausloeser zu verwenden.
_Avoid_: informationsreiche Auswahlkarten ohne klar markierten Commit-Punkt oder uebergrosse dominante Buttons

**Mobile Unit Choice Separation**:
Die Trennung zwischen mobilen Raumkarten erfolgt primaer ueber Rhythmus, Spacing und ruhige Card-Struktur statt ueber dominante harte Trennerlinien.
_Avoid_: die Detailseite wie eine Folge stark voneinander abgetrennter Dokumentsektionen statt wie einen ruhigen Auswahlkatalog wirken zu lassen

**Mobile Detail Meta Facts**:
Dauerregeln und Verfuegbarkeitsanzahl bleiben auf mobilen Booking-Option-Detailseiten sichtbar, werden aber als kompakte Meta-Infos und nicht als schwerer Hero-Unterblock dargestellt.
_Avoid_: fachlich hilfreiche Fakten ganz verstecken oder ihnen unverhaeltnismaessig viel vertikale Flaeche im mobilen Hero geben

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

**Mobile Booking End Time Reveal**:
RoomFull Mobile zeigt die Endzeitwahl erst nach gewaehlt­er Startzeit und nur mit fachlich erlaubten Folgeoptionen statt mit einem von Beginn an voll entfalteten zweiten Zeitraster.
_Avoid_: zwei vollwertige Zeitgrids gleichzeitig offen halten oder ungueltige Endzeiten sichtbar zur Auswahl anbieten

**Mobile Booking Sticky Summary**:
Die sticky Summary im mobilen Booking Flow ist frueh sichtbar, bleibt anfangs aber kompakt und passiv; erst mit fortschreitender Auswahl wird sie informationsreicher und die Booking-CTA voll aktiv.
_Avoid_: von Beginn an eine grosse dominante Bottom-Bar mit halbfertigem CTA oder gar keine persistente Fortschrittsorientierung

**Booking Availability Contract**:
Die Create Booking Page nutzt den einzigen zeitbezogenen, auth-required Availability-Contract für Direct Booking und Hot-Desk-Auto-Assign; lokale `HH:mm`-Slots und blockierende Intervalle werden getrennt vom Datum geliefert.
_Avoid_: parallele Public-Unit-Availability, Frontend rekonstruiert Modus-spezifische Verfügbarkeit aus unterschiedlichen Rohdaten

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
Eine backendberechnete Monatsübersicht markiert direkte Unit-Tage als verfügbar, teilweise belegt oder voll belegt, wobei voll belegt keine freie Duration-Policy-gültige Zeitspanne mehr bedeutet.
_Avoid_: Request pro Kalendertag, Frontend-Ableitung aus rohen Intervallen, belegte Tage erst nach versteckter Datumsauswahl sichtbar machen

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

**Mobile Booking Flow Density**:
RoomFull Mobile V1 bildet den Booking Flow nicht als langen Alles-auf-einmal-Scrollscreen ab, sondern als verdichteten Ein-Screen-Flow mit schrittweiser Fokussierung auf Datum, Startzeit und Endzeit bei gleichzeitig kompakter Summary.
_Avoid_: vollstaendig entfaltete Mobile-Form mit Kalender, allen Zeitrastern und Summary gleichzeitig in einer langen Scrollsaeule oder ein harter Multi-Screen-Wizard fuer jeden Einzelschritt

**Mobile Booking Context Collapse**:
Der obere Booking-Kontext ist beim Einstieg bewusst praesent und orientierend, klappt im weiteren Mobile-Flow aber zu einer kompakten Summary-Karte ein und kann bei Bedarf wieder erweitert werden.
_Avoid_: den grossen Kontextblock waehrend der gesamten Datum-/Zeitwahl dauerhaft offen lassen oder ihn zu frueh vollstaendig verstecken

**Create Booking Success Destination**:
Nach erfolgreicher Buchung landet der Customer auf `/me/bookings?created=1` und sieht dort einen ruhigen Success-Hinweis.
_Avoid_: separate Confirmation-Seite im MVP

**Account Settings**:
Ein geplanter Bereich fuer angemeldete Users, der User- und Login-nahe Einstellungen wie Profilanzeige, Name oder Passwort buendelt.
_Avoid_: Booking-Fachlogik, Admin-Verwaltung, lose Header-Idee ohne festen Produktplatz

**Account Overview**:
Die erste V1-Ausbaustufe der Account Settings als geschuetzte Nur-Lese-Ansicht `/me/account` fuer Name, E-Mail, Rolle und Registrierungsdatum jedes angemeldeten Users.
_Avoid_: eigener Account-Endpoint, Nutzeraktion, Profilbearbeitung, Passwortaenderung oder neue Account-Sicherheitslogik im ersten Slice

**Mobile Contact Scope**:
RoomFull Mobile V1 behaelt den Contact-Bereich als bewussten auth-required Formular-Slice im Umfang, obwohl er nicht zum engsten Booking-Kern gehoert.
_Avoid_: Contact stillschweigend aus V1 herausdruecken, obwohl er als Showcase fuer Formular-, Keyboard- und Submit-UX gewollt ist

**Mobile Contact Layout Density**:
RoomFull Mobile V1 fuehrt Contact als verdichteten Formular-Screen mit kurzer Intro und ohne zwei grosse aufeinanderfolgende Intro-/Form-Blöcke.
_Avoid_: vor dem eigentlichen Formular mehrere hohe Erklaerungscontainer stapeln

**Mobile Contact Type Selector**:
Der `Contact Request Type` wird mobil als kompakte horizontale 3er-Auswahl fuer `Frage`, `Feedback` und `Kritik` dargestellt, nicht als hohe Folge gestapelter Radio-Zeilen.
_Avoid_: ueberhoehten vertikalen Verbrauch fuer eine kleine exklusive Kategoriewahl

**Mobile Contact Textarea Growth**:
Die Nachrichten-Textarea startet mobil kompakt und darf bei Fokus oder laufender Eingabe sichtbar wachsen, statt von Beginn an einen grossen festen Hoehenblock einzunehmen.
_Avoid_: eine bereits im Leerlauf uebergrosse Schreibflaeche, die den restlichen Formularfluss nach unten drueckt

**Mobile Contact Submit Placement**:
Der Submit-CTA im mobilen Contact-Formular bleibt ein normaler Formularabschluss und wird nicht als sticky Footer umgesetzt.
_Avoid_: keyboard-kollidierende oder unnoetig dominante Sticky-Submit-Mechanik fuer einen einfachen Einzelschritt-Formularflow

**Mobile Account Scope**:
RoomFull Mobile V1 behandelt den Account-Bereich als ruhige geschuetzte Read-only-Uebersicht fuer Session-nahe Informationen und nicht als Ausbaupunkt fuer Profilpflege oder weitere Self-Service-Aktionen.
_Avoid_: den Account-Screen in V1 zu einem zweiten Auth-/Profil-Feature auswachsen lassen

**Frontend Session**:
Der aktuelle Auth-Zustand der laufenden Frontend-App inklusive angemeldetem Session-User, Ladezustand und Logout-Moeglichkeit.
_Avoid_: einzelne Widgets oder Pages leiten Auth-Zustand direkt aus Cookies oder Einzelrequests ab

**Session User**:
Die fuer die laufende Frontend Session benoetigten User-Daten inklusive Registrierungsdatum. Er ist bewusst vom vollstaendigen fachlichen **User** entkoppelt.
_Avoid_: Header und Auth-Shell direkt an das User-Entity-Modell koppeln

**Session Lifecycle**:
Login- und Register-Features uebernehmen den vom Backend authentifizierten User in die Frontend Session; Logout beendet den lokalen Zustand und die serverseitig kontrollierte HttpOnly-Cookie-Session. Das Cookie bleibt fuer JavaScript unlesbar.
_Avoid_: UI-Bereiche lesen oder manipulieren Auth-Cookies beziehungsweise fuehren eigenen Browser-Token-Storage ein

**Authenticated API Request**:
Ein Frontend-API-Aufruf ueber den zentralen technischen API-Client mit `credentials: "include"`, sodass der Browser das HttpOnly-Session-Cookie mitsendet.
_Avoid_: Pages, Widgets oder fachliche API-Funktionen reichen `authToken` als Parameter weiter oder setzen Authorization Header selbst

**Mobile API Integration**:
RoomFull Mobile V1 nutzt dieselben bestehenden Backend-Endpunkte direkt wie die Web-App und fuehrt keinen separaten Mobile-BFF-Layer ein.
_Avoid_: mobile-spezifische Fachaggregation oder doppelte Business-Logik in einem zusaetzlichen Zwischen-Backend fuer V1

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

**Mobile My Bookings Scope**:
RoomFull Mobile V1 behandelt die Kalenderansicht in "Meine Buchungen" nicht als Muss; die mobile V1-Ausbaustufe darf auf genau eine primaere Darstellungsart fuer eigene Bookings reduziert werden, wenn dadurch der Scope klarer und stabiler bleibt.
_Avoid_: mehrere Ansichten nur aus Vollstaendigkeitsdrang oder Portfolio-Druck in V1 erzwingen

**Mobile My Bookings Primary View**:
Wenn RoomFull Mobile V1 fuer "Meine Buchungen" nur eine Darstellungsart nutzt, ist die Kartenansicht der primaere Zielzustand.
_Avoid_: aus rein technischer Einfachheit auf eine visuell deutlich schwaechere Default-Darstellung ausweichen

**Mobile Calendar Export Scope**:
RoomFull Mobile V1 umfasst sowohl den Personal Booking Calendar Export fuer eligible eigene Bookings als auch den getrennten Team Booking Share Calendar Export innerhalb eines bereiten Share Packages; beide bleiben manuell weitergegebene `.ics`-Artefakte innerhalb der Mobile Calendar Integration Boundary.
_Avoid_: beide Exporte vermischen, automatischen Kalender-Sync oder Versand behaupten oder die interne persoenliche Datei an Team Members weitergeben

**Mobile Calendar Integration Boundary**:
RoomFull Mobile uebergibt Kalenderdaten in V1 nur einmalig als `.ics`; es verbindet kein Kalenderkonto, liest keine privaten Termine, prueft keine externen Konflikte und synchronisiert weder Aenderungen noch Stornierungen, Teilnehmer oder RSVP automatisch zurueck.
_Avoid_: Kalenderberechtigungen oder OAuth als Voraussetzung, abonnierbarer Feed, automatische Event-Pflege oder Zwei-Wege-Synchronisation versprechen

**Mobile Calendar File Handoff**:
Die technische Uebergabe eines temporaer im App-Cache erzeugten Personal- oder Team-Share-`.ics`-Artefakts an das native Share Sheet. RoomFull erzeugt und uebergibt die Datei, waehrend iOS und die installierten Ziel-Apps ueber angebotene Aktionen und einen moeglichen Import entscheiden.
_Avoid_: direkte Kalenderkonto-Integration, persistente Exportablage, garantierten Kalenderimport oder einen Native Build als fachliche Voraussetzung des Exports behaupten

**Mobile My Bookings V1 Shape**:
RoomFull Mobile V1 reduziert "Meine Buchungen" bewusst auf eine reine Kartenansicht ohne View-Switcher, behaelt aber den Personal Booking Calendar Export fuer eligible eigene Bookings bei.
_Avoid_: die Web-Mehransichtenlogik unveraendert uebernehmen oder den fachlich vorhandenen persoenlichen Kalenderexport mit den entfallenen Ansichtsmodi verwechseln

**Mobile Booking Card Actions**:
Mobile Booking-Cards zeigen fuer eine aktive anstehende Booking genau den sichtbaren Einstieg `Buchung verwalten`; er oeffnet das Mobile Booking Action Sheet, waehrend fruehere oder stornierte Bookings keine eigene Aktionsleiste tragen.
_Avoid_: mehrere nebeneinander oder untereinander gestapelte Aktionsbuttons pro Karte oder Aktionen auf abgeschlossenen Bookings

**Mobile Booking Action Sheet**:
Das native Aktionsblatt einer konkreten Booking zeigt nur aktuell erlaubte Aktionen aus Personal Booking Calendar Export, Team Booking Share und Stornierung; Share navigiert weiter, Export uebergibt die Datei nativ und Stornierung bleibt destruktiv getrennt.
_Avoid_: unzulaessige deaktivierte Aktionen als Standard, Storno ohne klare Gefahrendarstellung oder Vermischung der beiden Kalenderexporte

**Mobile My Bookings Section Hierarchy**:
Die Bereiche fuer anstehende und fruehere Buchungen bleiben mobil klar getrennt, werden aber mit leichterer Header-Hierarchie statt mit schweren Blockpanels inszeniert.
_Avoid_: Section-Container, die optisch staerker dominieren als die eigentlichen Booking-Cards

**Mobile My Bookings Intro Copy**:
Die mobile Seite "Meine Buchungen" behaelt eine starke Headline, reduziert die Intro-Copy darunter aber auf einen sehr kurzen Orientierungssatz.
_Avoid_: mehrzeilige Einfuehrungstexte vor einer nutzungsorientierten Bestandsseite

**Mobile Booking Card Density**:
Mobile Booking-Cards bleiben charakterstark, werden aber in ihrer vertikalen Struktur spuerbar verdichtet, damit mehrere Eintraege schneller ueberblickbar bleiben.
_Avoid_: grosszuegige Kartenhoehen mit zu vielen getrennten Zonen und Luft zwischen den Kerninformationen

**Mobile Booking Card Meta Form**:
UnitType und Status bleiben auf mobilen Booking-Cards sichtbar, werden aber als kompakte Meta-Information statt als flaechige dominante Chips dargestellt.
_Avoid_: sekundaere Metadaten groesser oder auffaelliger als Ort und Zeit der Booking zu gestalten

**Mobile My Bookings Default Collapse**:
Auf Mobile startet "Anstehende Buchungen" standardmaessig offen, waehrend "Fruehere Buchungen & Stornierungen" standardmaessig eingeklappt bleibt.
_Avoid_: historische Inhalte gleich stark oder frueher als den anstehenden Kernbereich zu praesentieren

**Mobile My Bookings Count Placement**:
Die Anzahl der Bookings pro Section wird mobil direkt im jeweiligen Section-Header gefuehrt und nicht als eigener Count-Block darunter dargestellt.
_Avoid_: zaehlende Zwischencontainer, die Hoehe verbrauchen ohne neue fachliche Information zu liefern

**My Bookings Action Parity**:
Karten-, Listen- und Kalenderansicht bieten fuer eine eigene Booking dieselben verfuegbaren Customer-Aktionen; Unterschiede liegen nur in Navigation und visueller Dichte.
_Avoid_: Aktionen nur in einer Ansicht auffindbar machen

**Cancel Booking Confirmation Workflow**:
In "Meine Buchungen" ist hoechstens eine Storno-Bestaetigung gleichzeitig geoeffnet. Das Cancel-Booking-Feature besitzt dafuer mit `CancelBookingWorkflow` eine gemeinsame Workflow-Instanz, die von der My Bookings View genau einmal um alle dargestellten Bookings gesetzt wird; Karten-, Listen- und Kalenderdarstellung greifen auf denselben Zustand zu. Das Workflow-Interface erhaelt Copy sowie Erfolgs- und Fehlercallbacks einmalig. Das Feature besitzt Oeffnen, Keyword-Pruefung, Abbruch, Submit-Zustand, Fehlerzuordnung und Session-Ende bei `401`; die Page kennt nur die Ergebnisse und aktualisiert die Booking oder zeigt Feedback. Das Feature stellt mit `CancelBookingCardAction` eine explizite Kartenvariante und mit `CancelBookingCompactAction` eine explizite kompakte Variante der Storno-Aktion bereit; beide benoetigen von ihrem Caller nur die `bookingId`, und die Kalenderdarstellung verwendet ebenfalls die kompakte Variante. Beide Varianten teilen denselben Workflow, duerfen ihn aber unterschiedlich darstellen. Ein Wechsel des View Mode setzt die Workflow-Instanz zurueck, schliesst damit die offene Bestaetigung und verwirft die Keyword-Eingabe. Nach erfolgreichem Storno schliesst das Feature die Bestaetigung und setzt die Eingabe zurueck. Bei `403`, `404`, `409` oder einem technischen Fehler bleiben Bestaetigung und Keyword fuer einen moeglichen Retry erhalten; bei `401` endet die Frontend Session.
_Avoid_: mehrere Workflow-Instanzen pro Darstellung, parallele Storno-Bestaetigungen, Workflow-State in der Page, ein einzelnes Darstellungsmodul mit kombinierbaren Varianten-Booleans, versteckten Confirmation-State nach einem View-Mode-Wechsel, verlorenen Retry-State nach behebbaren Fehlern, duplizierten Workflow-State in den Darstellungen oder unterschiedliche Storno-Regeln je View Mode

**Mobile Cancel Confirmation**:
RoomFull Mobile behaelt fuer Storno im Cancel-Booking-Sheet ein explizites Bestatigungswort `STORNO` bei; die mobile UX bleibt dabei bewusst kurz, fokussiert und fehlertolerant.
_Avoid_: irreversiblen Storno nur ueber einen einzelnen Danger-Tap bestaetigen oder die mobile Sicherheitsstufe unter das Web-Niveau absenken

## Flagged ambiguities

- "RoomFull Mobile" klang zunächst wie eine mögliche Produktvariante; aufgelöst als **Mobile Client** desselben RoomFull-Kontexts mit kleinerem Capability-Slice, aber ohne eigene Fachlogik.
- "Screen" und "fachlicher Zielpunkt" drohten zu verschwimmen; aufgeloest als **Mobile Screen Targets**: gleiche fachliche Ziele wie im Web, aber mobile-spezifisch verdichtete Darstellung.
- "eigene Mobile-API" klang moeglich; aufgeloest als **Mobile API Integration**: direkter Zugriff auf dieselben Backend-Endpunkte, kein separater BFF in V1.
- "DE/EN spaeter" stand im Raum; aufgeloest als **Mobile UI Localization**: i18n von Anfang an strukturell mitdenken, aber schlank umsetzen.
- "Expo Router vs. React Navigation" war offen; aufgeloest als **Mobile Navigation Model**: React Navigation als primaeres Navigationssystem.
- "Welche Sheet-Grundlage nutzt RoomFull Mobile?" war offen; aufgeloest als **Mobile Sheet Presentation** innerhalb des React-Navigation-Modells, waehrend grosse Auswahlablaeufe vollflaechig bleiben.
- "`screens/` oder reine FSD-Layer" war offen; aufgeloest als **Mobile Screen Layer**: eigener, aber bewusst duenner Kompositionslayer.
- "My Bookings" drohte in V1 zu breit zu werden; aufgeloest als **Mobile My Bookings Scope**: keine Kalenderansicht als Muss, moeglichst nur eine primaere Darstellungsart.
- "Liste oder Karten" war offen; aufgeloest als **Mobile My Bookings Primary View**: Kartenansicht als einzige primaere Darstellung in V1.
- "`.ics` vielleicht direkt mitnehmen" wurde zunaechst als kein Kalenderexport in V1 aufgeloest und spaeter revidiert: **Mobile Calendar Export Scope** umfasst Personal Booking Calendar Export und Team Booking Share Calendar Export.
- "Was bedeutet kein Kalender-Sync trotz mobiler `.ics`-Exporte?" war offen; aufgeloest als **Mobile Calendar Integration Boundary**: einmalige Dateiuebergabe ohne dauerhafte Kalenderverbindung oder automatische Ruecksynchronisation.
- "Wie stark brechen wir My Bookings fuer V1 herunter?" war offen; aufgeloest und spaeter praezisiert als **Mobile My Bookings V1 Shape**: nur Kartenansicht ohne Switcher, aber mit persoenlichem Kalenderexport.
- "Wie viele Actions traegt eine Mobile-Booking-Card?" war offen; aufgeloest und mit wachsendem V1-Scope konkretisiert als **Mobile Booking Card Actions**: genau ein sichtbarer Einstieg `Buchung verwalten` auf aktiven anstehenden Cards, sonst keine Aktionsleiste.
- "Wo liegen Kalenderexport, Team Share und Storno auf Mobile?" war offen; aufgeloest als kontextsensitives **Mobile Booking Action Sheet** hinter `Buchung verwalten`.
- "Wie schwer duerfen die Section-Header wirken?" war offen; aufgeloest als **Mobile My Bookings Section Hierarchy**: klar getrennt, aber leichter als im Web.
- "Wie lang darf die Intro-Copy auf My Bookings sein?" war offen; aufgeloest als **Mobile My Bookings Intro Copy**: starke Headline, aber nur sehr kurzer Orientierungssatz.
- "Wie kompakt duerfen die Booking-Cards werden?" war offen; aufgeloest als **Mobile Booking Card Density**: spuerbar kompakter bei erhaltener Klarheit.
- "Wie schwer wirken UnitType- und Status-Chips mobil?" war offen; aufgeloest als **Mobile Booking Card Meta Form**: sichtbar, aber kompakt statt chip-schwer.
- "Soll der historische Bereich mobil offen starten?" war offen; aufgeloest als **Mobile My Bookings Default Collapse**: anstehend offen, historisch standardmaessig eingeklappt.
- "Wo stehen die Section-Counts mobil?" war offen; aufgeloest als **Mobile My Bookings Count Placement**: direkt im Header statt als eigener Count-Block.
- "Braucht Contact zwei grosse Bloecke vor dem Formular?" war offen; aufgeloest als **Mobile Contact Layout Density**: verdichteter Formular-Screen mit kurzer Intro.
- "Wie erscheint `Frage / Feedback / Kritik` mobil?" war offen; aufgeloest als **Mobile Contact Type Selector**: kompakte horizontale 3er-Auswahl.
- "Wie gross startet die Textarea mobil?" war offen; aufgeloest als **Mobile Contact Textarea Growth**: kompakt startend und bei Fokus/Eingabe wachsend.
- "Braucht Contact einen sticky Submit?" war offen; aufgeloest als **Mobile Contact Submit Placement**: normaler Formularabschluss, nicht sticky.
- "Custom Calendar ja, aber wie dicht?" war offen; aufgeloest als **Mobile Booking Flow Density**: verdichteter Ein-Screen-Flow statt langer Vollscroll-Form.
- "Wie lange bleibt der Kontextblock gross?" war offen; aufgeloest als **Mobile Booking Context Collapse**: zuerst praesent, danach kompakt einklappbar.
- "Start- und Endzeit gleichwertig offen?" war offen; aufgeloest als **Mobile Booking End Time Reveal**: Endzeit erst nach Startzeit und nur reduziert sichtbar.
- "Wie stark sticky und wann aktiv?" war offen; aufgeloest als **Mobile Booking Sticky Summary**: frueh sichtbar, aber progressiv aktivierend.
- "Wie hart bestaetigen wir Storno mobil?" war offen; aufgeloest als **Mobile Cancel Confirmation**: Bestatigungswort `STORNO` bleibt erhalten.
- "Contact drin oder raus?" war offen; aufgeloest als **Mobile Contact Scope**: Contact bleibt als bewusster V1-Slice enthalten.
- "Wie voll darf Account in V1 sein?" war offen; aufgeloest als **Mobile Account Scope**: ruhige Read-only-Uebersicht ohne Profilbearbeitung.
- "Wie viel Inhalt traegt die Booking-Options-Uebersicht mobil?" war offen; aufgeloest als **Mobile Booking Options Density**: verdichtete Auswahluebersicht statt Langkarten.
- "Button oder ganze Karte?" war offen; aufgeloest als **Mobile Booking Option Tap Surface**: die gesamte Karte ist die primaere Tap-Flaeche.
- "Wie viele konkrete Namen zeigen wir auf der Uebersicht?" war offen; aufgeloest als **Mobile Booking Option Preview Scope**: nur minimale Vorschau mit kleinem Ueberlaufhinweis.
- "Bleibt das vertikale Label so dominant?" war offen; aufgeloest als **Mobile Booking Option Label Style**: bleibt erhalten, aber in kompakter mobiler Form.
- "Wie dominant sind Count-Badges mobil?" war offen; aufgeloest als **Mobile Booking Option Count Hierarchy**: sichtbar, aber klar sekundaer.
- "Wie lang darf die Intro-Copy mobil sein?" war offen; aufgeloest als **Mobile Booking Options Intro Copy**: starke Headline, aber knapper Erklaersatz.
- "Alle vier Optionen direkt oder erst filtern?" war offen; aufgeloest als **Mobile Booking Options Entry Structure**: alle vier Optionen direkt sichtbar, kein vorgeschalteter Filter.
- "Wie gross bleibt der Hero auf der Detailseite?" war offen; aufgeloest als **Mobile Booking Option Detail Hero Density**: klarer Hero, aber deutlich kompakter als im Web.
- "Wie textreich sind die konkreten Raumkarten mobil?" war offen; aufgeloest als **Mobile Unit Choice Card Density**: verdichtete Auswahlkarten statt langer Textkarten.
- "Bleibt die grosse Nummerierung `01/02/03` mobil?" war offen; aufgeloest als **Mobile Unit Choice Numbering**: wenn ueberhaupt, dann nur subtil.
- "Wie schwer wirkt der Back-Link mobil?" war offen; aufgeloest als **Mobile Detail Back Navigation**: schlank und klar navigativ statt buttonhaft.
- "Ganze Raumkarte oder expliziter CTA?" war offen; aufgeloest als **Mobile Unit Choice CTA Shape**: kompakter expliziter CTA bleibt erhalten.
- "Wie stark trennen wir die Raumkarten visuell?" war offen; aufgeloest als **Mobile Unit Choice Separation**: ruhigere Trennung ueber Spacing und Card-Struktur.
- "Wie gross bleibt der Meta-Block mit Dauer/Verfuegbarkeit?" war offen; aufgeloest als **Mobile Detail Meta Facts**: sichtbar, aber kompakt.

**Booking Context Delivery Order**:
Der Backend-Endpoint fuer Booking Context wird vor der Create Booking Page umgesetzt.
_Avoid_: temporaere Frontend-Rekonstruktion gegen Public Unit APIs

**Auto-Assign Scope**:
Der Auto-Assign-Modus ist dauerhaft ausschließlich für `HOT_DESK` erlaubt.
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
Dauergrenzen werden pro UnitType in Minuten geführt und gemeinsam mit den übrigen zeitlichen Booking-Regeln durch die Booking Time Policy ausgewertet.
_Avoid_: globale harte Dauerkonstante oder separate Duration-Prüfung außerhalb der Booking Time Policy

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

**Team Booking Share**:
Ein optionaler, vom Customer kontrollierter Uebergabepunkt fuer eine eigene Booking mit kopierbaren Team-Member-Adressen, vorbereitetem Einladungstext und empfaengerfreundlichem Kalenderexport ohne garantierten Gaeste- oder Antwortfluss.
_Avoid_: RSVP-Versprechen, RoomFull als Absender, automatische E-Mail, persistierte Share-Historie

**Team Booking Share Handoff**:
Nach dem Kopieren oder Herunterladen uebernimmt der Customer den Versand und die weitere Kommunikation ausserhalb von RoomFull; verwendetes Team, Empfaengerauswahl und Nachricht werden nicht an der Booking gespeichert.
_Avoid_: Versandstatus in RoomFull, persistierte Booking-Team-Zuordnung, Synchronisation mit E-Mail- oder Kalender-Clients

**Team Booking Share Package**:
Die clientneutrale Uebergabe aus vier getrennten Aktionen fuer BCC-Adressen, Betreff, Einladungstext und Team Booking Share Calendar Export.
_Avoid_: `mailto:`-Flow, automatisches Oeffnen eines Versandclients, automatische Dateianhaenge, kombinierte Senden-Aktion

**Booking Invitation (superseded)**:
Der verworfene Ansatz einer lokal importierten `.ics` mit Organizer, Attendees und RSVP, der im Apple-Calendar-Prototyp weder Gaeste noch Nachricht oder bewussten Versandpfad uebernahm.
_Avoid_: Booking Invitation als aktueller Feature-Name, erneute Implementierung ohne neue Produktentscheidung

**Team Booking Share Entry**:
Eine optionale Aktion an einer erfolgreich erstellten eigenen Booking in "Meine Buchungen", die aus Karten-, Listen- und Kalenderansicht auf dieselbe Team Booking Share Page fuehrt.
_Avoid_: verpflichtendes Team, Share vor erfolgreicher Booking, Team-Auswahl im Buchungsformular, unterschiedliche Aktionen je My-Bookings-Darstellung

**Team Booking Share Page**:
Die geschuetzte Seite `/me/bookings/[bookingId]/share` fuer eine eligible eigene Booking mit Team- und Empfaengerauswahl, persoenlicher Nachricht, Warnungen und Team Booking Share Package.
_Avoid_: alte `/invite`-Route, umfangreicher Share inline in Booking-Darstellungen, Modal mit bis zu 50 Members

**Team Booking Share Empty State**:
Ohne ein nicht leeres eigenes Team verweist die Team Booking Share Page auf My Teams, ohne Team-Erstellung in den Share einzubetten.
_Avoid_: leeres Team auswaehlen, Inline-Team-CRUD, versteckter automatischer Ruecksprung

**Team Booking Share Team Availability**:
Die Share-Seite zeigt alle eigenen Team Summaries; leere Teams bleiben mit Member-Anzahl `0` sichtbar, sind nicht auswaehlbar und fuehren zur Teamverwaltung, waehrend ohne verwendbares Team zusaetzlich der Empty State erscheint.
_Avoid_: leere Teams verstecken, leeres Team auswaehlen, Members im Share anlegen

**Team Booking Share Team Selection**:
Der Customer waehlt genau ein nicht leeres Team ausdruecklich aus; kein Team wird automatisch vorausgewaehlt, und erst die Auswahl laedt dessen Detail und markiert alle Members initial als Empfaenger.
_Avoid_: einziges Team automatisch waehlen, Member-Daten beim Seitenaufruf vorladen, mehrere Teams kombinieren

**Team Booking Share Team Change**:
Beim Wechsel des ausgewaehlten Teams bleibt die Booking-bezogene persoenliche Nachricht erhalten, waehrend die Empfaengerauswahl verworfen und mit allen Members des neuen Teams neu aufgebaut wird.
_Avoid_: Member-Ausnahmen zwischen Teams uebertragen, persoenliche Nachricht beim Teamwechsel verlieren, Members mehrerer Teams vermischen

**Team Booking Share Recipient Selection**:
Die fluechtige Auswahl verwendet genau ein Team, markiert zunaechst alle Team Members und erlaubt deren Abwahl, ohne das gespeicherte Team zu veraendern.
_Avoid_: mehrere kombinierte Teams, persistierte Auswahl an der Booking, Team bearbeiten muessen fuer einen einmaligen Share

**Team Booking Share Readiness**:
Alle vier Aktionen des Team Booking Share Package sind erst nach bewusster Teamwahl mit mindestens einem ausgewaehlten Team Member verfuegbar.
_Avoid_: Share ohne Empfaenger, einzelne Package-Aktion vorzeitig freigeben, leere BCC-Uebergabe kopieren

**Team Booking Share Recipient Privacy**:
Ausgewaehlte Team-Member-Adressen werden fuer das BCC-Feld des externen Versandwerkzeugs uebergeben, damit Empfaenger ihre Adressen nicht gegenseitig sehen.
_Avoid_: Adressen fuer sichtbares An oder CC vorbereiten, gegenseitige Sichtbarkeit voraussetzen, Datenschutzwirkung eines fremden Versandwerkzeugs garantieren

**Team Booking Share Recipient Format**:
Die BCC-Uebergabe besteht ausschliesslich aus normalisierten kleingeschriebenen E-Mail-Adressen in einer mit Komma und Leerzeichen getrennten Liste.
_Avoid_: Member-Namen im Clipboard, `Name <email>`-Format, semikolon- oder clientspezifische Ausgabe

**Team Booking Share Message**:
Ein optionaler, nicht gespeicherter Text des Customers, der zusammen mit den Booking-Daten als kopierbarer Einladungstext vorbereitet wird.
_Avoid_: gespeicherte Nachrichtenvorlage, Nachrichtenhistorie, Freitext an der Booking

**Team Booking Share Content**:
Der generierte Betreff und Einladungstext aus nicht editierbaren Booking-Fakten, neutraler Begruessung, optionaler persoenlicher Nachricht und Hinweis auf den manuell anzuhaengenden Kalenderexport.
_Avoid_: editierbare Booking-Fakten im Share, nur die persoenliche Nachricht kopieren, vom gespeicherten Booking-Zeitraum abweichende Angaben erzeugen

**Team Booking Share Language**:
Die aktive Client-Locale bestimmt Sprache sowie Datums- und Textformat des Team Booking Share Content: im Web die Localized Route, in Mobile die Mobile Locale. Der Share besitzt keinen eigenen Sprachzustand.
_Avoid_: separater Sprachschalter im Share, von der aktiven Client-Locale abweichende Copy-Locale, sprachunabhaengige feste deutsche Share-Copy

**Personal Booking Calendar Export**:
Die bestehende getrennte Aktion "Zum Kalender hinzufuegen" erzeugt fuer eine eigene aktive anstehende Booking eine persoenliche Kalenderdatei ohne Team Members.
_Avoid_: Team Booking Share voraussetzen, durch Team Booking Share ersetzen, Gaeste oder RSVP in den persoenlichen Export aufnehmen

**Team Booking Share Calendar Export**:
Die empfaengerfreundliche Kalenderdatei des Share Package mit Titel, Zeitraum, BookableUnit und stabiler Booking Calendar UID, aber ohne sichtbare Booking-ID, internen Status, persoenliche Nachricht, Organizer, Attendees oder RSVP.
_Avoid_: Personal Booking Calendar Export unveraendert weitergeben, interne Booking-Metadaten offenlegen, Share-Nachricht in der Datei duplizieren

**Booking Calendar UID**:
Eine stabile Kalenderidentitaet pro Booking, die Personal Booking Calendar Export und Team Booking Share Calendar Export als dasselbe Ereignis kennzeichnet.
_Avoid_: neue UID pro Download, unterschiedliche UIDs fuer persoenlichen und empfaengerfreundlichen Export, Booking-ID als sichtbare Share-Historie

**Team Booking Share Context**:
Der Customer-eigene Backend-Contract fuer die autorisierte Booking- und BookableUnit-Grundlage einer Team Booking Share Page, der Ownership und Eligibility aus der Session prueft.
_Avoid_: alle eigenen Bookings laden und im Frontend suchen, `userId` im Request, Frontend als fachliche Eligibility-Quelle

**Team Booking Share Context Errors**:
Der Share Context nutzt `401` ohne Session, `403` fuer Nicht-Customers, `404` gleichermassen fuer fehlende und fremde Bookings sowie `409` fuer eine eigene, aber nicht mehr eligible Booking.
_Avoid_: Ownership-Leak durch `403`, fremde Booking von fehlender unterscheiden, eigene ineligible Booking als unbekannt behandeln

**Team Booking Share Eligibility**:
Ein Team Booking Share darf nur fuer eine eigene Booking mit `status=ACTIVE` und `endTime >= now` vorbereitet werden; gerade laufende Bookings und der exakte Endzeitpunkt sind eingeschlossen.
_Avoid_: Share fuer fremde, stornierte oder beendete Bookings, laufende Booking vorzeitig ausschliessen

**Team Booking Share Capacity Warning**:
Uebersteigt die Zahl ausgewaehlter Team Members die Kapazitaet der gebuchten BookableUnit, warnt RoomFull ohne den Team Booking Share zu blockieren.
_Avoid_: Customer automatisch mitzaehlen, Kapazitaetswarnung als neue Booking-Regel, Share technisch verhindern

**Team**:
Eine private, benannte Kontaktgruppe eines Customers, die leer angelegt werden darf und ab einem Team Member fuer Team Booking Shares nutzbar ist.
_Avoid_: Organisation, geteilter Workspace, kollaborative RoomFull-Mitgliedschaft

**Team Name Uniqueness**:
Ein normalisierter Teamname identifiziert innerhalb der privaten Teams eines Customers genau ein Team.
_Avoid_: gleich benannte Teams desselben Customers, globale Namenseindeutigkeit ueber verschiedene Customers

**Team Deletion**:
Die bestaetigte, endgueltige Entfernung eines Teams einschliesslich aller zugeordneten Team Members sowie die automatische Entfernung aller Teams bei spaeterer Loeschung ihres Customers.
_Avoid_: Soft Delete, Papierkorb, verwaiste Teams oder Team Members, Einladungsverlauf erhalten

**Team Collection Limits**:
Ein Customer darf hoechstens 20 Teams mit jeweils hoechstens 50 Team Members verwalten.
_Avoid_: unbegrenzte private Kontaktdatenhaltung, Limits nur im Frontend

**Team Input Limits**:
Teamnamen erlauben 1 bis 80, Team-Member-Namen 1 bis 100, E-Mail-Adressen hoechstens 254 und persoenliche Einladungsnachrichten hoechstens 500 Zeichen.
_Avoid_: unbegrenzte Freitexte, leere Namen, Limits nur im Frontend

**My Teams**:
Der geschuetzte Customer-Bereich `/me/teams` mit Teamname und Member-Anzahl je Eintrag, erreichbar ueber Profilmenue und Account Overview.
_Avoid_: Team-CRUD direkt in Account Overview, alle Members verschachtelt in der Uebersicht, globale Hauptnavigation, Admin-Verwaltungsbereich

**Team Detail**:
Die geschuetzte Customer-Seite `/me/teams/[teamId]` fuer Umbenennen und Loeschen genau eines eigenen Teams sowie Hinzufuegen, Bearbeiten und Entfernen seiner Team Members.
_Avoid_: fremde Teams ueber erratene IDs, Member-Verwaltung ohne Teamkontext, alle Teams in einem verschachtelten Formular

**Team Creation Flow**:
Ein Customer legt zuerst das benannte Team an und fuegt Team Members anschliessend einzeln in dessen Verwaltung hinzu.
_Avoid_: verschachtelte atomare Erstellung von Team und beliebig vielen Team Members, Members vor gespeichertem Team

**Team Display Order**:
Teams und Team Members erscheinen gemaess aktiver UI-Sprache alphabetisch, bei gleichen Member-Namen zusaetzlich nach E-Mail-Adresse.
_Avoid_: Erstellreihenfolge als fachliche Ordnung, manuelle Sortierung, sprachunabhaengige rohe DB-Sortierung

**Customer Team Permission**:
Ausschliesslich Customers duerfen eigene Teams verwalten und fuer Team Booking Shares verwenden.
_Avoid_: Admin-Teamverwaltung, fremde Teams lesen oder veraendern, Rolle nur im Frontend pruefen

**My Teams API**:
Der Customer-eigene CRUD-Contract fuer Teams und verschachtelte Team Members unter `/api/me/teams`, der Rolle und Ownership ausschliesslich aus der authentifizierten Session ableitet.
_Avoid_: `userId` im Client-Request, fremde Teamressourcen adressieren, nur clientseitiger Zugriffsschutz, ICS-Generate-Endpoint

**Team Summary Contract**:
Die Teamliste liefert nur ID, Name und Member-Anzahl, waehrend personenbezogene Team-Member-Daten erst ueber das Detail des geoeffneten oder ausgewaehlten Teams geladen werden.
_Avoid_: alle Members aller Teams in der Listenresponse, personenbezogene Daten auf Vorrat laden

**My Teams API Errors**:
Der Team-Contract nutzt `400` fuer Input, `401` fuer fehlende Authentifizierung, `403` fuer falsche Rollen, `404` gleichermassen fuer fehlende und fremde Ressourcen sowie `409` fuer Duplikate und erreichte Mengenlimits.
_Avoid_: `403` als Ownership-Leak, unterschiedliche Fehler fuer fehlende und fremde IDs, vorgezogene Application-Error-Codes nur fuer Teams

**Team Contact Transparency**:
"Meine Teams" erklaert dauerhaft die verantwortliche Speicherung und externe Verwendung der gepflegten Kontaktdaten; der Team Booking Share weist auf das Einfuegen der ausgewaehlten Adressen in BCC hin.
_Avoid_: versteckte Datenverwendung, wiederholte Pflicht-Checkbox pro Team Member, rechtliche Einwilligung durch UI behaupten

**Team Demo Data Boundary**:
Die oeffentliche Portfolio-Instanz erlaubt fuer Teams nur fiktive Demo-Kontakte und muss diese Grenze in der UI verstaendlich machen, weil Teamkontakte sonst zum Eingeben echter Drittadressen einladen. Echte Einladungstests bleiben lokal auf eigene kontrollierte Adressen begrenzt.
_Avoid_: reale Kontaktdaten Dritter in Production, Production als echter Coworking-Service, Demo-UI ohne sichtbaren Datenhinweis

**Demo Customer**:
Ein normaler Customer-Zugang fuer die oeffentliche Portfolio-Demo, dessen Daten vorbefuellt und zuruecksetzbar sind, ohne ein neues Rollenmodell einzufuehren.
_Avoid_: Guest als eigene Rolle, Demo-Zugang als Admin, Demo-Daten in regulaere Customer-Konten mischen

**Demo Customer Session**:
Eine isolierte, frische Kopie eines Demo Customers fuer genau einen Portfolio-Besucher, die beim Guest-Login erzeugt und spaeter zeitverzoegert bereinigt wird.
_Avoid_: gemeinsam genutzter Demo-Account fuer alle Besucher, gegenseitig sichtbare Demo-Aenderungen, Reset nur ueber sauberen Logout

**Demo Customer Marker**:
Ein Demo Customer ist explizit als Demo markiert und besitzt eine Ablaufzeit, bleibt aber fachlich ein Customer.
_Avoid_: Demo-Erkennung ueber E-Mail-Konventionen, neue Demo-Rolle, versteckte Seed-Namensmuster als Berechtigungsquelle

**Demo Customer Data Template**:
Die frischen Daten einer Demo Customer Session entstehen beim Guest-Login aus einem backendseitigen Template mit relativen Datums-Offsets.
_Avoid_: alternde statische Seed-Bookings, DB-Template-Verwaltung im ersten Slice, Frontend-generierte Demo-Fachlogik

**Guest Login Entry**:
Der Guest-Login ist ein oeffentlicher Demo-Einstieg in eine frische Demo Customer Session und erscheint nur an Portfolio- und Auth-Einstiegen.
_Avoid_: Guest-Login als Profilaktion, sichtbare Demo-Rolle im Account, Admin-Einstieg fuer oeffentliche Besucher

**Demo Customer Permission Boundary**:
Ein Demo Customer darf normale Customer-Funktionen ausprobieren, aber keine Account-Sicherheitsdaten oder dauerhafte regulaere Customer-Identitaet veraendern.
Kuenftige Account-Mutationen fuer Name, E-Mail, Passwort, Credential-Status, Account-Loeschung oder Umwandlung in einen regulaeren Account muessen `isDemo=true` backendseitig vor Persistenz mit `403 Forbidden` ablehnen.
_Avoid_: Passwort- oder E-Mail-Aenderung im Demo-Zugang, Demo-Session in regulaeren Account umwandeln, Admin-Rechte fuer Demo-Besucher

**Admin Demo Data Boundary**:
Admin-Demo-Daten sind kuratierte Seed- oder spaetere Simulationsdaten und werden nicht aus oeffentlichen Demo Customer Sessions gespeist.
_Avoid_: Admin-Demo als zufaellige Besucheraktivitaet, Portfolio-Besucher-Daten in Admin-Vorfuehrdaten mischen, Traffic-Simulation als Teil des Guest-Login-Slices

**Team Member**:
Ein genau einem Team zugeordneter Kontakt aus Name und E-Mail-Adresse, der weder einen RoomFull-Account benoetigt noch mit bestehenden Users abgeglichen wird.
_Avoid_: zentraler teamuebergreifender Kontakt, Team Member als Synonym fuer User, Registrierungspflicht, Account-Verknuepfung, Zustimmungsworkflow

**Team Member Email Uniqueness**:
Eine normalisierte E-Mail-Adresse identifiziert innerhalb eines Teams genau einen Team Member, darf aber in anderen Teams desselben Customers erneut vorkommen.
_Avoid_: doppelte Empfaenger innerhalb eines Teams, globale E-Mail-Eindeutigkeit ueber alle Teams

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
Ein Admin verwaltet im MVP das buchbare Inventar als BookableUnits: Name, deutsche und englische Beschreibung, Kapazitaet, UnitType, Area, Sortierung und Aktivierungsstatus.
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
Eine zeitlich begrenzte Sperrung einer ansonsten aktiven BookableUnit ist als eigener Use Case in der `ROADMAP.md` vorgemerkt und gehoert nicht zum aktuellen Admin Unit Management.
_Avoid_: temporaere Sperrzeiten in `isActive` oder Deaktivierung hineinmodellieren

**Admin Unit Editable Fields**:
Admins duerfen an BookableUnits Name, deutsche und englische Beschreibung, Kapazitaet, UnitType, Area, DisplayOrder und Aktivierungsstatus bearbeiten. Das technische Legacy-Feld `description` folgt der deutschen Beschreibung. Technische IDs, Zeitstempel, bestehende Bookings und UnitType-Dauerregeln sind nicht Teil des Unit-Formulars.
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

**Admin Booking Filter**:
Die V1-Filter der Admin Booking Operations View: Heute, Anstehend, Abgeschlossen, Storniert und Alle.
_Avoid_: unklare Mischung aus Status und Zeitraum ohne definierte Bedeutung

**Admin Booking Sort Order**:
Die Sortierung je Admin Booking Filter: Anstehend und Heute nach Startzeit aufsteigend, Abgeschlossen nach Endzeit absteigend, Storniert nach Aktualisierung absteigend.
_Avoid_: eine globale Sortierung fuer alle operativen Situationen

**Admin Booking Summary**:
Kleine operative Kennzahlen der Admin Booking Operations View fuer Heute, Anstehend, Storniert und die meistgebuchte aktive BookableUnit. Sie folgen Zeitraum und Customer-Suche, aber nicht dem gewählten View-Status oder Listenlimit.
_Avoid_: Charts oder Analytics-Auswertung in V1

**Admin Analytics Dashboard**:
Das umgesetzte Dashboard auf `/admin` stellt Buchungsdaten als auswertbare Kennzahlen und Charts dar.
_Avoid_: reine Arbeitsbereich-Navigation, dekorative Graphen ohne Admin-Entscheidungswert

**Admin Analytics Primary Question**:
Die zentrale Frage des Admin Analytics Dashboard ist, wie sich Nachfrage ueber Zeit entwickelt.
_Avoid_: Revenue-Auswertung ohne Pricing, reine Inventarverwaltung, Chart-Auswahl ohne Leitfrage

**Admin Booking Demand**:
Die Nachfrage-Metrik fuer Analytics ist die Anzahl aktiver Bookings gruppiert nach Booking-Startdatum.
_Avoid_: Availability-Checks, Seitenaufrufe, gebuchte Stunden als erste Nachfrage-Definition

**Admin Analytics Default Window**:
Das Default-Fenster fuer Analytics umfasst 30 Tage zurueck und 30 Tage voraus, jeweils nach Booking-Startdatum.
_Avoid_: rein historische Auswertung als Default, Erstellzeitpunkt der Booking als Nachfragezeitpunkt

**Admin Analytics Chart Set**:
Das Admin Analytics Dashboard zeigt Nachfrageverlauf, Nachfrage nach UnitType und Stornoquote im gewaehlten Zeitraum.
_Avoid_: Inventarstatus als Hauptchart, Revenue-Charts ohne Pricing, dekorative Charts ohne Nachfragebezug

**Admin Booking Query**:
Der Backend-Contract fuer die Admin Booking Operations View mit Query-Filtern fuer Status, Zeitraum, Customer-Suche und Limit. Er liefert Bookings, effektiven Zeitraum und Admin Booking Summary gemeinsam.
_Avoid_: alle historischen Bookings ungefiltert laden und nur clientseitig sortieren

**Admin Booking Range Preset**:
Ein rollierender Berliner Kalenderzeitraum fuer die Admin Booking Query: Woche, Monat, Quartal oder Jahr. Das Backend löst seine Richtung passend zum Admin Booking View Status auf; explizite `from/to`-Werte ersetzen das Preset.
_Avoid_: Browser-Clock als fachliche Zeitraumquelle, Preset gleichzeitig mit `from/to`

**Admin Booking Search**:
Eine operative Suche in der Admin Booking Operations View nach Customer-Name oder Customer-E-Mail.
_Avoid_: Volltextsuche ueber Unit-Namen, Datumswerte oder alle Booking-Felder

**Admin Booking Date Range**:
Der vom Backend aufgelöste inklusive Kalenderzeitraum der Admin Booking Query im Format `YYYY-MM-DD`, abgeleitet aus einem Admin Booking Range Preset oder expliziten `from/to`-Werten.
_Avoid_: Uhrzeitfilter in V1

**Admin Booking Query Default Window**:
Das V1-Default-Fenster der Admin Booking Query: 30 Tage und `limit=100`. Anstehende Bookings laufen ab heute vorwärts, historische Filter rückblickend, `all` umfasst Vergangenheit und Zukunft um heute herum.
_Avoid_: unlimitierte Admin-Listen

**Admin Booking View Status**:
Der `status`-Querywert der Admin Booking Query: `upcoming`, `today`, `completed`, `cancelled` oder `all`.
`all` bedeutet alle Booking-Status im gewählten Zeitraum, nicht nur Historie.
_Avoid_: rohe DB-Statuswerte `ACTIVE` und `CANCELLED` als alleinige Admin-Filter

**Admin Cancel Scope**:
Admins duerfen keine fremden Bookings stornieren.
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
- Der buchende **Customer** kontrolliert den **Team Booking Share Handoff**; RoomFull versendet weder E-Mail noch Kalendereinladung.
- Der **Team Booking Share Handoff** trennt die gespeicherte **Booking** von Versand und Kommunikation ausserhalb RoomFull.
- Das **Team Booking Share Package** uebergibt BCC-Adressen, Betreff, Einladungstext und **Team Booking Share Calendar Export** ueber getrennte clientneutrale Aktionen.
- Die **Booking Invitation** ist durch den fehlgeschlagenen Apple-Calendar-Prototyp als aktueller Loesungsansatz verworfen.
- Der **Team Booking Share Entry** haelt **Teams** und Shares optional und vom Create-Booking-Flow getrennt.
- Karten-, Listen- und Kalenderansicht fuehren mit derselben Aktion zur **Team Booking Share Page**.
- Der **Team Booking Share Empty State** unterbricht den Flow bewusst, bis der Customer ein verwendbares Team in **My Teams** gepflegt hat.
- **Team Booking Share Team Availability** haelt leere Teams sichtbar, aber nicht auswaehlbar.
- **Team Booking Share Team Selection** macht die bewusste Teamwahl zur Grenze vor dem Laden personenbezogener Member-Daten.
- **Team Booking Share Team Change** erhaelt Booking-bezogenen Text und setzt Team-bezogene Empfaenger zurueck.
- **Personal Booking Calendar Export** und **Team Booking Share Calendar Export** bleiben getrennte Artefakte derselben eligible Booking.
- Die **Booking Calendar UID** kennzeichnet beide Kalenderartefakte als dasselbe Ereignis.
- Der **Mobile Calendar File Handoff** uebergibt beide Kalenderartefakte temporaer an das native Share Sheet, ohne Kalenderkonto oder Kalenderberechtigung.
- Der **Team Booking Share Context** schuetzt und liefert die Booking-Grundlage der **Team Booking Share Page** unabhaengig von den Team-Daten.
- **Team Booking Share Context Errors** verbergen fremde Bookings und machen einen Eligibility-Verlust der eigenen Booking unterscheidbar.
- **Team Booking Share Eligibility** entspricht dem fachlichen Geltungsbereich des persoenlichen Kalenderexports fuer eigene Bookings.
- Die **Team Booking Share Capacity Warning** weist auf ein moegliches Missverhaeltnis hin, ohne eine gespeicherte Teilnehmerzahl oder Anwesenheit des Customers zu behaupten.
- Die **Team Booking Share Recipient Selection** leitet Empfaenger aus einem **Team** ab, veraendert oder persistiert dieses aber nicht.
- **Team Booking Share Readiness** verlangt mindestens einen ausgewaehlten Empfaenger fuer alle vier Aktionen des **Team Booking Share Package**.
- **Team Booking Share Recipient Privacy** macht BCC zum vorgesehenen externen Empfaengerfeld, ohne den Versandclient zu kontrollieren.
- **Team Booking Share Recipient Format** haelt die BCC-Uebergabe auf eine einfache kommagetrennte Adressliste beschraenkt.
- Die **Team Booking Share Message** existiert nur waehrend der Vorbereitung und im anschliessend kopierten Inhalt.
- **Team Booking Share Content** verbindet die fachlich unveraenderten Booking-Daten mit der optionalen persoenlichen Nachricht.
- **Team Booking Share Language** leitet die Share-Copy aus der aktiven Client-Locale ab.
- Ein **Customer** besitzt seine privaten **Teams**; andere Users werden dadurch nicht zu Teammitgliedern innerhalb RoomFull.
- **Team Name Uniqueness** haelt die privaten Teams eines Customers in Auswahl und Verwaltung unterscheidbar.
- **Team Deletion** entfernt die private Kontaktgruppe vollstaendig, da weder Bookings noch Team Booking Shares auf sie verweisen.
- Eine spaetere Loeschung des owning **Customers** loest **Team Deletion** fuer alle zugeordneten Teams aus.
- **Team Collection Limits** werden als verbindliche Backend-Regeln unabhaengig von aktuellen Raumkapazitaeten durchgesetzt.
- **Team Input Limits** werden verbindlich im Backend und unterstuetzend im Frontend validiert.
- **My Teams** ist ein eigener Customer-Bereich neben Account Overview und My Bookings.
- Ein Eintrag in **My Teams** fuehrt zur **Team Detail** seines eigenen Teams.
- Der **Team Creation Flow** nutzt die erlaubte leere Ausgangsform eines **Teams** fuer kleine, getrennt validierbare Schritte.
- **Team Display Order** wird als lokalisierte Darstellung angewendet und ist kein gespeichertes Teamattribut.
- **Customer Team Permission** schuetzt Teamverwaltung und Share-Nutzung im Backend sowie ihre Einstiege im Frontend.
- Die **My Teams API** setzt **Customer Team Permission**, Ownership und Teamregeln als fachliche Wahrheit im Backend durch.
- Der **Team Summary Contract** trennt schlanke Team-Auswahl von bedarfsgeladenen Team-Member-Daten.
- **My Teams API Errors** verbergen fremde Teamressourcen und bleiben bis zum separaten Error-Code-Slice bei HTTP-Status plus technischer Fallback-Message.
- **Team Contact Transparency** begleitet Speicherung und konkrete Verwendung der Team-Member-Daten an den jeweils relevanten UI-Stellen.
- **Team Demo Data Boundary** konkretisiert die globale Demo-Daten-Policy fuer private Teamkontakte und Team Booking Shares.
- Ein **Team** enthaelt mehrere **Team Members**; dieselbe Person darf als unabhaengiger Kontakt in mehreren Teams vorkommen.
- Ein leeres **Team** ist gueltig, kann aber erst ab einem **Team Member** fuer einen **Team Booking Share** verwendet werden.
- Ein **Team Member** ist ein Kontakt des Customers und kein **User** von RoomFull.
- **Team Member Email Uniqueness** verhindert doppelte Teilnehmende innerhalb eines Teams, ohne teamuebergreifende Kontakte einzufuehren.
- **Booking Target** ist die **BookableUnit**.
- **Booking Request Modes** vereinheitlichen direkte Unit-Buchung und Area-basierte Hot-Desk-Auto-Zuweisung über alle Booking-Flow-Schritte.
- **Booking Time Input** wird durch **Booking Time Grid**, Öffnungszeiten und **Duration Policy** validiert.
- **Booking Time Display** projiziert sichtbare Booking-Zeitpunkte unabhängig von der Browser-Zeitzone nach `Europe/Berlin`.
- Die **Home Page** ist der Service-Einstieg; die **Booking Options Page** ist der fokussierte Buchungseinstieg.
- Die **Home Page** zeigt neben "Jetzt Platz finden" genau eine auth-aware Sekundaeraktion: anonym "Einloggen", angemeldeten Users "Meine Buchungen". Registrierung bleibt ueber Menue und Auth-Wechsel erreichbar.
- Angebots-Teaser auf der **Home Page** fuehren zu `/booking-options/[slug]`, nicht direkt zu `/bookings/new`.
- Die **Home Page** nennt BookingOption-Teaser in der UI "Arbeitsbereiche".
- Die **Home Page** nutzt **BookingOptions** als Datenbasis, praesentiert sie aber kuratiert als Service-Angebote.
- Die **Home Page** teasert Varianten nur an; konkrete Area- oder Unit-Varianten werden erst auf `/booking-options/[slug]` ausgewaehlt.
- Die **Home Page** nutzt Farbe, vertikales Kategorie-Label und Typografie als **Home UnitType Teaser Signal**; sie verwendet keine zusaetzlichen UnitType-SVG-Icons.
- Die **Booking Options Page** bleibt eine Kategorie-Übersicht und zeigt aktive Area- oder Unit-Namen nur als Vorschau; konkrete Auswahl passiert auf `/booking-options/[slug]`.
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
- **Direct Booking Calendar State** liefert die Monatszustände einer konkreten **BookableUnit** mit einem Request.
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
- Profilbearbeitung und Passwortaenderung sind als eigene Account-Feature-Slices in der `ROADMAP.md` vorgemerkt und keine Platzhalter in **Account Overview**.
- **Frontend Session** ist die zentrale Quelle fuer Auth-Zustand im Frontend; Header und auth-required UI konsumieren sie statt Cookies oder Einzelrequests als eigene Auth-Quelle zu behandeln.
- **Mobile Session** ist die von der Web-Session unabhaengig aufgebaute authentifizierte Beziehung der Mobile-App zum selben User und denselben Customer-Berechtigungen im RoomFull-Backend.
- **Session User** haelt die Session-relevanten User-Daten ohne direkte Kopplung an das User-Entity-Modell.
- **Session Lifecycle** trennt Nutzeraktionen wie Login/Register/Logout vom serverseitig kontrollierten HttpOnly-Cookie.
- **Authenticated API Request** haelt Cookie- und Transportdetails aus Pages, Widgets, Features und fachlichen API-Funktionen heraus.
- **Auto-Assign Scope** begrenzt den Automatikmodus dauerhaft auf `HOT_DESK`.
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
- **Admin Booking Filter** nutzt "Anstehend" als Default; "Heute" ist der operative Tagesfilter.
- **Admin Booking Sort Order** passt sich dem gewaehlten Filter an.
- **Admin Booking Summary** zeigt in V1 nur operative Zahlen, keine Graphs.
- **Admin Analytics Dashboard** erweitert `/admin` um entscheidungsorientierte Auswertungen.
- **Admin Analytics Primary Question** priorisiert Nachfrageentwicklung vor reiner Navigation oder Inventarpflege.
- **Admin Booking Demand** beantwortet die Nachfragefrage zuerst ueber aktive Bookings nach Startdatum.
- **Admin Analytics Default Window** verbindet historische Nutzung mit erwarteter Nachfrage.
- **Admin Analytics Chart Set** operationalisiert Nachfrageentwicklung ueber Verlauf, UnitType-Mix und Stornoquote.
- **Admin Booking Query** stuetzt Admin-Filter serverseitig, damit simulierte Daily-Traffic-Daten die UI nicht unkontrolliert aufblasen.
- **Admin Booking Search** ergaenzt die **Admin Booking Query** um Customer-Identitaet, waehrend **Admin Booking Date Range** Zeitraumfragen abbildet.
- **Admin Booking Date Range** filtert tageweise, nicht nach Uhrzeit.
- **Admin Booking Query Default Window** verhindert unlimitierte Admin-Listen.
- **Admin Booking View Status** mappt Admin-Filter auf DB-Status und Zeitlogik: upcoming, today, completed, cancelled, all.
- **Admin Cancel Scope** schliesst Fremd-Stornos durch Admins aus.

## Example dialogue

> **Dev:** "Ist ein Hot Desk bei uns ein Bereich mit vielen parallelen Plätzen?"
> **Domain expert:** "Nein. In V1 ist Hot Desk ein einzelner buchbarer Space, wie jeder andere UnitType auch."
>
> **Dev:** "Muessen die Kollegen aus Manfreds HR-Team bei RoomFull registriert sein?"
> **Domain expert:** "Nein. Manfred pflegt sie als Team Members und uebernimmt Empfaenger, Text und die empfaengerfreundliche Kalenderdatei aus dem Team Booking Share in sein eigenes Versandwerkzeug."

## Flagged ambiguities

- "Bleibt eine echte RSVP-faehige Kalendereinladung Teil des MVP?" war offen; aufgeloest: nein, der gescheiterte **Booking Invitation**-Ansatz wird durch **Team Booking Share** ohne Gaeste- oder Antwortversprechen ersetzt.
- "Wer versendet an Team Members?" war offen; aufgeloest: ausschliesslich der **Customer** ausserhalb RoomFull; RoomFull versendet keine E-Mail oder Kalendereinladung.
- "Was uebergibt RoomFull fuer den Versand?" war offen; aufgeloest: kopierbare Empfaengeradressen, einen vorbereiteten Einladungstext und den **Team Booking Share Calendar Export**.
- "Oeffnet RoomFull automatisch ein Mailprogramm?" war offen; aufgeloest: nein, das **Team Booking Share Package** bleibt clientneutral und vermeidet `mailto:` sowie automatische Anhaenge.
- "Speichert RoomFull verwendetes Team, Empfaengerauswahl, Nachricht oder Versandstatus?" war offen; aufgeloest: nein, der **Team Booking Share Handoff** ist fluechtig und endet an der Systemgrenze.
- "Wann waehlt der Customer ein Team fuer den Share?" war offen; aufgeloest: erst nach erfolgreicher Booking ueber den optionalen **Team Booking Share Entry**, nicht im Buchungsformular.
- "Wo findet der Team Booking Share statt?" war offen; aufgeloest: auf der **Team Booking Share Page** `/me/bookings/[bookingId]/share`, erreichbar mit Action Parity aus allen My-Bookings-Darstellungen.
- "Was passiert ohne verwendbares Team?" war offen; aufgeloest: Der **Team Booking Share Empty State** verlinkt zu My Teams, ohne Team-CRUD einzubetten.
- "Werden leere Teams im Share versteckt?" war offen; aufgeloest: nein, **Team Booking Share Team Availability** zeigt sie mit `0 Members` deaktiviert und verlinkt ihre Verwaltung.
- "Wird ein verwendbares Team automatisch vorausgewaehlt?" war offen; aufgeloest: nein, **Team Booking Share Team Selection** verlangt auch bei genau einem Team eine bewusste Auswahl.
- "Was bleibt beim Wechsel des ausgewaehlten Teams erhalten?" war offen; aufgeloest: **Team Booking Share Team Change** behaelt die persoenliche Nachricht und setzt die Empfaengerauswahl auf alle Members des neuen Teams zurueck.
- "Braucht eine Booking ein Team?" war offen; aufgeloest: nein, **Teams** und **Team Booking Shares** bleiben fuer den Create-Booking-Flow optional.
- "Fuer welche Bookings darf ein Share vorbereitet werden?" war offen; aufgeloest: nur fuer eigene, aktive und anstehende Bookings gemaess **Team Booking Share Eligibility**.
- "Darf eine bereits laufende Booking noch geteilt werden?" war offen; aufgeloest: ja, **Team Booking Share Eligibility** gilt bis zum Booking-Ende.
- "Ist der exakte Booking-Endzeitpunkt noch eligible?" war offen; aufgeloest: ja, **Team Booking Share Eligibility** uebernimmt `endTime >= now` von **Upcoming Booking**.
- "Wo wird Share-Ownership und Eligibility geprueft?" war offen; aufgeloest: im **Team Booking Share Context** unter `GET /api/me/bookings/:bookingId/share-context`, nicht aus einer Frontend-Liste.
- "Wie unterscheiden sich fremde und eigene nicht mehr eligible Bookings?" war offen; aufgeloest: **Team Booking Share Context Errors** verwenden `404` fuer fehlend oder fremd und `409` fuer eigene ineligible Bookings.
- "Blockiert eine zu grosse Empfaengerauswahl den Share?" war offen; aufgeloest: nein, die **Team Booking Share Capacity Warning** informiert deutlich, bleibt aber nicht blockierend.
- "Muss fuer eine einmalige Abweichung das Team geaendert werden?" war offen; aufgeloest: nein, bei der **Team Booking Share Recipient Selection** duerfen einzelne Team Members fluechtig abgewaehlt werden.
- "Darf der bestehende persoenliche Kalenderexport an Team Members weitergegeben werden?" war offen; aufgeloest: nein, wegen sichtbarer interner Booking-Metadaten nutzt das Share Package einen getrennten **Team Booking Share Calendar Export**.
- "Braucht der mobile `.ics`-Export einen eigenen Native Build oder direkten Kalenderzugriff?" war offen; aufgeloest: nein, der **Mobile Calendar File Handoff** nutzt Expo-Go-kompatible Datei- und Sharing-Module; die reale iPhone-Ziel-App-Auswahl wird dennoch im Development Build und ueber TestFlight abgenommen.
- "Ist der Team Booking Share Calendar Export ohne Empfaenger verfuegbar?" war offen; aufgeloest: nein, **Team Booking Share Readiness** schaltet alle vier Package-Aktionen gemeinsam frei; der separate persoenliche Export bleibt unabhaengig.
- "Duerfen mehrere Teams fuer einen Share kombiniert werden?" war offen; aufgeloest: nein, die **Team Booking Share Recipient Selection** verwendet genau ein Team.
- "Sollen Team Members die Adressen der anderen Empfaenger sehen?" war offen; aufgeloest: nein, **Team Booking Share Recipient Privacy** sieht die Uebergabe fuer BCC vor.
- "Welches Format kopiert die BCC-Aktion?" war offen; aufgeloest: **Team Booking Share Recipient Format** nutzt nur normalisierte E-Mail-Adressen, getrennt durch `, `.
- "Speichert RoomFull die persoenliche Share-Nachricht?" war offen; aufgeloest: nein, die **Team Booking Share Message** wird nur in den aktuell kopierten Einladungstext aufgenommen.
- "Welche Inhalte darf der Customer im Share veraendern?" war offen; aufgeloest: nur die optionale persoenliche Nachricht; Betreff und Booking-Fakten des **Team Booking Share Content** werden aus der Booking erzeugt.
- "Hat der Share eine eigene Sprachauswahl?" war offen; aufgeloest: nein, **Team Booking Share Language** folgt der aktiven Client-Locale.
- "Wie bestimmt RoomFull Mobile DE oder EN?" war offen; aufgeloest: gemaess **Mobile Locale Initialization** beim ersten Start aus unterstuetzter Geraetesprache mit `de` als Fallback, danach durch die persistierte bewusste Auswahl.
- "Braucht Mobile eine eigene i18n-Library oder locale-abhaengige Routen?" war offen; aufgeloest: nein, das **Mobile UI Dictionary** folgt dem typisierten Web-Muster und die **Mobile Locale** bleibt zentraler Client-Zustand.
- "Was passiert beim mobilen Sprachwechsel?" war offen; aufgeloest: Der **Mobile Language Switch** aktualisiert den aktuellen Screen ohne Navigation-Reset.
- "Development Build oder EAS Build fuer TestFlight?" war als falsches Entweder-oder offen; aufgeloest durch die **Mobile Build Profile Boundary**: Development Build fuer Entwicklung und Geraeteabnahme, separater EAS Production Build fuer TestFlight.
- "Braucht Mobile V1 Preview-Builds, EAS Update oder automatische Submission?" war offen; aufgeloest: nein, der **RoomFull TestFlight Build** wird nach manueller Freigabe erzeugt und uebermittelt.
- "Braucht ein Team Member einen RoomFull-Account?" war offen; aufgelöst: nein, **Team Members** sind vom Customer gepflegte Kontakte und keine **Users**.
- "Werden registrierte Users mit Team Members verknuepft?" war offen; aufgelöst: nein, **Teams** bleiben private Kontaktgruppen ohne Account-Abgleich, Zustimmung oder In-App-Benachrichtigungen.
- "Ist ein Team Member ein zentraler Kontakt fuer mehrere Teams?" war offen; aufgelöst: nein, jeder **Team Member** gehoert genau einem **Team**; dieselbe Person kann dort mehrfach unabhaengig gepflegt werden.
- "Darf ein Team ohne Members existieren?" war offen; aufgelöst: ja, ein leeres **Team** ist gueltig, aber nicht fuer einen **Team Booking Share** nutzbar.
- "Darf dieselbe E-Mail-Adresse mehrfach in einem Team vorkommen?" war offen; aufgelöst: nein, normalisierte E-Mail-Adressen sind pro **Team** eindeutig, nicht jedoch ueber mehrere Teams hinweg.
- "Darf ein Customer gleich benannte Teams besitzen?" war offen; aufgelöst: nein, normalisierte Teamnamen sind pro **Customer** eindeutig.
- "Bleibt die Schreibweise eines Teamnamens sichtbar erhalten?" war offen; aufgelöst: ja, Normalisierung dient nur Vergleich und Eindeutigkeit, nicht der sichtbaren Darstellung.
- "Wird ein Team archiviert oder endgueltig geloescht?" war offen; aufgelöst: **Team Deletion** ist nach Bestaetigung ein Hard Delete inklusive aller Team Members.
- "Was geschieht mit Teams bei spaeterer Account-Loeschung?" war offen; aufgelöst: Alle Teams und Team Members des Customers werden per Cascade endgueltig geloescht.
- "Sind Anzahl von Teams und Team Members unbegrenzt?" war offen; aufgelöst: nein, **Team Collection Limits** erlauben maximal 20 Teams pro Customer und 50 Team Members pro Team.
- "Welche Laengen duerfen Team- und Einladungseingaben haben?" war offen; aufgelöst: gemaess **Team Input Limits** 80 Zeichen fuer Teamnamen, 100 fuer Member-Namen, 254 fuer E-Mail-Adressen und 500 fuer persoenliche Nachrichten.
- "Wo verwaltet der Customer seine Teams?" war offen; aufgelöst: im eigenen geschuetzten Bereich **My Teams** unter `/me/teams`, verlinkt aus Profilmenue und Account Overview.
- "Verwaltet eine Seite alle Teams und Members gleichzeitig?" war offen; aufgelöst: nein, **My Teams** bleibt Uebersicht und jedes Team erhaelt eine eigene **Team Detail**.
- "Welche Pflege erlaubt Team Detail?" war offen; aufgelöst: vollstaendiges Umbenennen und bestaetigtes Loeschen des Teams sowie Hinzufuegen, Bearbeiten und Entfernen seiner Team Members.
- "Werden Team und Members gemeinsam angelegt?" war offen; aufgelöst: nein, der **Team Creation Flow** speichert zuerst nur das Team und ergaenzt Members anschliessend einzeln.
- "Wie werden Teams und Members sortiert?" war offen; aufgelöst: locale-aware alphabetisch gemaess **Team Display Order**, ohne manuelle Reihenfolge.
- "Duerfen Admins private Teams verwalten?" war offen; aufgelöst: nein, **Customer Team Permission** begrenzt Verwaltung und Einladungsnutzung auf Customers.
- "Wie adressiert die API Customer-eigene Teams?" war offen; aufgelöst: ueber die session-scoped **My Teams API** `/api/me/teams` ohne `userId` im Request.
- "Welche Operationen umfasst die My Teams API?" war offen; aufgelöst: vollstaendiges Team-CRUD und verschachteltes Team-Member-CRUD mit `PUT` fuer Updates, ohne ICS-Generate-Endpoint.
- "Enthaelt die Teamliste bereits alle Members?" war offen; aufgelöst: nein, der **Team Summary Contract** liefert nur ID, Name und Member-Anzahl; Members kommen aus dem Team-Detail.
- "Welche HTTP-Fehler bildet die My Teams API ab?" war offen; aufgelöst: gemaess **My Teams API Errors** mit `404` auch fuer fremde Ressourcen und `409` fuer Duplikate sowie Mengenlimits.
- "Wie wird der Customer ueber fremde Kontaktdaten und sichtbare Teilnehmende informiert?" war offen; aufgelöst: durch dauerhafte und kontextuelle **Team Contact Transparency** ohne wiederholte Pflicht-Checkbox.
- "Duerfen reale Teamkontakte in der Portfolio-Production gespeichert werden?" war offen; aufgelöst: nein, die **Team Demo Data Boundary** erlaubt dort nur fiktive Kontakte, verlangt einen sichtbaren Demo-Datenhinweis und beschraenkt echte Einladungstests auf lokale kontrollierte Adressen.
- "Hot Desk" wurde semantisch als Bereich interpretiert; aufgelöst: In RoomFull V1 bedeutet es ein einzelner buchbarer Platz.
- "Buchungen verwalten" bei Admin war unscharf; aufgelöst: In V1 darf Admin auch Buchungen erstellen (operativer HelpDesk-Fall).
- "Braucht Admin einen eigenen Einstieg zum Buchungsflow-Pruefen?" war offen; aufgelöst: nein, Admin nutzt den normalen Customer-Flow ueber `/booking-options`.
- "Admin darf stornieren" war unscharf; aufgelöst: Admins duerfen keine fremden Bookings stornieren.
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
- "Welche Zeitzone bestimmt `startTime` und `endTime`?" war offen; aufgelöst: **Booking Time Input** nutzt lokale Coworking-Zeit in `Europe/Berlin`, nicht die Browser-Zeitzone.
- "Welche Zeitzone nutzt die sichtbare Booking-Darstellung?" war offen; aufgelöst: **Booking Time Display** nutzt in Account-, Customer- und Admin-Ansichten verbindlich `Europe/Berlin`.
- "Public Unit Availability oder auth-required Booking Availability?" war offen; aufgelöst: Der **Booking Availability Contract** ist die einzige zeitbezogene Availability-Seam.
- "Wann ist ein direkter Unit-Tag voll belegt?" war offen; aufgelöst: wenn aktive Bookings keine Duration-Policy-gültige Zeitspanne mehr frei lassen; die Today Booking Start Rule verändert diesen Belegungszustand nicht.
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
- "Sollen geplante Account-Aktionen als Platzhalter sichtbar sein?" war offen; aufgelöst: nein, Profilbearbeitung und Passwortaenderung werden erst mit ihren eigenen Feature-Slices sichtbar.
- "Was ist der Hauptjob der Admin-Buchungsuebersicht?" war offen; aufgelöst: **Admin Booking Operations View** fuer Tagesbetrieb und anstehende Bookings, kein Analytics-Dashboard als Default.
- "Welche Filter braucht Admin Bookings in V1?" war offen; aufgelöst: **Admin Booking Filter** mit Heute, Anstehend, Abgeschlossen, Storniert und Alle; Default ist Anstehend.
- "Wie sortiert Admin Bookings?" war offen; aufgelöst: **Admin Booking Sort Order** sortiert Anstehend/Heute nach Startzeit aufsteigend, Abgeschlossen nach Endzeit absteigend und Storniert nach Aktualisierung absteigend.
- "Braucht Admin Bookings Graphs?" war offen; aufgelöst: Die Operations View nutzt **Admin Booking Summary**, das umgesetzte **Admin Analytics Dashboard** buendelt Graphen separat auf `/admin`.
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
- "Braucht der erste i18n-Slice stabile Backend-Application-Error-Codes?" war offen; aufgelöst: nein, stabile Backend-Error-Codes sind als eigener Contract-Slice in der `ROADMAP.md` vorgemerkt; aktuell nutzt die UI HTTP-Status, Flow-Kontext und Fallback-Copy.
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
- "Welche CTAs zeigt die Home Page?" war offen; zunaechst faelschlich mit drei anonymen Aktionen dokumentiert, anhand des aktuellen Codes korrigiert: immer `Jetzt Platz finden`, dazu anonym `Einloggen` oder angemeldet `Meine Buchungen`.
- "Duerfen Home-Angebote direkt buchen?" war offen; aufgelöst: nein, Home-Angebots-Teaser verlinken auf `/booking-options/[slug]`; erst dort beginnt die konkrete Area- oder Unit-Auswahl.
- "Wie heissen Angebote auf der Home Page?" war offen; aufgelöst: UI nennt sie "Arbeitsbereiche", fachlich bleiben es **BookingOptions**.
- "Sind Home-Arbeitsbereiche statisch oder API-basiert?" war offen; aufgelöst: Home nutzt **BookingOptions** als Datenbasis und kuratiert deren Praesentation.
- "Wo werden Varianten ausgewaehlt?" war offen; aufgelöst: Home teasert Varianten nur an, konkrete Variantenwahl passiert auf `/booking-options/[slug]`.
- "Braucht Home eigene UnitType-SVG-Icons?" war zunaechst faelschlich mit ja dokumentiert; anhand von aktuellem Code und Screenshot korrigiert: nein, das **Home UnitType Teaser Signal** besteht aus Farbe, vertikalem Label und Typografie.
- "Wer besitzt aktuellen Auth-Zustand im Frontend?" war offen; aufgelöst: **Frontend Session** besitzt User und Status zentral, waehrend das Backend das unlesbare HttpOnly-Cookie kontrolliert.
- "Ist der aktuelle Session-User dasselbe wie das User-Entity?" war offen; aufgelöst: nein, **Session User** ist bewusst entkoppelt.
- "Wer darf Auth Storage manipulieren?" war offen; anhand der realen Implementierung korrigiert: kein Frontend-Bereich manipuliert Auth Storage; Features starten oder beenden Sessions ueber die Session API und das Backend setzt beziehungsweise loescht das HttpOnly-Cookie.
- "Wer fuegt Authorization Header an Frontend-API-Requests?" war zunaechst faelschlich mit dem API-Client beantwortet; anhand des aktuellen Codes korrigiert: Web setzt keinen Authorization Header, sondern der zentrale API-Client sendet das HttpOnly-Cookie ueber `credentials: "include"`.
- "Nutzt RoomFull Mobile dieselbe Cookie-Session wie die WebApp?" war offen; aufgelöst: nein, die **Mobile Session** wird eigenstaendig aufgebaut, repraesentiert aber denselben User und dieselben fachlichen Berechtigungen.
- "Nutzen mobile Auth-Screens die globale App-Huelle?" war offen; aufgelöst: nein, Login und Registrierung nutzen die reduzierte **Mobile Auth Shell** ohne globales Menue und Footer.
- "Wie wechseln Mobile Users zwischen Login und Registrierung?" war offen; aufgelöst: ueber den kompakten **Mobile Auth Switch** unter der primaeren Formularaktion, bei erhaltenem Weiterleitungsziel.
- "Spricht jeder mobile Auth-Einstieg von einer fortzusetzenden Buchung?" war offen; aufgelöst: nein, die **Mobile Auth Intro Copy** unterscheidet Booking-Flow-Einstieg und direkten Auth-Einstieg.
- "Bleibt der grosse schwarze Kopf auf mobilen Auth-Screens erhalten?" war offen; aufgelöst: ja, aber mit der verdichteten **Mobile Auth Header Density**.
- "Gehoert der Gastzugang in RoomFull Mobile V1?" war offen; aufgelöst: ja, als **Mobile Guest Login Entry** ausschliesslich auf dem Login-Screen.
- "Setzt der mobile Gastzugang einen begonnenen Booking Flow fort?" war offen; aufgelöst: ja, der **Mobile Guest Login Entry** uebernimmt dasselbe sichere Auth-Ziel wie Login und Registrierung.
- "Wie praesentiert Mobile den Gastzugang?" war offen; aufgelöst: als kompaktes, klar getrenntes **Mobile Guest Login Panel** direkt unter der regulaeren Login-Card.
- "Welches iOS-Tastaturverhalten gilt fuer mobile Auth-Formulare?" war offen; aufgelöst: Die **Mobile Auth Keyboard Baseline** definiert Erreichbarkeit, Feldfolge und Submit; Geraete-Finetuning bleibt Teil der spaeteren Feature-Abnahme.
- "Wie zeigt Mobile Auth-Fehler?" war offen; aufgelöst: ueber **Mobile Auth Error Feedback** mit feldnahen Eingabefehlern, uebergreifenden Servermeldungen und erhaltenen unkritischen Eingaben.
- "Braucht RoomFull Mobile V1 einen Passwort-Reset?" war offen; aufgelöst: nein, der **Mobile Password Reset Scope** folgt dem vorhandenen Funktionsumfang der WebApp.
- "Bedeutet Mobile-Paritaet den gesamten Funktionsumfang der WebApp?" war offen; aufgelöst: nein, **Mobile Customer Feature Parity** gilt innerhalb des vereinbarten Customer-Self-Service-Scope; Admin und explizit vertagte Bereiche bleiben ausserhalb von V1.
- "Gehoeren My Teams und Team Booking Share in Mobile V1?" war offen; aufgelöst: ja, gemeinsam als **Mobile Teams V1 Scope**, umgesetzt nach Auth, Booking und My Bookings.
- "Bleibt Team Booking Share mobil ein einziger Langscreen?" war offen; aufgelöst: nein, **Mobile Team Booking Share Flow** trennt Empfaengervorbereitung und Uebergabe ohne Persistenz.
- "Wie praesent bleibt die Booking im mobilen Team Share?" war offen; aufgelöst: als kompakte aufklappbare **Mobile Team Share Booking Summary** in beiden Schritten.
- "Wo erklaert Mobile die Share-Systemgrenze?" war offen; aufgelöst: als **Mobile Team Share Handoff Notice** in Schritt 2 unmittelbar vor den Uebergabeaktionen.
- "Wie waehlt Mobile das Team im Share?" war offen; aufgelöst: ueber **Mobile Team Share Team Selection** als alphabetisches Sheet unter Beibehaltung der bewussten Auswahlgrenze.
- "Wie bearbeitet Mobile bis zu 50 Share-Empfaenger?" war offen; aufgelöst: ueber **Mobile Team Share Recipient Selection** als vollflaechigen fluechtigen Unterzustand von Schritt 1.
- "Wie verhaelt sich die persoenliche Nachricht im mobilen Share?" war offen; aufgelöst: gemaess **Mobile Team Share Personal Message** kompakt wachsend und nur im laufenden Flow erhalten.
- "Wo zeigt Mobile eine ueberschrittene Booking-Kapazitaet im Team Share?" war offen; aufgelöst: gemaess **Mobile Team Share Capacity Warning Placement** in Zusammenfassung und Auswahl, weiterhin nicht blockierend.
- "Wie praesentiert Mobile das vierteilige Share Package?" war offen; aufgelöst: als **Mobile Team Share Package Actions** mit vier getrennten Aktionszeilen und lokalem Feedback.
- "Bleibt der mobile Share bei Wechsel in eine Versand-App erhalten?" war offen; aufgelöst: **Mobile Team Share Resume** behaelt ihn bei normalem Backgrounding, aber nicht garantiert nach Prozessende.
- "Wie endet der mobile Team Share ohne bekannten Versandstatus?" war offen; aufgelöst: **Mobile Team Share Completion** nutzt neutrales `Fertig` zu My Bookings und verwirft nur den fluechtigen Zustand.
- "Was passiert nach einem My-Teams-Ausflug aus dem mobilen Share-Empty-State?" war offen; aufgelöst: **Mobile Team Share Empty-State Return** behaelt den Stack-Zustand und aktualisiert bei manueller Rueckkehr ohne Vorauswahl.
- "Steht das Create-Team-Formular dauerhaft vor der mobilen Teamliste?" war offen; aufgelöst: nein, **Mobile My Teams Overview** ist list-first und oeffnet die Erstellung als fokussiertes Sheet.
- "Wie erklaert Mobile das fachliche Team-Modell?" war offen; aufgelöst: **Mobile My Teams Overview** verdichtet die drei notwendigen Abgrenzungen in einen kompakten Info-Callout statt einer zweiten grossen Intro-Card.
- "Wie oeffnet Mobile ein Team aus der Uebersicht?" war offen; aufgelöst: ueber die vollflaechige **Mobile Team Card** mit Name, Member-Anzahl und Chevron.
- "Wohin navigiert Mobile nach erfolgreicher Team-Erstellung?" war offen; aufgelöst: gemaess **Mobile Team Creation Continuation** direkt ins neue Team Detail, mit My Teams als Zurueck-Ziel.
- "Was ist der Hauptinhalt des mobilen Team Details?" war offen; aufgelöst: gemaess **Mobile Team Detail Hierarchy** die Member-Verwaltung; seltene Team-Einstellungen bleiben sekundaer erreichbar.
- "Wo werden Teamname und Team-Loeschung mobil verwaltet?" war offen; aufgelöst: im beschriftet erreichbaren **Mobile Team Management Sheet**.
- "Wie bestaetigt Mobile die endgueltige Team-Loeschung?" war offen; aufgelöst: ueber **Mobile Team Deletion Confirmation** mit Teamname, Member-Anzahl und exakter Namenseingabe.
- "Wo legt Mobile einen Team Member an?" war offen; aufgelöst: im **Mobile Add Team Member Sheet** fuer genau einen Kontakt mit Name und E-Mail.
- "Was passiert nach erfolgreichem Hinzufuegen eines Team Members?" war offen; aufgelöst: **Mobile Add Team Member Continuation** bietet weiteren Kontakt oder bewussten Abschluss zur aktualisierten Liste.
- "Wie bearbeitet oder entfernt Mobile einen Team Member?" war offen; aufgelöst: ueber **Mobile Team Member Management** mit vollflaechiger Member-Card und fokussiertem Verwaltungs-Sheet.
- "Wie bestaetigt Mobile das Entfernen eines einzelnen Team Members?" war offen; aufgelöst: ueber **Mobile Team Member Removal Confirmation** mit Name, E-Mail und destruktivem Bestaetigungsbutton ohne Texteingabe.
- "Wo zeigt Mobile den Team-Demo-Datenhinweis?" war offen; aufgelöst: gemaess **Mobile Team Demo Notice Placement** vollstaendig in My Teams und kurz direkt in Add-/Edit-Member-Sheets.
- "Uebernimmt Mobile den Portfolio-Demo-Hinweis der Web-Registrierung?" war offen; aufgelöst: ja, als kompakter **Mobile Registration Demo Notice** mit vollstaendiger Daten-, Passwort- und Loeschwarnung.
- "Muss Mobile Home bereits im ersten Viewport einen Arbeitsbereich zeigen?" war offen; aufgelöst: nein, **Mobile Home Hero Density** priorisiert Hero und primaeren Booking-CTA; UnitType-Teaser duerfen darunter beginnen.
- "Wie ordnet Mobile die beiden Home-Hero-Aktionen an?" war offen; aufgelöst: als responsives **Mobile Home CTA Pair**, nebeneinander bei genug Platz und sonst gestapelt.
- "Was ist auf Mobile Home bei einem UnitType-Teaser tappbar?" war offen; aufgelöst: die gesamte **Mobile Home UnitType Teaser Action**; das Aktionslabel ist kein separater Button.
- "Welche Fakten zeigt ein UnitType-Teaser auf Mobile Home?" war offen; aufgelöst: **Mobile Home UnitType Teaser Meta** umfasst Verfuegbarkeit, Mindestdauer und Kapazitaet.
- "Fuehrt Mobile zusaetzliche UnitType-Icons auf Home ein?" war offen; aufgelöst: nein, Web und Mobile nutzen dasselbe **Home UnitType Teaser Signal** ohne zusaetzliche Icons.
- "Zeigt Mobile Home alle vier UnitTypes direkt?" war offen; aufgelöst: ja, als vertikales **Mobile Home UnitType Teaser Set** ohne Carousel oder Filter.
- "Braucht RoomFull Mobile einen globalen Footer?" war offen; aufgelöst: nein, die **Mobile Info & Recht Navigation** verlagert FAQ und Datenschutz beziehungsweise Privacy & Imprint dauerhaft ins App-Menue.
- "Welche Form hat das mobile Hauptmenue?" war offen; nach Pruefung des aktuellen Web-Dropdowns aufgelöst: als **Mobile Main Menu Modal** mit gesperrtem Hintergrund, eigenem Scrollbereich und explizitem Schliessen.
- "Wie hoch und markant bleibt der wiederkehrende Mobile-Header?" war offen; aufgelöst: gemaess **Mobile App Header Density** als kompakte Safe-Area-Markenzeile mit Logo, Aktion und Farbkante.
- "Blendet sich der mobile App-Header beim Scrollen aus?" war offen; aufgelöst: nein, **Mobile App Header Scroll Behavior** haelt ihn stabil sichtbar.
- "Wie gruppiert Mobile das Customer-Hauptmenue?" war offen; aufgelöst: gemaess **Mobile Customer Menu Hierarchy** in Booking, Konto, Sprache/Info & Recht und getrenntes Abmelden.
- "Wie unterscheidet sich das anonyme mobile Hauptmenue?" war offen; aufgelöst: gemaess **Mobile Anonymous Menu Hierarchy** mit Produktziel, eigener Auth-Gruppe und ruhigem Sprache-/Rechtsbereich.
- "Aktuelle Buchungen" war unscharf; aufgelöst: **Upcoming Booking** meint eigene aktive Bookings mit `endTime >= now`, inklusive gerade laufender Bookings.
- "Stornierte Buchungen in der eigenen Liste" war offen; aufgelöst: stornierte Bookings erscheinen in **Closed Booking**, nicht in **Upcoming Booking**.
- "Booking Context zuerst oder Frontend-Zwischenlösung?" war offen; aufgelöst: eigener Backend-Endpoint zuerst.
- "Auto-Assign für alle UnitTypes?" war offen; aufgelöst: dauerhaft nur für `HOT_DESK`.
- "Buchungsdauer global für alle Typen" war zu grob; aufgelöst: Dauergrenzen kommen je **UnitType**.
- "Öffnungszeiten je Typ/Area" war offen; aufgelöst: in V1 bleiben Öffnungszeiten global (Mo-Fr 08:00-22:00).
- "Area-Pflicht für alle buchbaren Einheiten" war offen; aufgelöst: `areaId` bleibt optional.
- "API-Namen in Legacy-Sprache" war offen; aufgelöst: API nutzt `/units` und `unitId` bei internem Begriff **BookableUnit**.
- "Legacy-Routen weiterführen?" war offen; aufgelöst: `/spaces` wird entfernt, nur `/units` bleibt.
