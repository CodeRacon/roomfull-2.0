import type { Dictionary } from "./de";

export const en = {
	metadata: {
		title: "RoomFull 2.0",
		description: "Book coworking spaces with clarity.",
	},
	navigation: {
		homeAriaLabel: "Go to homepage",
		bookingOptions: "Find a space",
		myBookings: "My bookings",
		teams: "My teams",
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
	faqPage: {
		metadata: {
			title: "FAQ | RoomFull 2.0",
			description:
				"Answers about choosing, equipping, and booking coworking desks and rooms.",
		},
		title: "FAQs",
		subtitle: "Frequently asked questions",
		intro:
			"Find the desk or room that suits your plans and learn everything you need to know about equipment, booking times, and using the space.",
		sections: {
			matchingSpace: {
				question: "Which desk or room is right for me?",
				intro: "It depends on how you want to work:",
				hotDesk:
					"A Hot Desk is ideal for focused solo work—spontaneous, flexible, and available in either the open area or the quieter “Quiet Place.”",
				booth:
					"A Booth gives you more privacy for focused work, calls, and confidential conversations.",
				teamRoom:
					"A Team Room is ideal for working together, brainstorming, and creative sessions.",
				meetingRoom:
					"A Meeting Room provides the right setting for presentations, decisions, and larger discussions.",
			},
			areas: {
				question: "What is the difference between Open World and Quiet Place?",
				openWorld:
					"Open World is a livelier, more social working environment. It is a good fit if you enjoy being around others and do not mind everyday workspace noise.",
				quietPlace:
					"Quiet Place is designed for calm, focused work. Conversations and longer calls should be avoided there.",
			},
			basicEquipment: {
				question: "What basic equipment is included?",
				answer:
					"Every desk and room includes fast Wi-Fi, easily accessible power outlets, and ergonomic seating.",
				trafficLight:
					"Every desk and room also has a discreet booking light that reminds you when your booking is about to end.",
			},
			equipment: {
				question: "How are the individual desks and rooms equipped?",
				hotDesk: "Hot Desks include a monitor and a docking station.",
				booth:
					"Booths are sound-reduced and include a monitor, table, power outlets, and comfortable lighting.",
				teamRoom:
					"Team Rooms include a large display, a whiteboard, and facilitation materials for collaborative sessions.",
				meetingRoom:
					"Meeting Rooms include a projector, a whiteboard wall, and a video conferencing system.",
			},
			booking: {
				question: "How does booking work?",
				intro:
					"First, think about what you need for your workday. Then choose your date and time.",
				selection:
					"For a Hot Desk, you choose an area and RoomFull automatically assigns an available desk there. For Booths, Team Rooms, and Meeting Rooms, you select the room yourself.",
				account:
					"You need a user account to make a confirmed booking. You can then find your reservation later under “My bookings.”",
			},
			duration: {
				question: "How long can I book for?",
				intro:
					"The minimum and maximum duration depends on the desk or room you choose:",
				hotDesk: "Hot Desk: 30 minutes to 4 hours",
				booth: "Booth: 1 to 4 hours",
				teamRoom: "Team Room: 1 to 8 hours",
				meetingRoom: "Meeting Room: 1 to 8 hours",
			},
			openingHours: {
				question: "When can I book?",
				answer:
					"Bookings are available Monday through Friday between 8:00 a.m. and 10:00 p.m. Past time periods and desks or rooms that are already booked are not available for selection.",
			},
			cancellation: {
				question: "Can I cancel my booking?",
				answer:
					"Yes. You can find your future bookings under “My bookings” and cancel one there if your plans change.",
			},
			overtime: {
				question:
					"What happens if I accidentally use my desk or room for longer than I booked?",
				intro:
					"Don’t worry—it can happen. To help you keep track of the end time, every desk and room has a discreet status light:",
				green:
					"Green: Your booking is active. The light begins to pulse gently 15 minutes before it ends.",
				yellow: "Yellow: 5 minutes remaining—time to start wrapping up.",
				red: "Red: Your booking time has ended.",
				outro:
					"Once the light turns red, please free up your desk or room promptly. The next person may already be waiting for their booking.",
			},
		},
	},
	home: {
		metadata: {
			title: "Book coworking spaces | RoomFull 2.0",
			description:
				"Find the right coworking setup for focus, calls, or teamwork and start booking in a few steps.",
		},
		hero: {
			titleLines: ["Room", "for great", "work."],
			intro:
				"Whether it’s deep work, a team session, or an important meeting, RoomFull has the space that fits your day.",
		},
		ctas: {
			bookingOptions: "Find your space",
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
			title: "Find a coworking space | RoomFull 2.0",
			description: "Find the right hot desk, booth, or room for your workday.",
		},
		title: "What do you need for your day?",
		intro:
			"Whether you want to focus, step away for a call, or get together with your team, you’ll find the right space for your plans here.",
		listAriaLabel: "Compare booking options",
		emptyState: "No bookable desks or rooms are available right now.",
		options: {
			HOT_DESK: {
				label: "Work",
				title: "Hot Desk",
				description:
					"A flexible single desk, either in the open area or in our quiet zone. Ideal when you need a productive place to work at short notice.",
				descriptionEmphasis: null,
				cta: "Choose desk",
			},
			BOOTH: {
				label: "Focus",
				title: "Booth",
				description:
					"Small retreats for focus, calls, and deep work – perfect when you want to switch off for a moment, work with full concentration, or talk in peace.",
				descriptionEmphasis: null,
				cta: "View booths",
			},
			TEAM_ROOM: {
				label: "Team",
				title: "Team Room",
				description:
					"A room for working together, creative sessions, and bringing your ideas to life – fully equipped for productive team moments.",
				descriptionEmphasis: null,
				cta: "View team rooms",
			},
			MEETING_ROOM: {
				label: "Meet",
				title: "Meeting Room",
				description:
					"More room for interactive exchange, decisions, and presentations – welcoming, spacious, and made for the good meetings.",
				descriptionEmphasis: "good",
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
				"Explore available areas or rooms for {title} and start your booking.",
		},
		backToOptions: "Back to overview",
		stats: {
			selection: "Booking",
			duration: "Duration",
			available: "Available",
		},
		selection: {
			areaDescriptionFallback: "An area with bookable single desks.",
			emptyState:
				"There are currently no bookable desks or rooms for this option.",
		},
		options: {
			HOT_DESK: {
				sideLabel: "Work",
				title: "Hot Desk",
				description:
					"A flexible single desk, either in the open area or in our quiet zone. Ideal when you need a productive place to work at short notice.",
				descriptionEmphasis: null,
				selectionLabel: "Choose an area",
				selectionEyebrow: "Your environment",
				selectionHeading: "Where would you like to work?",
				cta: "Book hot desk",
			},
			BOOTH: {
				sideLabel: "Focus",
				title: "Booth",
				description:
					"Small retreats for focus, calls, and deep work – perfect when you want to switch off for a moment, work with full concentration, or talk in peace.",
				descriptionEmphasis: null,
				selectionLabel: "Choose your room",
				selectionEyebrow: "Our booths",
				selectionHeading: "Which booth works for you?",
				cta: "Book booth",
			},
			TEAM_ROOM: {
				sideLabel: "Team",
				title: "Team Room",
				description:
					"A room for working together, creative sessions, and bringing your ideas to life – fully equipped for productive team moments.",
				descriptionEmphasis: null,
				selectionLabel: "Choose your room",
				selectionEyebrow: "Our rooms",
				selectionHeading: "Which room works for your team?",
				cta: "Book team room",
			},
			MEETING_ROOM: {
				sideLabel: "Meet",
				title: "Meeting Room",
				description:
					"More room for interactive exchange, decisions, and presentations – welcoming, spacious, and made for the good meetings.",
				descriptionEmphasis: "good",
				selectionLabel: "Choose your room",
				selectionEyebrow: "Our rooms",
				selectionHeading: "Which room works for you?",
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
			title: "Your booking",
			intro: "Choose a date and time—we’ll guide you through the rest.",
			loadingContext: "Loading your selection...",
		},
		gate: {
			invalidContext: "This selection is invalid.",
			loadingContext: "Loading your selection...",
			preparingContext: "Preparing your selection...",
			contextUnavailable: "This offer is no longer bookable.",
			contextError: "Your selection could not be loaded.",
			unknownError: "An unknown error occurred.",
		},
		context: {
			eyebrow: "Your selection",
			selection: "Selection",
			capacity: "Capacity",
			duration: "Duration",
			directMode: "Room selected by you",
			autoAssignMode: "We’ll choose a desk for you",
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
			title: "When would you like to come?",
			intro: "Choose an available day.",
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
			label: "Book now",
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
				"Upcoming, past, or cancelled: find all your bookings at a glance.",
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
			shareTeam: "Share with team",
			shareTeamShort: "Share team",
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
	bookingShare: {
		page: {
			title: "Share booking with team",
			intro:
				"Choose a team, adjust recipients if needed, then copy the BCC list, subject, message, or the calendar file.",
			back: "Back to my bookings",
		},
		loading: {
			page: "Loading share data...",
			team: "Loading team contacts...",
		},
		errors: {
			notFound:
				"This booking does not exist or does not belong to your account.",
			conflict: "This booking is no longer eligible for a team share.",
			teamLoad: "The contacts for this team could not be loaded.",
			fallback: "The share page could not be loaded.",
		},
		summary: {
			eyebrow: "Booking context",
			unitType: "Type: {unitType}",
			capacity: "Capacity: {capacity}",
			time: "Time: {time}",
		},
		notice: {
			title: "Privacy and product boundary",
			description:
				"RoomFull does not send anything itself. Paste copied addresses into BCC in your mail tool and attach the calendar file manually.",
		},
		selection: {
			title: "Choose team and recipients",
			description:
				"Empty teams stay visible but cannot be used for shares yet. Your personal message stays when you switch teams.",
			noTeams:
				"You have not created a team yet. Create a private contact group first.",
			openTeams: "Open my teams",
			manageEmptyTeam: "Manage empty team",
			select: "Choose team",
			selected: "Selected",
			emptyTeam: "0 contacts",
			memberOne: "1 contact",
			membersMany: "{count} contacts",
			membersTitle: "Recipients from {teamName}",
			membersDescription:
				"After choosing a team, all contacts are preselected. You can deselect them for this share.",
			messageLabel: "Personal message",
			messagePlaceholder: "Optional: a short personal note for your team.",
			messageHint: "{remaining} characters remaining.",
			capacityWarning:
				"Warning: {selected} selected contacts for capacity {capacity}. This does not block the share.",
		},
		package: {
			title: "Share package",
			description:
				"Copy each part separately or download the calendar file. Without selected recipients, all actions stay disabled.",
			copyBcc: "Copy BCC addresses",
			copySubject: "Copy subject",
			copyMessage: "Copy message",
			downloadIcs: "Download calendar file",
			bccHint:
				"Please place recipients in BCC instead of visible To or CC fields.",
			bccSuccess: "BCC addresses copied.",
			subjectSuccess: "Subject copied.",
			messageSuccess: "Message copied.",
			icsSuccess: "Calendar file created.",
			copyFallback: "Copying did not work. Please try again or copy manually.",
			greeting: "Hello everyone,",
			bookingLine:
				"I would like to share this RoomFull booking with you: {unitName} ({unitType}).",
			timeLine: "Time: {time}",
			calendarHint:
				"Please attach the calendar file manually to your invitation if needed.",
			subject: "RoomFull: {unitName} ({unitType}) on {time}",
			dateTime: {
				locale: "en-US",
				sameDay: "{date} from {start} to {end}",
			},
			ics: {
				summary: "RoomFull: {unitName} ({unitType})",
				description: "Shared event from RoomFull\\nTime: {time}",
			},
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
		teams: {
			title: "Private team contacts",
			description:
				"Create contact groups for recurring booking shares and manage them in one place.",
			action: "Open my teams",
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
			eyebrow: "Your direct line to RoomFull",
			title: "How can we help?",
			description:
				"Whether you have a question about a booking, some feedback, or something isn’t working as it should, send us a message. We’re here to help.",
		},
		form: {
			title: "Send us a message",
			description: "The more detail you share, the better we can help.",
			typeLabel: "What’s this about?",
			types: {
				QUESTION: "Question",
				FEEDBACK: "Feedback",
				CRITICISM: "Criticism",
			},
			messageLabel: "Message",
			messagePlaceholder: "Tell us how we can help.",
			messageRequired: "The message must not be empty.",
			emptyMessage: "Please briefly describe what this is about.",
			submit: "Send message",
			submitPending: "Sending...",
			success: "Thank you! We’ve received your message.",
			errors: {
				badRequest: "Please check your request type and message.",
				forbidden: "You cannot send a message with this account.",
				fallback: "Your message could not be saved. Please try again.",
			},
		},
	},
	myTeams: {
		page: {
			title: "My teams",
			intro:
				"Manage private contact groups for recurring booking shares. RoomFull only stores your contacts' names and email addresses.",
			preparing: "Preparing teams...",
		},
		client: {
			loading: "Loading your teams...",
			loadError: "Your teams could not be loaded.",
		},
		intro: {
			eyebrow: "Private contact groups",
			title: "Who do you want to invite faster next time?",
			description:
				"A team in RoomFull is only a personal contact list for you. It is not a shared organization and does not trigger automatic emails.",
		},
		notice: {
			title: "Responsible contact data use",
			description:
				"Only use fictitious demo contacts in the portfolio instance. For local tests, only use addresses you control yourself.",
		},
		form: {
			title: "Create a new team",
			description:
				"Start with a team name only. You can add contacts in team management in the next step.",
			nameLabel: "Team name",
			namePlaceholder: "For example Workshop Crew",
			nameRequired: "Please enter a team name.",
			submit: "Create team",
			submitPending: "Creating...",
			success: "Team created.",
			errors: {
				badRequest: "Please check the team name.",
				conflict:
					"This team name already exists, or your team limit has been reached.",
				forbidden: "This account cannot manage teams.",
				fallback: "The team could not be created.",
			},
		},
		list: {
			title: "Your teams",
			description:
				"Teams are sorted alphabetically in the active language. Empty teams can be filled with contacts later.",
			empty:
				"You have not created a team yet. Start with a small contact group for recurring invitations.",
			memberOne: "1 contact",
			membersMany: "{count} contacts",
			openTeam: "Manage",
		},
		detail: {
			page: {
				title: "Manage team",
				intro:
					"Maintain your team's name and contacts. RoomFull only stores the data you need for later booking shares.",
				back: "Back to my teams",
			},
			client: {
				loading: "Loading team...",
				loadError: "This team could not be loaded.",
				notFound:
					"This team does not exist or does not belong to your account.",
			},
			summary: {
				eyebrow: "Your team",
				memberCount: "{count} contacts in this team",
			},
			notice: {
				title: "Responsible contact data use",
				description:
					"Only use fictitious demo contacts in the portfolio instance. For local tests, only use addresses you control yourself.",
			},
			settings: {
				title: "Team settings",
				description:
					"Rename your team or delete it permanently. Deleting the team also removes all related contacts.",
				rename: {
					nameLabel: "Team name",
					namePlaceholder: "For example Workshop Crew",
					nameRequired: "Please enter a team name.",
					action: "Save team name",
					pending: "Saving...",
					success: "Team name saved.",
					errors: {
						badRequest: "Please check the team name.",
						conflict:
							"This team name already exists, or your team limit has been reached.",
						forbidden: "This account cannot edit this team.",
						notFound:
							"This team does not exist or does not belong to your account.",
						fallback: "The team name could not be saved.",
					},
				},
				delete: {
					action: "Delete team",
					pending: "Deleting...",
					confirmation:
						"This team and all contacts inside it will be permanently deleted. Continue?",
					errors: {
						forbidden: "This account cannot delete this team.",
						notFound:
							"This team does not exist or does not belong to your account.",
						fallback: "The team could not be deleted.",
					},
				},
			},
			members: {
				title: "Contacts",
				description:
					"Add contacts for recurring booking shares. Contacts are sorted alphabetically by name and then by email.",
				required: "Please fill out both name and email.",
				empty:
					"This team is still empty. Add your first contact so you can use it later for team shares.",
				create: {
					nameLabel: "Name",
					namePlaceholder: "For example Anna Example",
					emailLabel: "Email",
					emailPlaceholder: "anna@example.com",
					action: "Add contact",
					pending: "Adding...",
					success: "Contact added.",
				},
				update: {
					start: "Edit",
					cancel: "Cancel",
					nameLabel: "Name",
					emailLabel: "Email",
					action: "Save changes",
					pending: "Saving...",
					success: "Contact saved.",
				},
				delete: {
					action: "Remove",
					pending: "Removing...",
					confirmation: "Remove contact “{name}”?",
					success: "Contact “{name}” removed.",
				},
				errors: {
					badRequest: "Please check the name and email.",
					conflict:
						"This email already exists in this team, or the contact limit has been reached.",
					forbidden: "This account cannot edit this team.",
					notFound: "This team or contact does not exist for your account.",
					fallback: "The contact change could not be saved.",
				},
			},
		},
	},
	adminShell: {
		page: {
			eyebrow: "Admin",
			title: "Admin dashboard",
			description: "Bookings, demand, and inventory at a glance.",
		},
		navigation: {
			ariaLabel: "Admin navigation",
			dashboard: "Dashboard",
			bookings: "Bookings",
			units: "Rooms & desks",
			contactRequests: "Contact requests",
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
				title: "Bookings",
				description: "All bookings at a glance.",
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
				title: "Rooms & desks",
				description: "Manage bookable rooms and workspaces.",
			},
			newUnit: "New unit",
			loading: "Loading units...",
			errors: {
				forbidden: "You do not have permission to access this area.",
				contextFallback: "The unit context could not be loaded.",
				listFallback: "The units could not be loaded.",
			},
			table: {
				title: "Rooms & desks",
				description: "Filter by status, type, or name.",
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
					descriptionDe: "Description (German)",
					descriptionEn: "Description (English)",
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
					descriptionDe: "The German description must not be empty.",
					descriptionEn: "The English description must not be empty.",
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
				title: "Contact requests",
				description: "Read and manage incoming messages.",
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
