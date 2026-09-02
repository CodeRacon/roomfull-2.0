# PRD: Private Teams und Team Booking Share

## Problem Statement

Customers buchen Coworking-Raeume haeufig fuer wiederkehrende Personengruppen. Namen, E-Mail-Adressen und Booking-Informationen muessen heute ausserhalb von RoomFull immer wieder neu zusammengestellt werden. RoomFull soll dabei weder zum E-Mail-Absender noch zur kollaborativen Organisations- oder Scheduling-Plattform werden.

Der urspruenglich geplante RSVP-faehige Booking Invitation Handoff ist im Apple-Calendar-Prototyp gescheitert: Eine spaeter geoeffnete Invitation mit derselben UID hielt zwar genau ein Event, uebernahm aber weder Team Member noch persoenliche Nachricht und bot keinen bewussten Versandpfad.

## Solution

RoomFull erhaelt private, ausschliesslich Customer-eigene Teams. Ein Team ist eine benannte Kontaktgruppe mit unabhaengigen Team Members aus Name und E-Mail-Adresse. Team Members benoetigen keinen RoomFull-Account und werden nicht mit registrierten Users verknuepft.

Fuer eine eigene Booking mit `status=ACTIVE` und `endTime >= now` bereitet der Customer auf einer geschuetzten Share-Seite ein clientneutrales Team Booking Share Package vor. Es umfasst getrennte Aktionen zum Kopieren von BCC-Adressen, Betreff und Nachricht sowie zum Herunterladen einer empfaengerfreundlichen Kalenderdatei.

RoomFull versendet nichts und speichert weder verwendetes Team noch Empfaengerauswahl, persoenliche Nachricht, Datei oder Versandstatus. Der Customer uebernimmt das Package in ein externes Versandwerkzeug.

## User Stories

### Private Teams

1. As a Customer, I want to create an empty private Team, so that I can add Members incrementally.
2. As a Customer, I want equivalent Team names rejected independent of casing and surrounding whitespace, so that my Team list remains unambiguous.
3. As a Customer, I want the visible Team name preserved as entered, so that normalization remains an internal concern.
4. As a Customer, I want to add, edit, and remove Team Members with name and email, so that my reusable contact group stays current.
5. As a Customer, I want duplicate normalized emails rejected within one Team but allowed in another Team, so that recipients are not duplicated accidentally.
6. As a Customer, I want to rename and explicitly delete a Team, so that obsolete contact groups can be maintained and removed.
7. As a Customer, I want Team deletion to remove its Members, so that no orphaned private contacts remain.
8. As a Customer, I want Team summaries with Member counts and details loaded on demand, so that unnecessary personal data is not transferred.
9. As a Customer, I want Teams and Members sorted in my active UI language, so that I can find them quickly.
10. As a Customer, I want My Teams reachable from profile menu and Account Overview, so that private contact management is discoverable.
11. As a Customer, I want clear limits and validation, so that invalid Team data is rejected consistently.
12. As a Customer, I want other Customers and Admins unable to access my Teams, so that private contacts stay private.
13. As a portfolio visitor, I want a persistent fictional-data notice, so that I do not store real third-party contacts in the demo.

### Team Booking Share

14. As a Customer, I want Teams optional for Booking creation, so that booking remains independent from contact management.
15. As a Customer, I want "Mit Team teilen" only for my active Bookings whose end is not past, including currently running Bookings.
16. As a Customer, I want the same Share entry in card, list, and calendar views, so that My Bookings keeps action parity.
17. As a Customer, I want a dedicated Share Page, so that Team selection, up to 50 Members, message, warnings, and package actions remain understandable.
18. As a Customer, I want all Teams visible while empty Teams are disabled, so that existing Teams do not disappear unexpectedly.
19. As a Customer, I want to choose one Team explicitly before Member details load, so that personal data is not fetched on page entry.
20. As a Customer, I want all Members initially selected and individual Members deselectable, so that one-off differences do not alter the Team.
21. As a Customer, I want switching Teams to preserve my personal message but reset recipients to the new Team, so that state does not leak across Teams.
22. As a Customer, I want all Package actions blocked without a selected recipient, so that an empty Share cannot be prepared accidentally.
23. As a Customer, I want a non-blocking warning when selected Members exceed BookableUnit capacity, so that I notice likely mismatches.
24. As a Customer, I want BCC addresses copied without Member names, so that the handoff remains private and clientneutral.
25. As a Customer, I want generated subject and message based on authoritative Booking data, so that date, time, and BookableUnit stay accurate.
26. As a Customer, I want to add an optional unsaved personal message, so that I can provide context without creating communication history in RoomFull.
27. As a Customer, I want Share content in the active RoomFull language, so that no second language state is needed.
28. As a Customer, I want an external-recipient-safe calendar file, so that Team Members receive event data without internal Booking metadata.
29. As a Customer, I want RoomFull not to open or control my mail client, so that I retain control over recipients, attachment, editing, and sending.
30. As a Team Member, I want the calendar file to contain accurate title, Berlin time, and BookableUnit, so that I can add the event without a RoomFull account.

## Implementation Decisions

### Team domain

- `Team` belongs to one Customer through `userId`, preserves visible `name`, and stores normalized `nameKey`; `(userId, nameKey)` is unique.
- `TeamMember` belongs to exactly one Team and stores trimmed `name` plus normalized lowercase `email`; `(teamId, email)` is unique.
- Deleting a Team cascades to its Members. A future Customer deletion cascades to all owned Teams and Members.
- Team names allow 1-80 characters, Member names 1-100, and emails at most 254 characters after trimming.
- Customers may own at most 20 Teams; each Team may contain at most 50 Members.
- Teams may be empty. Team Members are contacts, not Users, and are never matched to accounts.

