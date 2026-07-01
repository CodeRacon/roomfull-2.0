# Demo Customer Sessions for portfolio Guest Login

RoomFull's public Guest Login creates a fresh, isolated Demo Customer Session for each portfolio visitor instead of sharing one demo account. The session is a normal `CUSTOMER` user marked as demo, has an expiry for later cleanup, and is populated from a backend template with relative demo data so bookings, teams, and contact requests feel current without becoming a new role model.

We rejected a shared demo account because concurrent visitors would see and overwrite each other's changes. We also rejected static seed-only demo data for the Guest Login because booking dates and contact activity would age out; seed or future simulation data remains the separate source for Admin demo screens.

Demo Customers may exercise normal Customer workflows, but they must not change account security data, become regular accounts, or feed Admin demo data. Guest Login stays a public portfolio/auth entry point, while Admin presentation data remains curated separately.

## Demo Customer Permission Boundary

Demo Customers are normal `CUSTOMER` users for booking, team, contact, and account-read workflows. They are not a separate role.

Account identity and security mutation is outside the Demo Customer permission boundary. Future endpoints that change name, email, password, credential state, account deletion, or conversion from demo to regular account must check `isDemo` in backend service logic and reject Demo Customers before persistence.

Use `403 Forbidden` for blocked Demo Customer identity or security mutations. The user may keep using normal Customer workflows until the Demo Customer Session expires or is cleaned up.

## Demo Customer Cleanup

Expired Demo Customers are cleaned up by a manual backend maintenance command, not by a public API endpoint.

Run `npm run demo:cleanup` from `backend` to delete only users where `isDemo=true` and `demoExpiresAt < now`. The cleanup removes dependent Demo Customer data first: bookings, contact requests, team members, and teams. The final user deletion repeats the `isDemo=true` and expiry filter so regular Customers remain outside the cleanup boundary.
