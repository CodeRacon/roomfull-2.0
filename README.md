# RoomFull 2.0

RoomFull 2.0 is a full-stack booking application for coworking spaces.

The project demonstrates how a real-world booking flow can be implemented with clear domain rules, role-based access, availability checks, conflict prevention and an admin interface for operational management.

It is built as a portfolio project with production deployment, API documentation and a structured frontend/backend architecture.

## Live Demo

* Application: https://roomfull.michael-buschmann.dev
* API Documentation: https://api.roomfull.michael-buschmann.dev/docs
* API Healthcheck: https://api.roomfull.michael-buschmann.dev/health

The public demo environment contains demo data only. Please do not enter real personal data or reused passwords.

## What RoomFull Does

RoomFull allows users to browse coworking options, check availability and create bookings for different types of bookable units.

Admins can manage the available unit inventory and oversee the booking operation.

The core idea is simple:

> Find a suitable space, check whether it is available, book it — without double bookings, invalid time ranges or unauthorized actions.

## Product Scope

RoomFull supports four coworking unit types:

* Hot Desk
* Booth
* Team Room
* Meeting Room

The application includes two main user contexts:

### Customer Area

Customers can:

* create an account
* sign in
* browse available booking options
* view active units
* check availability
* create bookings
* view their own bookings
* cancel their own future bookings

### Admin Area

Admins can:

* access an admin dashboard
* create bookable units
* edit existing units
* deactivate units
* reactivate units
* review booking operations
* create operational bookings through the regular customer booking flow

## Domain Rules

The backend is responsible for enforcing the booking rules.

A booking connects:

* a user
* a bookable unit
* a start time
* an end time

Important rules include:

* only active units can be booked
* bookings must be in the future
* the start time must be before the end time
* bookings must be within opening hours
* overlapping active bookings for the same unit are rejected
* customers can only cancel their own bookings
* admin-only actions are protected by role-based access control

Global opening hours are currently:

* Monday to Friday
* 08:00 to 22:00

## Technical Highlights

RoomFull focuses on a clean and maintainable full-stack implementation.

Key technical aspects:

* role-based authentication and authorization
* backend-side validation of business rules
* availability checks with booking conflict detection
* unit inventory management
* customer self-service booking flow
* admin dashboard for operational workflows
* PostgreSQL database with Prisma migrations
* OpenAPI documentation with Swagger UI
* production deployment with separate frontend and backend services

## Tech Stack

### Frontend

* Next.js
* TypeScript
* Tailwind CSS
* Feature-oriented project structure
* `clsx` for conditional class composition

### Backend

* Node.js
* Express
* TypeScript
* Prisma
* PostgreSQL
* OpenAPI / Swagger

### Tooling

* npm
* Node.js via `.nvmrc`
* Prisma Migrate
* Prisma Studio
* ESLint / project linting

## Architecture

RoomFull separates product-facing UI concerns from backend domain logic.

The frontend follows a pragmatic feature-oriented structure. UI, features, entities and shared code are separated to keep the application navigable as it grows.

The backend acts as the source of truth for business rules. Critical checks such as booking validity, conflicts, opening hours and permissions are enforced server-side instead of relying on frontend state.

Simplified structure:

```txt
/
  README.md
  docs/
    adr/
    architecture/
    deployment/

  backend/
    prisma/
    src/
      routes/
      controllers/
      services/
      db/
      middleware/
    docs/

  src/
    app/
    widgets/
    features/
    entities/
    shared/
```

## Local Development

### Requirements

* Node.js 24 LTS
* npm
* PostgreSQL 17

Use the Node version defined in `.nvmrc`:

```bash
nvm use
```

Check your local versions:

```bash
node -v
npm -v
```

## Frontend Setup

Install dependencies in the project root:

```bash
npm install
```

Start the frontend development server:

```bash
npm run dev
```

The application runs locally at:

```txt
http://localhost:3000
```

## Backend Setup

### 1. Install and start PostgreSQL

On macOS with Homebrew:

```bash
brew install postgresql@17
brew services start postgresql@17
```

Check whether PostgreSQL is running:

```bash
pg_isready
```

### 2. Create the local database

```bash
createdb roomfull
```

### 3. Configure backend environment

```bash
cd backend
npm install
cp .env.example .env
```

Adjust `backend/.env` so that `DATABASE_URL` matches your local PostgreSQL user.

Example:

```env
DATABASE_URL=postgresql://meikl@localhost:5432/roomfull?schema=public
```

General format:

```env
DATABASE_URL=postgresql://YOUR_LOCAL_DB_USER@localhost:5432/roomfull?schema=public
```

### 4. Apply existing migrations

```bash
cd backend
npm run prisma:migrate:deploy
```

For schema development, use:

```bash
npm run prisma:migrate:dev
```

### 5. Start the backend

```bash
npm run dev
```

Or start the backend with auto-restart during development:

```bash
npm run dev:hot
```

By default, the backend runs locally at:

```txt
http://localhost:4000
```

## Prisma Studio

To inspect local database content visually:

```bash
cd backend
npx prisma studio
```

Useful checks after setup:

* `UnitType` contains the expected room types
* demo units are available
* bookings are created with valid user and unit relations

## API Documentation

The backend exposes an OpenAPI specification and Swagger UI.

Local Swagger UI:

```txt
http://localhost:4000/docs
```

Production Swagger UI:

```txt
https://api.roomfull.michael-buschmann.dev/docs
```

When API endpoints change, implementation and OpenAPI documentation should be updated together.

## Documentation

Additional project documentation is kept in the repository:

```txt
docs/adr/
docs/architecture/
docs/deployment/

backend/docs/auth-flow.md
backend/docs/booking-flow.md
backend/docs/contact-request-flow.md
backend/docs/teams-flow.md
backend/docs/units-flow.md
```

These documents describe architectural decisions, deployment notes and selected backend flows in more detail.

## Status

RoomFull 2.0 is a portfolio project focused on demonstrating production-oriented full-stack development.

The project is intentionally scoped around a coherent booking domain rather than broad feature accumulation. The main goal is to show clean implementation of product flows, domain rules, backend validation, role handling and maintainable project structure.
