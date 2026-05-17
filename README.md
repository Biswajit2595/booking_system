# Event Booking System (Node.js)

This is a small Node.js Express backend for an Event Booking System demo. It supports two user roles: `organizer` and `customer`.

Features

- Register / Login with role-based JWT auth
- Organizers: create and update events
- Customers: browse events and create bookings
- Background tasks (in-memory queue): booking confirmation and event update notifications (console logs)

Run

Install dependencies:

```bash
npm install
```

Prisma / Postgres setup

1. Ensure you have a Postgres server available and set `DATABASE_URL` environment variable, for example:

```bash
export DATABASE_URL="postgresql://booking:booking@localhost:5432/booking_db?schema=public"
```

2. Generate Prisma client and run migration:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

Start server:

```bash
npm run start
```

API Endpoints

- `POST /auth/register` { name, email, password, role }
- `POST /auth/login` { email, password }
- `GET /events`
- `POST /events` (organizer, auth) { title, description, date, totalTickets, price }
- `PUT /events/:id` (organizer, auth)
- `POST /events/:eventId/book` (customer, auth) { tickets }

Background Tasks

- Booking confirmation: logs a message when a booking is created
- Event update notification: logs messages to all booked customers when an event is updated

Design Decisions

- Persistence: simple JSON file (`data.json`) via `src/db.js` to keep the project dependency-free and easy to run.
- Auth: JWT tokens with a simple secret for demo purposes.
- Background jobs: simple in-memory queue in `src/jobs.js` processed asynchronously; suitable for demo—replaceable with Redis/Bull or other job queues for production.

Recording

- Record a 2-5 minute demo showing the app, API calls, and your face (per assignment instructions).
