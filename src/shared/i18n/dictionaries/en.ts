import type { Dictionary } from "./de";

export const en = {
	metadata: {
		title: "RoomFull 2.0",
		description: "Book coworking spaces with clarity.",
	},
	navigation: {
		homeAriaLabel: "Go to homepage",
		bookingOptions: "Book",
		myBookings: "My bookings",
		admin: "Admin",
		adminDashboard: "Admin dashboard",
		profile: "Profile",
		account: "My account",
		contact: "Contact",
		signIn: "Sign in",
		signUp: "Create account",
		signOut: "Sign out",
		mainMenuOpen: "Open main menu",
		mainMenu: "Menu",
		legalAndHelp: "Legal and help",
		faq: "FAQ",
		privacy: "Privacy",
	},
	languageSwitcher: {
		label: "Language",
		de: "Deutsch",
		en: "English",
	},
	errorPages: {
		notFound: {
			statusCode: "404",
			title: "This page does not exist.",
			description:
				"The link may be outdated, or the address may have been typed incorrectly.",
			actionLabel: "Go home",
		},
		internal: {
			statusCode: "500",
			title: "Something went wrong.",
			description:
				"Please try again. If the problem continues, start fresh from the homepage.",
			actionLabel: "Go home",
			resetLabel: "Try again",
		},
	},
	home: {
		metadata: {
			title: "Book coworking spaces | RoomFull 2.0",
			description:
				"Find the right coworking setup for focus, calls, or teamwork and start booking in a few steps.",
		},
		hero: {
			titleLines: ["Book", "Coworking", "Spaces"],
			intro:
				"Find the right setup for focused work, calls, or teamwork. Choose a booking option, check availability, and secure your time slot.",
		},
		ctas: {
			bookingOptions: "Book now",
			myBookings: "My bookings",
			login: "Sign in",
		},
		bookingOptionsAriaLabel: "Booking options",
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
			singleSeat: "Single desk",
			upToPeople: "up to {count} people",
			seatsAvailable: "{count} desks available",
			oneRoomAvailable: "1 room available",
			roomsAvailable: "{count} rooms available",
		},
		duration: {
			minimum: "from {count} minutes",
		},
		actions: {
			select: "Select",
			selectNow: "Select now",
			selectAriaLabel: "Select {title}",
		},
	},
	bookingOptionsPage: {
		metadata: {
			title: "Choose your work mode | RoomFull 2.0",
			description:
				"Choose between hot desks, booths, team rooms, and meeting rooms, then continue with the right booking option.",
		},
		title: "Choose your work mode",
		intro:
			"Whether you need a focused desk, a quiet booth, or a room for your team: compare the options, then open the right selection.",
		listAriaLabel: "Compare booking options",
		emptyState: "No bookable desks or rooms are available right now.",
		options: {
			HOT_DESK: {
				label: "Work",
				title: "Hot Desk",
				description:
					"A flexible single desk in an open work area. Ideal when you need a productive place quickly.",
				variants: ["Open area", "Quiet zone"],
				cta: "Choose desk",
			},
			BOOTH: {
				label: "Focus",
				title: "Booth",
				description:
					"A compact retreat for focused work, calls, or short deep-work sessions.",
				variants: ["Phone Booth", "Focus Booth", "Deep Work Booth"],
				cta: "View booths",
			},
			TEAM_ROOM: {
				label: "Team",
				title: "Team Room",
				description:
					"A room for teamwork, alignment, and workshops with space for shared sessions.",
				variants: ["Sprint Room", "Workshop Room", "Project Room"],
				cta: "View team rooms",
			},
			MEETING_ROOM: {
				label: "Meet",
				title: "Meeting Room",
				description:
					"A larger room for meetings, presentations, and workshops with more people.",
				variants: ["Client Meeting", "Board Room", "Presentation Room"],
				cta: "View meeting rooms",
			},
		},
		availability: {
			seats: "{count} desks",
			oneRoom: "1 room",
			rooms: "{count} rooms",
		},
		capacity: {
			singleSeat: "Single desk",
			upToPeople: "up to {count} people",
		},
		duration: {
			minimumShort: "from {count} min.",
		},
	},
	bookingOptionDetailPage: {
		metadata: {
			titleTemplate: "Book {title} | RoomFull 2.0",
			descriptionTemplate:
				"Choose a concrete option for {title}, then start your booking for the active time slot.",
		},
		backToOptions: "Back to overview",
		eyebrow: "Booking option",
		stats: {
			selection: "Selection",
			duration: "Duration",
			available: "Available",
		},
		selection: {
			eyebrow: "Concrete selection",
			areaDescriptionFallback: "An area with bookable single desks.",
			emptyState:
				"There are currently no bookable desks or rooms for this option.",
		},
		options: {
			HOT_DESK: {
				sideLabel: "Work",
				title: "Hot Desk",
				description:
					"A flexible single desk in an open work area. Choose an area, then secure an available desk.",
				selectionLabel: "Area selection",
				selectionHeading: "Choose your area",
				cta: "Book hot desk",
			},
			BOOTH: {
				sideLabel: "Focus",
				title: "Booth",
				description:
					"A compact retreat for focused work, calls, or short deep-work sessions.",
				selectionLabel: "Room selection",
				selectionHeading: "Choose your booth",
				cta: "Book booth",
			},
			TEAM_ROOM: {
				sideLabel: "Team",
				title: "Team Room",
				description:
					"A room for teamwork, alignment, and workshops with space for shared sessions.",
				selectionLabel: "Room selection",
				selectionHeading: "Choose your team room",
				cta: "Book team room",
			},
			MEETING_ROOM: {
				sideLabel: "Meet",
				title: "Meeting Room",
				description:
					"A larger room for meetings, presentations, and workshops with more people.",
				selectionLabel: "Room selection",
				selectionHeading: "Choose your meeting room",
				cta: "Book meeting room",
			},
		},
		availability: {
			seat: {
				one: "1 desk",
				many: "{count} desks",
			},
			area: {
				one: "1 area",
				many: "{count} areas",
			},
			room: {
				one: "1 room",
				many: "{count} rooms",
			},
		},
		capacity: {
			desk: {
				one: "1 single desk",
				many: "{count} single desks",
			},
			onePerson: "1 person",
			people: "{count} people",
		},
		duration: {
			range: "{min}-{max} min.",
			fallback: "Time slot in booking",
		},
	},
	createBooking: {
		page: {
			title: "Create booking",
			intro: "Choose the date and time for your concrete bookable unit.",
			loadingContext: "Loading booking context...",
		},
		gate: {
			invalidContext: "Invalid booking context.",
			loadingContext: "Loading booking context...",
			preparingContext: "Preparing booking context...",
			contextUnavailable: "This offer is no longer bookable.",
			contextError: "Booking context could not be loaded.",
			unknownError: "An unknown error occurred.",
		},
		context: {
			eyebrow: "Booking context",
			selection: "Selection",
			capacity: "Capacity",
			duration: "Duration",
			directMode: "Direct unit",
			autoAssignMode: "Auto-assign",
			fallbackAreaDescription: "Hot-desk area with bookable single desks.",
			sideLabels: {
				HOT_DESK: "Areas",
				BOOTH: "Focus",
				TEAM_ROOM: "Team",
				MEETING_ROOM: "Meet",
			},
			capacityLabels: {
				onePerson: "1 person",
				people: "{count} people",
				oneDesk: "1 single desk",
				desks: "{count} single desks",
			},
			durationRange: "min. {min} - max. {max}",
		},
		calendar: {
			sectionEyebrow: "Date",
			title: "Choose your weekday",
			intro:
				"Choose an available weekday. Weekends and past days cannot be booked.",
			loadingLabel: "Loading occupancy...",
			previousMonth: "Back",
			nextMonth: "Next",
			previousMonthAriaLabel: "Show previous month",
			nextMonthAriaLabel: "Show next month",
			weekdayLabels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
			locale: "en-US",
			todayLabel: "today",
			states: {
				partiallyBooked: "partly booked",
				fullyBooked: "booked",
			},
		},
		timePicker: {
			sectionEyebrow: "Time",
			loadingAvailability: "Loading availability...",
			openingHours: "Opening hours: {start}-{end}",
			blockedIntervals: "Already booked",
			blockedInterval: "{start}-{end}",
			noSlots: "No matching time slots are available for this day.",
			startTime: "Start time",
			endTime: "End time",
			unavailableRange: "{start}-{end} unavailable",
			availableCount: "{count} free",
		},
		summary: {
			date: "on {date}",
			timeRange: "{start}-{end}",
			dateLocale: "en-US",
			duration: {
				minutes: "{count} min",
				hours: "{count}h",
				hoursAndMinutes: "{hours}h {minutes} min",
			},
		},
		submit: {
			label: "Create booking",
			pending: "Creating booking...",
		},
		errors: {
			calendarStatesFallback: "Calendar occupancy could not be loaded.",
			availabilityFallback: "Availability could not be loaded.",
			incompleteSelection: "Please choose date, start time, and end time.",
			badRequest: "Please check date and time.",
			notFound: "This offer is no longer bookable.",
			conflict: "This time slot has already been booked.",
			createFallback: "Booking could not be created.",
		},
	},
	myBookings: {
		page: {
			title: "My bookings",
			intro:
				"Keep track of upcoming visits, calendar downloads, and cancellations in one place.",
			preparing: "Preparing your bookings...",
		},
		client: {
			loading: "Loading your bookings...",
			loadError: "Your bookings could not be loaded.",
			createdSuccess: "Booking created.",
			cancelledSuccess: "Booking cancelled.",
		},
		views: {
			cards: "Cards",
			list: "List",
			calendar: "Calendar",
		},
		status: {
			active: "Active",
			cancelled: "Cancelled",
			past: "Past",
		},
		dateTime: {
			locale: "en-US",
			sameDay: "{date} from {start} to {end}",
			crossDay: "{start} to {end}",
			listSameDay: "{date}, {start}-{end}",
			listCrossDay: "{start} to {end}",
		},
		actions: {
			downloadIcs: "Download .ics",
			downloadIcsShort: ".ics",
			downloadIcsAriaLabel: "Download booking as ICS",
			cancelBooking: "Cancel booking",
			cancelShort: "Cancel",
			cancelConfirm: "Cancel booking",
			cancelAbort: "Keep booking",
			cancelKeyword: "CANCEL",
			cancelPrompt: 'Enter "{keyword}" to cancel this booking.',
			cancelAriaLabel: "Cancel booking",
		},
		cancelErrors: {
			unauthorized: "Please sign in again.",
			forbidden: "You are not allowed to cancel this booking.",
			notFound: "This booking could not be found.",
			conflict: "This booking can no longer be cancelled.",
			fallback: "Booking could not be cancelled.",
		},
		calendar: {
			previousMonth: "Back",
			nextMonth: "Next",
			previousMonthAriaLabel: "Show previous month",
			nextMonthAriaLabel: "Show next month",
			weekdayLabels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
			monthLocale: "en-US",
			bookingOne: "booking",
			bookingsMany: "bookings",
			showBookings: "{date}: show {count} {bookingLabel}",
		},
		sections: {
			noBookings: "No bookings yet.",
			upcomingTitle: "Upcoming bookings",
			upcomingEmpty: "No upcoming bookings.",
			pastTitle: "Past bookings and cancellations",
			pastEmpty: "No past bookings or cancellations.",
			bookingOne: "booking",
			bookingsMany: "bookings",
		},
	},
	account: {
		page: {
			title: "My account",
		},
		profile: {
			signedInAs: "Signed in as",
			signedIn: "Signed in",
			email: "Email",
			role: "Role",
			memberSince: "Member since",
			roles: {
				CUSTOMER: "Customer",
				ADMIN: "Admin",
			},
		},
		contact: {
			title: "Questions, feedback, or criticism",
			description: "Contact us directly from your customer account.",
			action: "Get in touch",
		},
		nextBooking: {
			title: "Next booking",
			loading: "Loading your next booking...",
			loadError: "Your next booking could not be loaded.",
			empty: "You currently have no upcoming booking.",
			emptyAction: "No upcoming booking",
			dateTime: {
				locale: "en-US",
				sameDay: "{date} from {start} to {end}",
				crossDay: "{start} to {end}",
			},
		},
	},
	contact: {
		page: {
			title: "Contact",
		},
		intro: {
			eyebrow: "Customer self-service",
			title: "Questions, feedback, and criticism about RoomFull.",
			description:
				"Tell us briefly what you need. Your message will be linked to your customer account.",
		},
		form: {
			title: "Get in touch",
			description:
				"Tell us what matters regarding your booking or your account.",
			typeLabel: "Request type",
			types: {
				QUESTION: "Question",
				FEEDBACK: "Feedback",
				CRITICISM: "Criticism",
			},
			messageLabel: "Message",
			messagePlaceholder: "What is this about?",
			messageRequired: "The message must not be empty.",
			emptyMessage: "Please briefly describe what this is about.",
			submit: "Send message",
			submitPending: "Sending...",
			success: "Your message has been received.",
			errors: {
				badRequest: "Please check your request type and message.",
				forbidden: "You cannot send a message with this account.",
				fallback: "Your message could not be saved. Please try again.",
			},
		},
	},
	adminShell: {
		page: {
			eyebrow: "Admin",
			title: "Admin dashboard",
			description:
				"Manage booking operations and the inventory available for booking.",
		},
		navigation: {
			ariaLabel: "Admin navigation",
			dashboard: "Dashboard",
			bookings: "Booking operations",
			units: "Unit inventory",
			contactRequests: "Contact inbox",
			unreadContactRequests: "Unread contact requests:",
		},
		analytics: {
			eyebrow: "Admin analytics",
			title: "Demand trends",
			dateLocale: "en-US",
			dateRange: "{from} to {to}",
			activeBookings: "Active bookings",
			cancellationRate: "Cancellation rate",
			cancellationSummary: "{cancelled} of {total} cancelled",
			loading: "Loading analytics...",
			empty: "No active bookings in the analytics period.",
			trendTitle: "Trend",
			unitTypeDemandTitle: "Demand by unit type",
			bookingSeriesName: "Bookings",
			errors: {
				forbidden: "You do not have permission to access this area.",
				fallback: "The analytics data could not be loaded.",
			},
		},
	},
	adminWorkspaces: {
		bookings: {
			page: {
				eyebrow: "Admin",
				title: "Booking operations",
				description:
					"Review upcoming, current, and completed bookings in daily operations.",
			},
			filters: {
				today: "Today",
				upcoming: "Upcoming",
				completed: "Completed",
				cancelled: "Cancelled",
				all: "All",
			},
			ranges: {
				week: "1 week",
				month: "1 month",
				quarter: "3 months",
				year: "1 year",
			},
			summary: {
				today: "Today",
				todayDescription: "Bookings on the current day",
				upcoming: "Upcoming",
				cancelled: "Cancelled",
				rangeDescription: "Within the selected period",
				topBooked: "Most booked",
				topBookedMeta: "{count} · {meta}",
				noData: "No data in this period",
			},
			controls: {
				view: "View",
				range: "Period",
				customer: "Customer",
				searchPlaceholder: "Search by name or email...",
			},
			loading: "Loading bookings...",
			errors: {
				forbidden: "You do not have permission to access this area.",
				fallback: "The bookings could not be loaded.",
			},
			table: {
				dateLocale: "en-US",
				empty: 'No bookings for "{filter}".',
				bookingOne: "1 booking",
				bookingsMany: "{count} bookings",
				timeRange: "{start}-{end}",
				statuses: {
					today: "Today",
					upcoming: "Upcoming",
					completed: "Completed",
					cancelled: "Cancelled",
				},
				cancelledNote: "Cancellation recorded",
			},
		},
		units: {
			page: {
				eyebrow: "Admin",
				title: "Unit inventory",
				description:
					"Manage active and deactivated bookable units for booking operations.",
			},
			newUnit: "New unit",
			loading: "Loading units...",
			errors: {
				forbidden: "You do not have permission to access this area.",
				contextFallback: "The unit context could not be loaded.",
				listFallback: "The units could not be loaded.",
			},
			table: {
				title: "Unit inventory",
				description: "Filter by status, unit type, or name.",
				unitOne: "1 unit",
				unitsMany: "{count} units",
				status: {
					active: "Active",
					deactivated: "Deactivated",
					all: "All",
				},
				unitType: "Unit type",
				allUnitTypes: "All unit types",
				name: "Name",
				searchPlaceholder: "Search units...",
				empty: "No units match the selected filters.",
				columns: {
					name: "Name",
					unitType: "Unit type",
					area: "Area",
					capacity: "Capacity",
					status: "Status",
					displayOrder: "Display order",
					actions: "Actions",
				},
				edit: "Edit",
			},
			form: {
				titleCreate: "Create unit",
				titleEdit: "Edit unit",
				descriptionCreate: "Add a new bookable unit to the inventory.",
				close: "Close",
				fields: {
					name: "Name",
					capacity: "Capacity",
					description: "Description",
					unitType: "Unit type",
					area: "Area",
					displayOrder: "Display order",
					active: "Active",
				},
				areaSelect: "Select area",
				noArea: "No area",
				create: "Create unit",
				save: "Save changes",
				cancel: "Cancel",
				deactivate: "Deactivate unit",
				reactivate: "Reactivate unit",
				validation: {
					name: "Name must not be empty.",
					description: "Description must not be empty.",
					capacity: "Capacity must be greater than 0.",
					unitType: "A unit type is required.",
					area: "A hot desk requires an area.",
					displayOrder: "Display order must be at least 0.",
				},
				errors: {
					badRequest: "Please check the unit details you entered.",
					notFound: "This unit could not be found.",
					conflict: "The unit could not be saved due to a conflict.",
					noSelection: "No unit was selected for editing.",
					fallback: "The unit could not be saved.",
				},
			},
		},
		contactInbox: {
			page: {
				eyebrow: "Admin",
				title: "Contact inbox",
				description:
					"Read incoming customer messages, filter by request type, and mark handled requests as read.",
			},
			summary: {
				current: "Current",
				unread: "Unread",
				loadedFilter: "Within the loaded filter",
			},
			filters: {
				readStateLabel: "Read status",
				readState: {
					unread: "Unread",
					read: "Read",
					all: "All",
				},
				typeLabel: "Request type",
				types: {
					all: "All types",
					QUESTION: "Question",
					FEEDBACK: "Feedback",
					CRITICISM: "Criticism",
				},
				sortLabel: "Sort order",
				sort: {
					received_desc: "Newest first",
					received_asc: "Oldest first",
				},
			},
			loading: "Loading contact requests...",
			empty: "No contact requests match the selected filter.",
			listTitle: "Contact requests",
			dateLocale: "en-US",
			read: "Read",
			unread: "Unread",
			markAsRead: "Mark as read",
			markingAsRead: "Saving...",
			errors: {
				forbidden: "You do not have permission to access this area.",
				loadFallback: "The contact requests could not be loaded.",
				notFound: "This contact request could not be found.",
				updateFallback: "The contact request could not be updated.",
			},
		},
	},
	auth: {
		redirectFallback: "Please sign in to continue.",
		signIn: {
			title: "Sign in",
			intro: "Sign in to continue with your booking.",
			emailLabel: "Email",
			passwordLabel: "Password",
			submit: "Sign in",
			submitPending: "Signing in...",
			registerLink: "No account yet? Create one",
			errorFallback: "Sign-in failed. Please try again.",
		},
		signUp: {
			title: "Create account",
			intro: "Create an account to continue your booking.",
			nameLabel: "Name",
			emailLabel: "Email",
			passwordLabel: "Password",
			passwordHelp: "At least 8 characters",
			submit: "Create account",
			submitPending: "Creating account...",
			loginLink: "Already have an account? Sign in",
			errorFallback: "Registration failed. Please try again.",
		},
	},
} satisfies Dictionary;
