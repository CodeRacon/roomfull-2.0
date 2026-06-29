export const de = {
	metadata: {
		title: "RoomFull 2.0",
		description: "Coworking-Flächen einfach buchen.",
	},
	navigation: {
		homeAriaLabel: "Zur Startseite",
		bookingOptions: "Platz finden",
		myBookings: "Meine Buchungen",
		teams: "Meine Teams",
		admin: "Admin",
		adminDashboard: "Admin Dashboard",
		profile: "Profil",
		account: "Mein Account",
		contact: "Kontakt",
		signIn: "Einloggen",
		signUp: "Registrieren",
		signOut: "Abmelden",
		mainMenuOpen: "Hauptmenü öffnen",
		mainMenu: "Menü",
		legalAndHelp: "Rechtliches und Hilfe",
		faq: "FAQ",
		privacy: "Datenschutz",
	},
	languageSwitcher: {
		label: "Sprache",
		de: "Deutsch",
		en: "English",
	},
	errorPages: {
		notFound: {
			statusCode: "404",
			title: "Diese Seite gibt es nicht.",
			description:
				"Der Link ist möglicherweise veraltet oder die Adresse wurde falsch eingegeben.",
			actionLabel: "Zur Startseite",
		},
		internal: {
			statusCode: "500",
			title: "Etwas ist schiefgelaufen.",
			description:
				"Bitte versuche es erneut. Wenn der Fehler bleibt, starten wir den nächsten Versuch von der Startseite.",
			actionLabel: "Zur Startseite",
			resetLabel: "Erneut versuchen",
		},
	},
	faqPage: {
		metadata: {
			title: "FAQ | RoomFull 2.0",
			description:
				"Antworten zur Wahl, Ausstattung und Buchung von Coworking-Plätzen und Räumen.",
		},
		title: "FAQs",
		subtitle: "Häufige Fragen",
		intro:
			"Finde den Platz oder Raum, der zu deinem Vorhaben passt, und erfahre alles Wichtige zu Ausstattung, Buchungszeiten und Nutzung.",
		sections: {
			matchingSpace: {
				question: "Welcher Platz oder Raum passt zu mir?",
				intro: "Das hängt davon ab, wie du arbeiten möchtest:",
				hotDesk:
					"Ein Hot Desk ist ideal für konzentriertes Arbeiten allein – spontan, flexibel und wahlweise im offenen Bereich oder im ruhigen „Quiet Place“.",
				booth:
					"Eine Booth bietet dir mehr Rückzug für Fokusphasen, Calls und vertrauliche Gespräche.",
				teamRoom:
					"Ein Team Room eignet sich für gemeinsames Arbeiten, Brainstormings und kreative Sessions.",
				meetingRoom:
					"Ein Meeting Room bietet den passenden Rahmen für Präsentationen, Entscheidungen und größere Gesprächsrunden.",
			},
			areas: {
				question: "Was unterscheidet „Open World“ und „Quiet Place“?",
				openWorld:
					"In der Open World sitzt du in einer lebendigeren, kommunikativen Arbeitsumgebung. Sie passt gut, wenn du den Austausch mit anderen magst und dich normale Arbeitsgeräusche nicht stören.",
				quietPlace:
					"Der Quiet Place ist für ruhiges, konzentriertes Arbeiten gedacht. Gespräche und längere Calls sollten dort vermieden werden.",
			},
			basicEquipment: {
				question: "Welche Grundausstattung ist enthalten?",
				answer:
					"Alle Arbeitsplätze und Räume verfügen über schnelles WLAN, gut erreichbare Stromanschlüsse und ergonomische Sitzmöglichkeiten.",
				trafficLight:
					"Zusätzlich befindet sich an jedem Platz und in jedem Raum eine dezente Buchungsampel, die dich rechtzeitig an das Ende deiner Buchung erinnert.",
			},
			equipment: {
				question: "Wie sind die einzelnen Plätze und Räume ausgestattet?",
				hotDesk:
					"Hot Desks verfügen über einen Monitor und eine Dockingstation.",
				booth:
					"Booths sind schallgedämpft und mit Monitor, Tisch, Stromanschlüssen und angenehmer Beleuchtung ausgestattet.",
				teamRoom:
					"Team Rooms bieten einen großen Bildschirm, ein Whiteboard und Moderationsmaterial für gemeinsame Sessions.",
				meetingRoom:
					"Meeting Rooms verfügen über Beamer, Whiteboard-Wall und ein Videokonferenzsystem.",
			},
			booking: {
				question: "Wie funktioniert die Buchung?",
				intro:
					"Überlege zuerst, was du für deinen Arbeitstag brauchst. Anschließend bestimmst du Datum und Uhrzeit.",
				selection:
					"Bei Hot Desks entscheidest du dich für einen Bereich; RoomFull weist dir dort automatisch einen verfügbaren Platz zu. Bei Booths, Team Rooms und Meeting Rooms wählst du den gewünschten Raum selbst aus.",
				account:
					"Für eine verbindliche Buchung benötigst du ein Benutzer-Konto. So findest du deine Reservierung später auch unter „Meine Buchungen“ wieder.",
			},
			duration: {
				question: "Wie lange kann ich buchen?",
				intro:
					"Die Mindest- und Maximaldauer hängt vom gewählten Platz oder Raum ab:",
				hotDesk: "Hot Desk: 30 Minuten bis 4 Stunden",
				booth: "Booth: 1 bis 4 Stunden",
				teamRoom: "Team Room: 1 bis 8 Stunden",
				meetingRoom: "Meeting Room: 1 bis 8 Stunden",
			},
			openingHours: {
				question: "Zu welchen Zeiten kann ich buchen?",
				answer:
					"Buchungen sind montags bis freitags zwischen 08:00 und 22:00 Uhr möglich. Vergangene Zeiträume und bereits gebuchte Plätze oder Räume stehen nicht zur Auswahl.",
			},
			cancellation: {
				question: "Kann ich meine Buchung stornieren?",
				answer:
					"Ja. Deine zukünftigen Buchungen findest du unter „Meine Buchungen“. Dort kannst du eine Buchung stornieren, wenn sich deine Pläne ändern.",
			},
			overtime: {
				question:
					"Was passiert, wenn ich meinen Platz oder Raum versehentlich länger nutze?",
				intro:
					"Keine Sorge – das kann passieren. Damit du das Buchungsende rechtzeitig im Blick hast, befindet sich an jedem Platz und in jedem Raum eine dezente Statusampel:",
				green:
					"Grün: Deine Buchung läuft. 15 Minuten vor dem Ende beginnt die Anzeige dezent zu pulsieren.",
				yellow: "Gelb: Noch 5 Minuten – Zeit, langsam zusammenzupacken.",
				red: "Rot: Deine Buchungszeit ist beendet.",
				outro:
					"Sobald die Ampel rot leuchtet, gib deinen Platz oder Raum bitte zügig frei. Möglicherweise wartet bereits die nächste Person auf ihre Buchung.",
			},
		},
	},
	home: {
		metadata: {
			title: "Coworking Spaces buchen | RoomFull 2.0",
			description:
				"Finde den passenden Coworking-Platz für Fokus, Gespräche oder Teamarbeit und starte direkt in die Buchung.",
		},
		hero: {
			titleLines: ["Raum", "für gute", "Arbeit."],
			intro:
				"Ob Deep Work, Team-Session oder wichtiges Meeting: Bei RoomFull findest du den Platz, der zu deinem Tag passt.",
		},
		ctas: {
			bookingOptions: "Jetzt Platz finden",
			myBookings: "Meine Buchungen",
			login: "Einloggen",
		},
		bookingOptionsAriaLabel: "Buchungsarten",
		stripes: {
			HOT_DESK: {
				label: "Work",
				titleLines: ["Hot", "Desk"],
			},
			BOOTH: {
				label: "Focus",
				titleLines: ["Booth"],
			},
			TEAM_ROOM: {
				label: "Team",
				titleLines: ["Team", "Room"],
			},
			MEETING_ROOM: {
				label: "Meet",
				titleLines: ["Meeting", "Room"],
			},
		},
		availability: {
			singleSeat: "Einzelplatz",
			upToPeople: "bis zu {count} Personen",
			seatsAvailable: "{count} Plätze verfügbar",
			oneRoomAvailable: "1 Raum verfügbar",
			roomsAvailable: "{count} Räume verfügbar",
		},
		duration: {
			minimum: "ab {count} Minuten",
		},
		actions: {
			select: "Auswählen",
			selectNow: "Jetzt auswählen",
			selectAriaLabel: "{title} auswählen",
		},
	},
	bookingOptionsPage: {
		metadata: {
			title: "Coworking-Platz oder Raum finden | RoomFull 2.0",
			description:
				"Finde den passenden Hot Desk, eine Booth oder einen Raum für deinen Arbeitstag.",
		},
		title: "Was brauchst du für deinen Tag?",
		intro:
			"Ob du konzentriert arbeiten, dich für einen Call zurückziehen oder mit deinem Team zusammenkommen möchtest: Hier findest du den passenden Platz für deine Pläne.",
		listAriaLabel: "Buchungsarten vergleichen",
		emptyState: "Gerade sind keine buchbaren Plätze oder Räume verfügbar.",
		options: {
			HOT_DESK: {
				label: "Work",
				title: "Hot Desk",
				description:
					"Flexibler Einzelplatz, wahlweise im offenen Bereich oder in unserer Pssst!-Zone. Ideal, wenn du spontan einen produktiven Platz zum Arbeiten brauchst.",
				descriptionEmphasis: null,
				cta: "Platz wählen",
			},
			BOOTH: {
				label: "Focus",
				title: "Booth",
				description:
					"Kleine Rückzugsorte für Fokus, Calls und Deep Work – perfekt, wenn du kurz abschalten, konzentriert arbeiten oder in Ruhe sprechen willst.",
				descriptionEmphasis: null,
				cta: "Booths ansehen",
			},
			TEAM_ROOM: {
				label: "Team",
				title: "Team Room",
				description:
					"Raum für gemeinsames Arbeiten, kreative Sessions und die Umsetzung eurer Ideen – voll ausgestattet für produktive Team-Momente.",
				descriptionEmphasis: null,
				cta: "Teamräume ansehen",
			},
			MEETING_ROOM: {
				label: "Meet",
				title: "Meeting Room",
				description:
					"Mehr Raum für interaktiven Austausch, Entscheidungen und Präsentationen – einladend, großzügig und gemacht für die guten Meetings.",
				descriptionEmphasis: "guten",
				cta: "Meetingräume ansehen",
			},
		},
		availability: {
			seats: "{count} Plätze",
			oneRoom: "1 Raum",
			rooms: "{count} Räume",
		},
		capacity: {
			singleSeat: "Einzelplatz",
			upToPeople: "bis {count} Personen",
		},
		duration: {
			minimumShort: "ab {count} Min.",
		},
	},
	bookingOptionDetailPage: {
		metadata: {
			titleTemplate: "{title} buchen | RoomFull 2.0",
			descriptionTemplate:
				"Entdecke verfügbare Bereiche oder Räume für {title} und starte deine Buchung.",
		},
		backToOptions: "Zurück zur Übersicht",
		stats: {
			selection: "Buchung",
			duration: "Dauer",
			available: "Verfügbar",
		},
		selection: {
			areaDescriptionFallback: "Ein Bereich mit buchbaren Einzelplätzen.",
			emptyState:
				"Für diese Auswahl gibt es aktuell keine buchbaren Plätze oder Räume.",
		},
		options: {
			HOT_DESK: {
				sideLabel: "Work",
				title: "Hot Desk",
				description:
					"Flexibler Einzelplatz, wahlweise im offenen Bereich oder in unserer Pssst!-Zone. Ideal, wenn du spontan einen produktiven Platz zum Arbeiten brauchst.",
				descriptionEmphasis: null,
				selectionLabel: "Bereich wählen",
				selectionEyebrow: "Deine Umgebung",
				selectionHeading: "Wo möchtest du arbeiten?",
				cta: "Hot Desk buchen",
			},
			BOOTH: {
				sideLabel: "Focus",
				title: "Booth",
				description:
					"Kleine Rückzugsorte für Fokus, Calls und Deep Work – perfekt, wenn du kurz abschalten, konzentriert arbeiten oder in Ruhe sprechen willst.",
				descriptionEmphasis: null,
				selectionLabel: "Raum selbst wählen",
				selectionEyebrow: "Unsere Booths",
				selectionHeading: "Welche Booth passt zu dir?",
				cta: "Booth buchen",
			},
			TEAM_ROOM: {
				sideLabel: "Team",
				title: "Team Room",
				description:
					"Raum für gemeinsames Arbeiten, kreative Sessions und die Umsetzung eurer Ideen – voll ausgestattet für produktive Team-Momente.",
				descriptionEmphasis: null,
				selectionLabel: "Raum selbst wählen",
				selectionEyebrow: "Unsere Räume",
				selectionHeading: "Welcher Raum passt zu euch?",
				cta: "Team Room buchen",
			},
			MEETING_ROOM: {
				sideLabel: "Meet",
				title: "Meeting Room",
				description:
					"Mehr Raum für interaktiven Austausch, Entscheidungen und Präsentationen – einladend, großzügig und gemacht für die guten Meetings.",
				descriptionEmphasis: "guten",
				selectionLabel: "Raum selbst wählen",
				selectionEyebrow: "Unsere Räume",
				selectionHeading: "Welcher Raum passt zu euch?",
				cta: "Meeting Room buchen",
			},
		},
		availability: {
			seat: {
				one: "1 Platz",
				many: "{count} Plätze",
			},
			area: {
				one: "1 Bereich",
				many: "{count} Bereiche",
			},
			room: {
				one: "1 Raum",
				many: "{count} Räume",
			},
		},
		capacity: {
			desk: {
				one: "1 Einzelplatz",
				many: "{count} Einzelplätze",
			},
			onePerson: "1 Person",
			people: "{count} Personen",
		},
		duration: {
			range: "{min}-{max} Min.",
			fallback: "Zeitraum in der Buchung",
		},
	},
	createBooking: {
		page: {
			title: "Deine Buchung",
			intro: "Wähle Datum und Uhrzeit – den Rest erledigen wir gemeinsam.",
			loadingContext: "Deine Auswahl wird geladen...",
		},
		gate: {
			invalidContext: "Diese Auswahl ist ungültig.",
			loadingContext: "Deine Auswahl wird geladen...",
			preparingContext: "Deine Auswahl wird vorbereitet...",
			contextUnavailable: "Dieses Angebot ist nicht mehr buchbar.",
			contextError: "Deine Auswahl konnte nicht geladen werden.",
			unknownError: "Ein unbekannter Fehler ist aufgetreten.",
		},
		context: {
			eyebrow: "Deine Auswahl",
			selection: "Auswahl",
			capacity: "Kapazität",
			duration: "Dauer",
			directMode: "Raum selbst gewählt",
			autoAssignMode: "Platz wird für dich ausgewählt",
			fallbackAreaDescription: "Hot-Desk-Area mit buchbaren Einzelplätzen.",
			sideLabels: {
				HOT_DESK: "Areas",
				BOOTH: "Fokus",
				TEAM_ROOM: "Team",
				MEETING_ROOM: "Meet",
			},
			capacityLabels: {
				onePerson: "1 Person",
				people: "{count} Personen",
				oneDesk: "1 Einzelplatz",
				desks: "{count} Einzelplätze",
			},
			durationRange: "min. {min} - max. {max}",
		},
		calendar: {
			sectionEyebrow: "Datum",
			title: "Wann möchtest du kommen?",
			intro: "Wähle einen freien Tag.",
			loadingLabel: "Belegung wird geladen...",
			previousMonth: "Zurück",
			nextMonth: "Weiter",
			previousMonthAriaLabel: "Vorherigen Monat anzeigen",
			nextMonthAriaLabel: "Nächsten Monat anzeigen",
			weekdayLabels: ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"],
			locale: "de-DE",
			todayLabel: "heute",
			states: {
				partiallyBooked: "teils belegt",
				fullyBooked: "belegt",
			},
		},
		timePicker: {
			sectionEyebrow: "Zeit",
			loadingAvailability: "Verfügbarkeit wird geladen...",
			openingHours: "Öffnungszeiten: {start}-{end} Uhr",
			blockedIntervals: "Bereits belegt",
			blockedInterval: "{start}-{end} Uhr",
			noSlots: "Für diesen Tag sind keine passenden Zeiträume verfügbar.",
			startTime: "Startzeit",
			endTime: "Endzeit",
			unavailableRange: "{start}-{end} Uhr nicht verfügbar",
			availableCount: "{count} frei",
		},
		summary: {
			date: "am {date}",
			timeRange: "{start}-{end} Uhr",
			dateLocale: "de-DE",
			duration: {
				minutes: "{count}min",
				hours: "{count}h",
				hoursAndMinutes: "{hours}h {minutes}min",
			},
		},
		submit: {
			label: "Jetzt buchen",
			pending: "Buchung wird erstellt...",
		},
		errors: {
			calendarStatesFallback: "Kalenderbelegung konnte nicht geladen werden.",
			availabilityFallback: "Verfügbarkeit konnte nicht geladen werden.",
			incompleteSelection: "Bitte wähle Datum, Start und Ende aus.",
			badRequest: "Bitte prüfe Datum und Uhrzeit.",
			notFound: "Dieses Angebot ist nicht mehr buchbar.",
			conflict: "Der Zeitraum ist inzwischen belegt.",
			createFallback: "Buchung konnte nicht erstellt werden.",
		},
	},
	myBookings: {
		page: {
			title: "Meine Buchungen",
			intro:
				"Ob anstehend, vergangen oder storniert: Hier findest du alle deine Buchungen auf einen Blick.",
			preparing: "Deine Buchungen werden vorbereitet...",
		},
		client: {
			loading: "Deine Buchungen werden geladen...",
			loadError: "Deine Buchungen konnten nicht geladen werden.",
			createdSuccess: "Buchung wurde erstellt.",
			cancelledSuccess: "Buchung wurde storniert.",
		},
		views: {
			cards: "Karten",
			list: "Liste",
			calendar: "Kalender",
		},
		status: {
			active: "Aktiv",
			cancelled: "Storniert",
			past: "Vergangen",
		},
		dateTime: {
			locale: "de-DE",
			sameDay: "{date} von {start} bis {end} Uhr",
			crossDay: "{start} Uhr bis {end} Uhr",
			listSameDay: "{date}, {start}-{end} Uhr",
			listCrossDay: "{start} Uhr bis {end} Uhr",
		},
		actions: {
			shareTeam: "Mit Team teilen",
			shareTeamShort: "Team teilen",
			downloadIcs: "Download .ics",
			downloadIcsShort: ".ics",
			downloadIcsAriaLabel: "Buchung als ICS herunterladen",
			cancelBooking: "Buchung stornieren",
			cancelShort: "Stornieren",
			cancelConfirm: "Stornieren",
			cancelAbort: "Abbrechen",
			cancelKeyword: "STORNO",
			cancelPrompt: 'Zum Stornieren bitte "{keyword}" eingeben.',
			cancelAriaLabel: "Buchung stornieren",
		},
		cancelErrors: {
			unauthorized: "Bitte melde dich erneut an.",
			forbidden: "Du darfst diese Buchung nicht stornieren.",
			notFound: "Diese Buchung wurde nicht gefunden.",
			conflict: "Diese Buchung kann nicht mehr storniert werden.",
			fallback: "Buchung konnte nicht storniert werden.",
		},
		calendar: {
			previousMonth: "Zurück",
			nextMonth: "Weiter",
			previousMonthAriaLabel: "Vorherigen Monat anzeigen",
			nextMonthAriaLabel: "Nächsten Monat anzeigen",
			weekdayLabels: ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"],
			monthLocale: "de-DE",
			bookingOne: "Buchung",
			bookingsMany: "Buchungen",
			showBookings: "{date}: {count} {bookingLabel} anzeigen",
		},
		sections: {
			noBookings: "Keine Buchung vorhanden.",
			upcomingTitle: "Anstehende Buchungen",
			upcomingEmpty: "Keine anstehenden Buchungen.",
			pastTitle: "Frühere Buchungen & Stornierungen",
			pastEmpty: "Keine früheren Buchungen oder Stornierungen.",
			bookingOne: "Buchung",
			bookingsMany: "Buchungen",
		},
	},
	bookingShare: {
		page: {
			title: "Buchung mit Team teilen",
			intro:
				"Wähle ein Team, passe bei Bedarf die Empfänger an und kopiere danach BCC, Betreff, Nachricht oder die Kalenderdatei.",
			back: "Zurück zu meinen Buchungen",
		},
		loading: {
			page: "Share-Daten werden geladen...",
			team: "Team-Kontakte werden geladen...",
		},
		errors: {
			notFound:
				"Diese Buchung gibt es nicht oder sie gehört nicht zu deinem Konto.",
			conflict: "Diese Buchung ist nicht mehr für einen Team Share geeignet.",
			teamLoad: "Die Kontakte dieses Teams konnten nicht geladen werden.",
			fallback: "Die Share-Seite konnte nicht geladen werden.",
		},
		summary: {
			eyebrow: "Buchungskontext",
			unitType: "Typ: {unitType}",
			capacity: "Kapazität: {capacity}",
			time: "Zeitraum: {time}",
		},
		notice: {
			title: "Datenschutz und Produktgrenze",
			description:
				"RoomFull versendet nichts selbst. Füge die kopierten Adressen in deinem Mail-Tool in BCC ein und hänge die Kalenderdatei manuell an.",
		},
		selection: {
			title: "Team und Empfänger wählen",
			description:
				"Leere Teams bleiben sichtbar, sind aber noch nicht für Shares nutzbar. Bei einem Teamwechsel bleibt deine persönliche Nachricht erhalten.",
			noTeams:
				"Du hast noch kein Team angelegt. Lege zuerst eine private Kontaktgruppe an.",
			openTeams: "Meine Teams öffnen",
			manageEmptyTeam: "Leeres Team verwalten",
			select: "Team wählen",
			selected: "Ausgewählt",
			emptyTeam: "0 Kontakte",
			memberOne: "1 Kontakt",
			membersMany: "{count} Kontakte",
			membersTitle: "Empfänger aus {teamName}",
			membersDescription:
				"Nach der Teamwahl sind alle Kontakte vorausgewählt. Du kannst sie für diesen Share abwählen.",
			messageLabel: "Persönliche Nachricht",
			messagePlaceholder:
				"Optional: ein kurzer persönlicher Hinweis für dein Team.",
			messageHint: "Noch {remaining} Zeichen verfügbar.",
			capacityWarning:
				"Warnung: {selected} ausgewählte Kontakte bei Kapazität {capacity}. Das blockiert den Share nicht.",
		},
		package: {
			title: "Share-Paket",
			description:
				"Kopiere die Bestandteile einzeln oder lade die Kalenderdatei herunter. Ohne ausgewählte Empfänger bleiben die Aktionen gesperrt.",
			copyBcc: "BCC-Adressen kopieren",
			copySubject: "Betreff kopieren",
			copyMessage: "Nachricht kopieren",
			downloadIcs: "Kalenderdatei herunterladen",
			bccHint:
				"Füge die Empfänger bitte in BCC statt in sichtbares An oder CC ein.",
			bccSuccess: "BCC-Adressen kopiert.",
			subjectSuccess: "Betreff kopiert.",
			messageSuccess: "Nachricht kopiert.",
			icsSuccess: "Kalenderdatei erstellt.",
			copyFallback:
				"Kopieren hat nicht geklappt. Bitte versuche es erneut oder kopiere manuell.",
			greeting: "Hallo zusammen,",
			bookingLine:
				"Ich möchte diese RoomFull-Buchung mit euch teilen: {unitName} ({unitType}).",
			timeLine: "Zeitraum: {time}",
			calendarHint:
				"Bitte hängt die beigefügte Kalenderdatei bei Bedarf manuell an eure Einladung an.",
			subject: "RoomFull: {unitName} ({unitType}) am {time}",
			dateTime: {
				locale: "de-DE",
				sameDay: "{date} von {start} bis {end} Uhr",
			},
			ics: {
				summary: "RoomFull: {unitName} ({unitType})",
				description: "Geteilter Termin aus RoomFull\\nZeitraum: {time}",
			},
		},
	},
	account: {
		page: {
			title: "Mein Account",
		},
		profile: {
			signedInAs: "Angemeldet als",
			signedIn: "Angemeldet",
			email: "E-Mail",
			role: "Rolle",
			memberSince: "Nutzer seit",
			roles: {
				CUSTOMER: "Customer",
				ADMIN: "Admin",
			},
		},
		contact: {
			title: "Fragen, Feedback oder Kritik",
			description: "Schreib uns direkt aus deinem Customer-Konto heraus.",
			action: "Kontakt aufnehmen",
		},
		teams: {
			title: "Private Team-Kontakte",
			description:
				"Lege Kontaktgruppen für wiederkehrende Buchungsfreigaben an und verwalte sie an einer Stelle.",
			action: "Meine Teams öffnen",
		},
		nextBooking: {
			title: "Nächste Buchung",
			loading: "Deine nächste Buchung wird geladen...",
			loadError: "Deine nächste Buchung konnte nicht geladen werden.",
			empty: "Du hast gerade keine anstehende Buchung.",
			emptyAction: "Keine anstehende Buchung",
			dateTime: {
				locale: "de-DE",
				sameDay: "{date} von {start} bis {end} Uhr",
				crossDay: "{start} Uhr bis {end} Uhr",
			},
		},
	},
	contact: {
		page: {
			title: "Kontakt",
		},
		intro: {
			eyebrow: "Direkter Draht zu RoomFull",
			title: "Wie können wir dir helfen?",
			description:
				"Ob Frage zu einer Buchung, Feedback oder etwas, das nicht rundläuft: Schreib uns. Wir kümmern uns darum.",
		},
		form: {
			title: "Schreib uns",
			description:
				"Je genauer du dein Anliegen beschreibst, desto besser können wir dir helfen.",
			typeLabel: "Worum geht es?",
			types: {
				QUESTION: "Frage",
				FEEDBACK: "Feedback",
				CRITICISM: "Kritik",
			},
			messageLabel: "Nachricht",
			messagePlaceholder: "Erzähl uns, wie wir helfen können.",
			messageRequired: "Die Nachricht darf nicht leer sein.",
			emptyMessage: "Bitte schreibe kurz, worum es geht.",
			submit: "Nachricht senden",
			submitPending: "Senden...",
			success: "Danke! Deine Nachricht ist bei uns angekommen.",
			errors: {
				badRequest: "Bitte prüfe dein Anliegen und deine Nachricht.",
				forbidden: "Mit diesem Konto kannst du keine Nachricht senden.",
				fallback:
					"Deine Nachricht konnte nicht gespeichert werden. Bitte versuche es erneut.",
			},
		},
	},
	myTeams: {
		page: {
			title: "Meine Teams",
			intro:
				"Verwalte private Kontaktgruppen für wiederkehrende Buchungsfreigaben. RoomFull speichert nur Namen und E-Mail-Adressen deiner Kontakte.",
			preparing: "Teams werden vorbereitet...",
		},
		client: {
			loading: "Deine Teams werden geladen...",
			loadError: "Deine Teams konnten nicht geladen werden.",
		},
		intro: {
			eyebrow: "Private Kontaktgruppen",
			title: "Wen möchtest du schnell wieder einladen können?",
			description:
				"Ein Team ist in RoomFull nur eine persönliche Kontaktliste für dich. Es ist keine gemeinsame Organisation und erzeugt keine automatischen E-Mails.",
		},
		notice: {
			title: "Verantwortung für Kontaktdaten",
			description:
				"Nutze in der Portfolio-Instanz nur fiktive Demo-Kontakte. Für lokale Tests verwende ausschließlich kontrollierte eigene Adressen.",
		},
		form: {
			title: "Neues Team anlegen",
			description:
				"Gib zuerst nur einen Teamnamen an. Kontakte fügst du im nächsten Schritt in der Teamverwaltung hinzu.",
			nameLabel: "Teamname",
			namePlaceholder: "Zum Beispiel Workshop Crew",
			nameRequired: "Bitte gib einen Teamnamen ein.",
			submit: "Team anlegen",
			submitPending: "Wird angelegt...",
			success: "Team angelegt.",
			errors: {
				badRequest: "Bitte prüfe den Teamnamen.",
				conflict:
					"Dieser Teamname existiert bereits oder dein Team-Limit ist erreicht.",
				forbidden: "Mit diesem Konto kannst du keine Teams verwalten.",
				fallback: "Das Team konnte nicht angelegt werden.",
			},
		},
		list: {
			title: "Deine Teams",
			description:
				"Teams werden alphabetisch nach aktueller Sprache sortiert. Leere Teams kannst du später mit Kontakten füllen.",
			empty:
				"Du hast noch kein Team angelegt. Starte mit einer kleinen Kontaktgruppe für wiederkehrende Einladungen.",
			memberOne: "1 Kontakt",
			membersMany: "{count} Kontakte",
			openTeam: "Verwalten",
		},
		detail: {
			page: {
				title: "Team verwalten",
				intro:
					"Pflege Name und Kontakte deines Teams. RoomFull speichert nur die Daten, die du für spätere Buchungsfreigaben brauchst.",
				back: "Zurück zu meinen Teams",
			},
			client: {
				loading: "Team wird geladen...",
				loadError: "Dieses Team konnte nicht geladen werden.",
				notFound:
					"Dieses Team gibt es nicht oder es gehört nicht zu deinem Konto.",
			},
			summary: {
				eyebrow: "Dein Team",
				memberCount: "{count} Kontakte in diesem Team",
			},
			notice: {
				title: "Verantwortung für Kontaktdaten",
				description:
					"Nutze in der Portfolio-Instanz nur fiktive Demo-Kontakte. Für lokale Tests verwende ausschließlich kontrollierte eigene Adressen.",
			},
			settings: {
				title: "Team-Einstellungen",
				description:
					"Benenne dein Team um oder lösche es endgültig. Beim Löschen werden auch alle zugehörigen Kontakte entfernt.",
				rename: {
					nameLabel: "Teamname",
					namePlaceholder: "Zum Beispiel Workshop Crew",
					nameRequired: "Bitte gib einen Teamnamen ein.",
					action: "Teamnamen speichern",
					pending: "Wird gespeichert...",
					success: "Teamname gespeichert.",
					errors: {
						badRequest: "Bitte prüfe den Teamnamen.",
						conflict:
							"Dieser Teamname existiert bereits oder dein Team-Limit ist erreicht.",
						forbidden:
							"Mit diesem Konto kannst du dieses Team nicht bearbeiten.",
						notFound:
							"Dieses Team gibt es nicht oder es gehört nicht zu deinem Konto.",
						fallback: "Der Teamname konnte nicht gespeichert werden.",
					},
				},
				delete: {
					action: "Team löschen",
					pending: "Wird gelöscht...",
					confirmation:
						"Dieses Team und alle Kontakte darin werden endgültig gelöscht. Wirklich fortfahren?",
					errors: {
						forbidden: "Mit diesem Konto kannst du dieses Team nicht löschen.",
						notFound:
							"Dieses Team gibt es nicht oder es gehört nicht zu deinem Konto.",
						fallback: "Das Team konnte nicht gelöscht werden.",
					},
				},
			},
			members: {
				title: "Kontakte",
				description:
					"Füge Kontakte für wiederkehrende Buchungsfreigaben hinzu. Kontakte werden alphabetisch nach Name und dann nach E-Mail sortiert.",
				required: "Bitte fülle Name und E-Mail aus.",
				empty:
					"Dieses Team ist noch leer. Füge deinen ersten Kontakt hinzu, damit du es später für Team Shares nutzen kannst.",
				create: {
					nameLabel: "Name",
					namePlaceholder: "Zum Beispiel Anna Muster",
					emailLabel: "E-Mail",
					emailPlaceholder: "anna@example.com",
					action: "Kontakt hinzufügen",
					pending: "Wird hinzugefügt...",
					success: "Kontakt hinzugefügt.",
				},
				update: {
					start: "Bearbeiten",
					cancel: "Abbrechen",
					nameLabel: "Name",
					emailLabel: "E-Mail",
					action: "Änderungen speichern",
					pending: "Wird gespeichert...",
					success: "Kontakt gespeichert.",
				},
				delete: {
					action: "Entfernen",
					pending: "Wird entfernt...",
					confirmation: "Kontakt „{name}“ wirklich entfernen?",
					success: "Kontakt „{name}“ entfernt.",
				},
				errors: {
					badRequest: "Bitte prüfe Name und E-Mail.",
					conflict:
						"Diese E-Mail existiert bereits in diesem Team oder das Kontakt-Limit ist erreicht.",
					forbidden: "Mit diesem Konto kannst du dieses Team nicht bearbeiten.",
					notFound:
						"Dieses Team oder dieser Kontakt existiert nicht für dein Konto.",
					fallback: "Die Kontaktänderung konnte nicht gespeichert werden.",
				},
			},
		},
	},
	adminShell: {
		page: {
			eyebrow: "Admin",
			title: "Admin Dashboard",
			description: "Buchungen, Nachfrage und Inventar auf einen Blick.",
		},
		navigation: {
			ariaLabel: "Admin-Navigation",
			dashboard: "Dashboard",
			bookings: "Buchungen",
			units: "Räume & Plätze",
			contactRequests: "Kontaktanfragen",
			unreadContactRequests: "Ungelesene Kontaktanfragen:",
		},
		analytics: {
			eyebrow: "Admin Analytics",
			title: "Nachfrageverlauf",
			dateLocale: "de-DE",
			dateRange: "{from} bis {to}",
			activeBookings: "Aktive Buchungen",
			cancellationRate: "Stornoquote",
			cancellationSummary: "{cancelled} von {total} storniert",
			loading: "Analytics werden geladen...",
			empty: "Keine aktiven Buchungen im Analytics-Zeitraum.",
			trendTitle: "Entwicklung",
			unitTypeDemandTitle: "Nachfrage nach Unit-Typ",
			bookingSeriesName: "Buchungen",
			errors: {
				forbidden: "Du hast keine Berechtigung für diesen Bereich.",
				fallback: "Die Analytics-Daten konnten nicht geladen werden.",
			},
		},
	},
	adminWorkspaces: {
		bookings: {
			page: {
				eyebrow: "Admin",
				title: "Buchungen",
				description: "Alle Buchungen im Überblick.",
			},
			filters: {
				today: "Heute",
				upcoming: "Anstehend",
				completed: "Abgeschlossen",
				cancelled: "Storniert",
				all: "Alle",
			},
			ranges: {
				week: "1 Woche",
				month: "1 Monat",
				quarter: "3 Monate",
				year: "1 Jahr",
			},
			summary: {
				today: "Heute",
				todayDescription: "Buchungen am aktuellen Tag",
				upcoming: "Anstehend",
				cancelled: "Storniert",
				rangeDescription: "Im gewählten Zeitraum",
				topBooked: "Meistgebucht",
				topBookedMeta: "{count} · {meta}",
				noData: "Keine Daten im Zeitraum",
			},
			controls: {
				view: "Ansicht",
				range: "Zeitraum",
				customer: "Customer",
				searchPlaceholder: "Name oder E-Mail suchen...",
			},
			loading: "Buchungen werden geladen...",
			errors: {
				forbidden: "Du hast keine Berechtigung für diesen Bereich.",
				fallback: "Die Buchungen konnten nicht geladen werden.",
			},
			table: {
				dateLocale: "de-DE",
				empty: 'Keine Buchungen für "{filter}".',
				bookingOne: "1 Buchung",
				bookingsMany: "{count} Buchungen",
				timeRange: "{start}-{end} Uhr",
				statuses: {
					today: "Heute",
					upcoming: "Anstehend",
					completed: "Abgeschlossen",
					cancelled: "Storniert",
				},
				cancelledNote: "Storno vermerkt",
			},
		},
		units: {
			page: {
				eyebrow: "Admin",
				title: "Räume & Plätze",
				description: "Buchbare Räume und Arbeitsplätze verwalten.",
			},
			newUnit: "Neue Unit",
			loading: "Units werden geladen...",
			errors: {
				forbidden: "Du hast keine Berechtigung für diesen Bereich.",
				contextFallback: "Der Unit-Kontext konnte nicht geladen werden.",
				listFallback: "Die Units konnten nicht geladen werden.",
			},
			table: {
				title: "Räume & Plätze",
				description: "Nach Status, Typ oder Name filtern.",
				unitOne: "1 Unit",
				unitsMany: "{count} Units",
				status: {
					active: "Aktiv",
					deactivated: "Deaktiviert",
					all: "Alle",
				},
				unitType: "Unit-Typ",
				allUnitTypes: "Alle Unit-Typen",
				name: "Name",
				searchPlaceholder: "Unit suchen...",
				empty: "Keine Units für die gewählten Filter.",
				columns: {
					name: "Name",
					unitType: "Unit-Typ",
					area: "Area",
					capacity: "Kapazität",
					status: "Status",
					displayOrder: "Display Order",
					actions: "Aktionen",
				},
				edit: "Bearbeiten",
			},
			form: {
				titleCreate: "Unit anlegen",
				titleEdit: "Unit bearbeiten",
				descriptionCreate: "Neue BookableUnit für das Inventar erfassen.",
				close: "Schließen",
				fields: {
					name: "Name",
					capacity: "Kapazität",
					descriptionDe: "Beschreibung (Deutsch)",
					descriptionEn: "Description (English)",
					unitType: "Unit-Typ",
					area: "Area",
					displayOrder: "Display Order",
					active: "Aktiv",
				},
				areaSelect: "Area auswählen",
				noArea: "Keine Area",
				create: "Unit anlegen",
				save: "Änderungen speichern",
				cancel: "Abbrechen",
				deactivate: "Unit deaktivieren",
				reactivate: "Unit reaktivieren",
				validation: {
					name: "Name darf nicht leer sein.",
					descriptionDe: "Die deutsche Beschreibung darf nicht leer sein.",
					descriptionEn: "Die englische Beschreibung darf nicht leer sein.",
					capacity: "Kapazität muss größer als 0 sein.",
					unitType: "Unit-Typ ist erforderlich.",
					area: "Ein Hot Desk braucht eine Area.",
					displayOrder: "Display Order muss mindestens 0 sein.",
				},
				errors: {
					badRequest: "Bitte prüfe die eingegebenen Unit-Daten.",
					notFound: "Diese Unit wurde nicht gefunden.",
					conflict:
						"Die Unit konnte wegen eines Konflikts nicht gespeichert werden.",
					noSelection: "Keine Unit zum Bearbeiten ausgewählt.",
					fallback: "Die Unit konnte nicht gespeichert werden.",
				},
			},
		},
		contactInbox: {
			page: {
				eyebrow: "Admin",
				title: "Kontaktanfragen",
				description: "Eingegangene Nachrichten lesen und verwalten.",
			},
			summary: {
				current: "Aktuell",
				unread: "Ungelesen",
				loadedFilter: "Im geladenen Filter",
			},
			filters: {
				readStateLabel: "Lesestatus",
				readState: {
					unread: "Ungelesen",
					read: "Gelesen",
					all: "Alle",
				},
				typeLabel: "Anliegen-Typ",
				types: {
					all: "Alle Typen",
					QUESTION: "Frage",
					FEEDBACK: "Feedback",
					CRITICISM: "Kritik",
				},
				sortLabel: "Sortierung",
				sort: {
					received_desc: "Neueste zuerst",
					received_asc: "Älteste zuerst",
				},
			},
			loading: "Kontaktanfragen werden geladen...",
			empty: "Keine Kontaktanfragen im gewählten Filter.",
			listTitle: "Kontaktanfragen",
			dateLocale: "de-DE",
			read: "Gelesen",
			unread: "Ungelesen",
			markAsRead: "Als gelesen markieren",
			markingAsRead: "Speichern...",
			errors: {
				forbidden: "Du hast keine Berechtigung für diesen Bereich.",
				loadFallback: "Die Kontaktanfragen konnten nicht geladen werden.",
				notFound: "Diese Kontaktanfrage wurde nicht gefunden.",
				updateFallback: "Die Kontaktanfrage konnte nicht aktualisiert werden.",
			},
		},
	},
	auth: {
		redirectFallback: "Bitte melde dich an, um fortzufahren.",
		signIn: {
			title: "Einloggen",
			intro: "Melde dich an, um mit deiner Buchung fortzufahren.",
			emailLabel: "E-Mail",
			passwordLabel: "Passwort",
			submit: "Einloggen",
			submitPending: "Einloggen...",
			registerLink: "Noch kein Konto? Registrieren",
			errorFallback: "Login ist fehlgeschlagen. Bitte versuche es erneut.",
		},
		signUp: {
			title: "Registrieren",
			intro: "Erstelle ein Konto, um deine Buchung fortzusetzen.",
			nameLabel: "Name",
			emailLabel: "E-Mail",
			passwordLabel: "Passwort",
			passwordHelp: "Mindestens 8 Zeichen",
			submit: "Registrieren",
			submitPending: "Registrieren...",
			loginLink: "Bereits ein Konto? Einloggen",
			errorFallback:
				"Registrierung ist fehlgeschlagen. Bitte versuche es erneut.",
		},
	},
} satisfies Record<string, unknown>;

export type Dictionary = typeof de;