### Team API and UI

- The session-scoped REST base is `/api/me/teams`; requests never accept `userId`.
- The API supports Team list/create, detail/update/delete, and nested Member create/update/delete. Updates use full editable representation `PUT`.
- Team list returns only `id`, `name`, and `memberCount`; Team Detail supplies Member data on demand.
- Missing and foreign Team resources both return `404`. Invalid input returns `400`, missing auth `401`, non-Customer roles `403`, and duplicates or limits `409`.
- My Teams and Team Detail are protected Customer pages with localized sorting, validation feedback, confirmed deletion, and persistent demo/privacy guidance.

### Share Context and page

- `GET /api/me/bookings/:bookingId/share-context` derives Customer ownership from the session and enforces `status=ACTIVE && endTime >= now`.
- Share Context returns only the Booking and BookableUnit data needed for the Share. Missing/foreign Bookings return `404`; own ineligible Bookings return `409`.
- The localized page is `/me/bookings/[bookingId]/share`. Admins and unauthenticated users cannot use it.
- Share Context and Team Summaries load independently in parallel. Team Detail loads only after explicit selection of one non-empty Team.
- Empty Teams remain visible with `memberCount=0` but disabled. If no usable Team exists, an Empty State links to My Teams without embedding Team CRUD.
- No Team is auto-selected. Selecting a Team initially selects all Members. Deselecting Members is ephemeral and never changes the stored Team.
- Changing Team preserves the personal message but discards the previous recipient selection and selects all Members of the new Team.
- All four Package actions require at least one selected Member.

### Clientneutral Share Package

- The browser prepares the Package from authorized Share Context and one loaded Team Detail. There is no generate endpoint.
- The four independent actions are: copy BCC addresses, copy subject, copy message, and download Share calendar file.
- BCC output contains only normalized lowercase emails separated by `, `. The UI tells the Customer to paste them into BCC rather than visible To or CC.
- There is no `mailto:` link, automatic mail-client opening, automatic attachment, or send action.
- Subject and body are generated from non-editable Booking facts. Only a plain-text personal message up to 500 characters is editable in RoomFull.
- Generated content uses the active `de` or `en` locale and includes a neutral greeting, optional personal message, date, Berlin time, BookableUnit, and manual attachment reminder.
- The external-recipient-safe `.ics` contains title, time range, BookableUnit, and stable Booking UID, but no visible Booking ID, internal status, personal message, Organizer, Attendees, or RSVP.
- Personal and Share calendar exports remain separate artifacts but use the same stable Booking UID.
- Selected Team, Members, message, generated content, file, and delivery state are never persisted.

### Decision history

- The Apple Calendar prototype on 24.06.2026 failed because the shared-UID import preserved one event but did not merge Team Members or personal message and exposed no deliberate send action.
- The former Booking Invitation, Organizer, Attendee, and RSVP model is superseded. No client-specific workaround is introduced.
- No ADR is required: this remains a reversible feature boundary and adds no infrastructure or provider lock-in.

## Testing Decisions

- Tests verify behavior through public interfaces and avoid private helper or repository-call assertions.
- Team service and persistence tests cover normalization, bounds, Customer-only access, ownership concealment, duplicate names/emails, empty Teams, 20/50 limits, updates, and cascade deletion.
- API tests cover Team CRUD plus Share Context authentication, role rejection, ownership, `404` concealment, `409` eligibility, and `endTime >= now`.
- OpenAPI and Bruno cover a complete Team CRUD path, Share Context, and core `400`, `401`, `403`, `404`, and `409` cases.
- Frontend entity tests cover Team summary/detail mapping and authenticated requests.
- Team UI tests cover name-first creation, sorting, Member management, confirmed deletion, validation, limits, and demo/privacy copy.
- Share UI tests cover action parity, explicit Team selection, disabled empty Teams, lazy Team Detail, all-Members default, deselection, Team change, zero-recipient readiness, localized content, BCC format, message limit, and non-blocking capacity warning.
- Calendar serializer tests cover RFC-safe escaping and folding, Berlin-to-UTC time, stable shared UID, recipient-safe visible fields, and absence of Booking ID, status, Organizer, Attendees, RSVP, and personal message.
- The end-to-end happy path covers Customer Team creation through copying the Package and downloading the Share calendar file; real delivery and calendar-client behavior are out of scope.

## Out of Scope

- RoomFull sending email or calendar invitations.
- RSVP, attendee status, Organizer behavior, delivery tracking, bounce handling, resend queues, or communication history.
- Calendar-provider OAuth or APIs for Apple, Google, Microsoft, Outlook, CalDAV, or universal client compatibility.
- `mailto:` flows, automatic attachment, automatic mail-client opening, or a combined send action.
- Persisting Booking-to-Team, Booking-to-Member, recipient selections, personal messages, generated content, files, or delivery state.
- Multiple Teams in one Share, a global contact book, or Team Members shared across Teams.
- Matching Team Members to Users, membership consent, collaborative Team workspaces, or Member permissions.
- Admin Team management, Team selection during Booking creation, or inline Team CRUD inside the Share page.
- Manual Team/Member ordering, soft deletion, archive, trash, or restoration.
- Real third-party contact data in the public portfolio instance.
- Stable application error codes; they remain a separate roadmap slice.

## Further Notes

- [Teams and Team Booking Share Flow](../../backend/docs/teams-flow.md) is the delivery source of truth.
- Backend-first vertical slices remain mandatory: Team schema and contract, Team Member detail, Team completion, Share Context and clientneutral Share Package.
- The existing deployment remains a disposable portfolio environment and gains no new mail or calendar-provider infrastructure.
