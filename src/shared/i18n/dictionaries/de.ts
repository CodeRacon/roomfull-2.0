export const de = {
	metadata: {
		title: "RoomFull 2.0",
		description: "Coworking-Flächen einfach buchen.",
	},
	navigation: {
		homeAriaLabel: "Zur Startseite",
		bookingOptions: "Buchen",
		myBookings: "Meine Buchungen",
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
	home: {
		metadata: {
			title: "Coworking Spaces buchen | RoomFull 2.0",
			description:
				"Finde den passenden Coworking-Platz für Fokus, Gespräche oder Teamarbeit und starte direkt in die Buchung.",
		},
		hero: {
			titleLines: ["Coworking", "Spaces", "buchen"],
			intro:
				"Finde schnell den passenden Platz für Fokus, Gespräche oder Teamarbeit. Wähle eine Buchungsart, prüfe die Verfügbarkeit und sichere dir deinen Zeitraum.",
		},
		ctas: {
			bookingOptions: "Jetzt buchen",
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
			title: "Arbeitsmodus wählen | RoomFull 2.0",
			description:
				"Wähle zwischen Hot Desk, Booth, Team Room und Meeting Room und starte mit der passenden Buchungsoption.",
		},
		title: "Wähle deinen Arbeitsmodus",
		intro:
			"Ob fokussierter Einzelplatz, ruhige Booth oder Raum für dein Team: Vergleiche die Optionen und öffne danach die passende Auswahl.",
		listAriaLabel: "Buchungsarten vergleichen",
		emptyState: "Gerade sind keine buchbaren Plätze oder Räume verfügbar.",
		options: {
			HOT_DESK: {
				label: "Work",
				title: "Hot Desk",
				description:
					"Flexibler Einzelplatz in einem offenen Arbeitsbereich. Ideal, wenn du schnell einen produktiven Platz brauchst.",
				variants: ["Offener Bereich", "Ruhige Zone"],
				cta: "Platz wählen",
			},
			BOOTH: {
				label: "Focus",
				title: "Booth",
				description:
					"Kompakter Rückzugsort für konzentriertes Arbeiten, Telefonate oder kurze Fokus-Sessions.",
				variants: ["Phone Booth", "Focus Booth", "Deep Work Booth"],
				cta: "Booths ansehen",
			},
			TEAM_ROOM: {
				label: "Team",
				title: "Team Room",
				description:
					"Raum für Teamarbeit, Abstimmungen und Workshops mit genug Platz für gemeinsame Sessions.",
				variants: ["Sprint Room", "Workshop Room", "Project Room"],
				cta: "Teamräume ansehen",
			},
			MEETING_ROOM: {
				label: "Meet",
				title: "Meeting Room",
				description:
					"Großer Raum für Meetings, Präsentationen und Workshops mit mehr Personen.",
				variants: ["Client Meeting", "Board Room", "Presentation Room"],
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
				"Wähle eine konkrete Option für {title} und starte die Buchung im aktiven Zeitraum.",
		},
		backToOptions: "Zurück zur Übersicht",
		eyebrow: "Buchungsoption",
		stats: {
			selection: "Auswahl",
			duration: "Dauer",
			available: "Verfügbar",
		},
		selection: {
			eyebrow: "Konkrete Auswahl",
			areaDescriptionFallback: "Ein Bereich mit buchbaren Einzelplätzen.",
			emptyState:
				"Für diese Auswahl gibt es aktuell keine buchbaren Plätze oder Räume.",
		},
		options: {
			HOT_DESK: {
				sideLabel: "Work",
				title: "Hot Desk",
				description:
					"Flexibler Einzelplatz in einem offenen Arbeitsbereich. Wähle einen Bereich und sichere dir danach einen freien Platz.",
				selectionLabel: "Bereichsauswahl",
				selectionHeading: "Wähle deinen Bereich",
				cta: "Hot Desk buchen",
			},
			BOOTH: {
				sideLabel: "Focus",
				title: "Booth",
				description:
					"Kompakter Rückzugsort für konzentriertes Arbeiten, Telefonate oder kurze Fokus-Sessions.",
				selectionLabel: "Raumauswahl",
				selectionHeading: "Wähle deine Booth",
				cta: "Booth buchen",
			},
			TEAM_ROOM: {
				sideLabel: "Team",
				title: "Team Room",
				description:
					"Raum für Teamarbeit, Abstimmungen und Workshops mit genug Platz für gemeinsame Sessions.",
				selectionLabel: "Raumauswahl",
				selectionHeading: "Wähle deinen Team Room",
				cta: "Team Room buchen",
			},
			MEETING_ROOM: {
				sideLabel: "Meet",
				title: "Meeting Room",
				description:
					"Großer Raum für Meetings, Präsentationen und Workshops mit mehr Personen.",
				selectionLabel: "Raumauswahl",
				selectionHeading: "Wähle deinen Meeting Room",
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
			title: "Buchung erstellen",
			intro: "Lege Datum und Uhrzeit für deine konkrete BookableUnit fest.",
			loadingContext: "Booking Context wird geladen...",
		},
		gate: {
			invalidContext: "Ungültiger Buchungskontext.",
			loadingContext: "Booking Context wird geladen...",
			preparingContext: "Booking Context wird vorbereitet...",
			contextUnavailable: "Dieses Angebot ist nicht mehr buchbar.",
			contextError: "Booking Context konnte nicht geladen werden.",
			unknownError: "Ein unbekannter Fehler ist aufgetreten.",
		},
		context: {
			eyebrow: "Booking Context",
			selection: "Auswahl",
			capacity: "Kapazität",
			duration: "Dauer",
			directMode: "Direkte Unit",
			autoAssignMode: "Auto-Assign",
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
			title: "Wähle deinen Werktag",
			intro:
				"Wähle einen verfügbaren Werktag. Wochenenden und vergangene Tage sind nicht buchbar.",
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
			label: "Buchung erstellen",
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
				"Behalte deine kommenden Termine, Kalender-Downloads und Stornierungen an einem Ort im Blick.",
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
			eyebrow: "Customer Self-Service",
			title: "Fragen, Feedback und Kritik zu RoomFull.",
			description:
				"Teile uns kurz mit, was du brauchst. Deine Nachricht wird deinem Customer-Konto zugeordnet.",
		},
		form: {
			title: "Kontakt aufnehmen",
			description:
				"Schreib uns, was zu deiner Buchung oder deinem Account wichtig ist.",
			typeLabel: "Anliegen-Typ",
			types: {
				QUESTION: "Frage",
				FEEDBACK: "Feedback",
				CRITICISM: "Kritik",
			},
			messageLabel: "Nachricht",
			messagePlaceholder: "Worum geht es?",
			messageRequired: "Die Nachricht darf nicht leer sein.",
			emptyMessage: "Bitte schreibe kurz, worum es geht.",
			submit: "Nachricht senden",
			submitPending: "Senden...",
			success: "Deine Nachricht ist angekommen.",
			errors: {
				badRequest: "Bitte prüfe dein Anliegen und deine Nachricht.",
				forbidden: "Mit diesem Konto kannst du keine Nachricht senden.",
				fallback:
					"Deine Nachricht konnte nicht gespeichert werden. Bitte versuche es erneut.",
			},
		},
	},
	adminShell: {
		page: {
			eyebrow: "Admin",
			title: "Admin Dashboard",
			description:
				"Steuere den Buchungsbetrieb und verwalte das buchbare Inventar.",
		},
		navigation: {
			ariaLabel: "Admin-Navigation",
			dashboard: "Dashboard",
			bookings: "Buchungsbetrieb",
			units: "Unit-Inventar",
			contactRequests: "Contact Inbox",
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
				title: "Buchungsbetrieb",
				description:
					"Prüfe anstehende, heutige und abgeschlossene Buchungen im laufenden Betrieb.",
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
				title: "Unit-Inventar",
				description:
					"Verwalte aktive und deaktivierte BookableUnits für den Buchungsbetrieb.",
			},
			newUnit: "Neue Unit",
			loading: "Units werden geladen...",
			errors: {
				forbidden: "Du hast keine Berechtigung für diesen Bereich.",
				contextFallback: "Der Unit-Kontext konnte nicht geladen werden.",
				listFallback: "Die Units konnten nicht geladen werden.",
			},
			table: {
				title: "Unit-Inventar",
				description: "Filtere nach Status, Unit-Typ oder Name.",
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
					description: "Beschreibung",
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
					description: "Beschreibung darf nicht leer sein.",
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
				title: "Contact Inbox",
				description:
					"Lies eingegangene Customer-Nachrichten, filtere nach Anliegen und markiere bearbeitete Anfragen als gelesen.",
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
