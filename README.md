# Event Booking System

A Node.js + Express backend for an event booking platform using PostgreSQL and Prisma.

## Overview

This application supports two user roles:

- `ORGANIZER`: create and update events
- `CUSTOMER`: browse events and book tickets

It implements:

- JWT authentication and role-based authorization
- Event creation, listing, and updates
- Booking creation with idempotency support
- Background workers for booking confirmation and event update notification logs
- Health and readiness checks

## Live Deployment

- Live API URL: `https://booking-system.example.com`
- GitHub repository URL: `https://github.com/your-org/booking_system`

## Design Decisions

- Prisma ORM was chosen for its type-safe database access, developer ergonomics, and predictable migration workflow.
- PostgreSQL was selected for its reliability, relational integrity, and support for transactional booking logic.
- Worker threads were used for lightweight async notification processing without introducing external queue infrastructure.
- Idempotency keys were implemented to make booking creation safe against retries and duplicate client requests.
- Health and readiness endpoints were added to support runtime observability and platform readiness checks.

## Architecture

- `src/app.js` - Express application setup and route registration
- `src/server.js` - HTTP server startup and graceful shutdown
- `src/config/prisma.js` - Prisma client instance
- `src/config/logger.js` - Pino logger configuration
- `src/modules/auth` - Auth routes, controller, and service
- `src/modules/events` - Event routes, controller, and service
- `src/modules/booking` - Booking routes, controller, and service
- `src/modules/health` - Health check endpoints
- `src/workers` - Worker threads for asynchronous notification logging
- `prisma/schema.prisma` - database schema and models

## Features

- User registration and login
- JWT-based authentication
- Role-based authorization middleware
- Create and update events as an organizer
- List all events
- Create bookings as a customer
- Idempotent booking creation using `IdempotencyKey`
- CLI-friendly server start and development with `nodemon`

## Prerequisites

- Node.js 18+ (for ES modules and worker threads)
- PostgreSQL database
- `npm` installed

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Create a `.env` file in the repo root or set environment variables directly.

Required variables:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
JWT_SECRET="your_jwt_secret"
PORT=5000
```

Example:

```bash
DATABASE_URL="postgresql://booking:booking@localhost:5432/booking_db?schema=public"
JWT_SECRET="supersecret"
PORT=5000
```

### 3. Prisma database setup

Generate the Prisma client and apply migrations:

```bash
npm run prisma:generate
npm run prisma:migrate
```

If you want to run the migration command directly:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

## Run the application

Start the server:

```bash
npm run start
```

Start the server in development mode with auto-reload:

```bash
npm run dev
```

The API will be available at `http://localhost:5000` by default.

## Deployment

- Backend hosted on Render
- PostgreSQL hosted on Neon

## API Reference

### Base URL

All endpoints are mounted under `/api` except health checks.

- `GET /` - root ping endpoint
- `GET /health` - basic status check
- `GET /health/ready` - database readiness check

### Authentication

#### Register

`POST /api/auth/register`

Request body:

```json
{
  "name": "User Name",
  "email": "user@example.com",
  "password": "password123",
  "role": "CUSTOMER"
}
```

Valid roles:

- `ORGANIZER`
- `CUSTOMER`

Response:

```json
{
  "success": true,
  "data": {
    "id": "...",
    "name": "User Name",
    "email": "user@example.com",
    "role": "CUSTOMER",
    "createdAt": "..."
  }
}
```

#### Login

`POST /api/auth/login`

Request body:

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "token": "<jwt-token>",
    "user": {
      "id": "...",
      "name": "User Name",
      "email": "user@example.com",
      "role": "CUSTOMER",
      "createdAt": "..."
    }
  }
}
```

### Events

#### List events

`GET /api/events`

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "title": "Event Title",
      "description": "...",
      "totalTickets": 100,
      "availableTickets": 100,
      "price": 20.5,
      "organizerId": "...",
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

#### Create event

`POST /api/events`

Requires authentication and organizer role.

Headers:

```http
Authorization: Bearer <token>
```

Request body:

```json
{
  "title": "Example Event",
  "description": "Event description",
  "totalTickets": 100,
  "price": 49.99
}
```

The server sets `availableTickets` to the same value as `totalTickets`.

Response:

```json
{
  "success": true,
  "data": {
    "id": "...",
    "title": "Example Event",
    "description": "Event description",
    "totalTickets": 100,
    "availableTickets": 100,
    "price": 49.99,
    "organizerId": "...",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

#### Update event

`PUT /api/events/:id`

Requires authentication and organizer role.

Headers:

```http
Authorization: Bearer <token>
```

Request body can include any updatable event fields, for example:

```json
{
  "title": "Updated Title",
  "description": "New event details",
  "price": 59.99
}
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "...",
    "title": "Updated Title",
    "description": "New event details",
    "totalTickets": 100,
    "availableTickets": 90,
    "price": 59.99,
    "organizerId": "...",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

When an event is updated, the app sends notification logs for all customers who booked that event.

### Bookings

#### Create booking

`POST /api/bookings`

Requires authentication and customer role.

Headers:

```http
Authorization: Bearer <token>
Idempotency-Key: <unique-key>
```

Request body:

```json
{
  "eventId": "...",
  "quantity": 2
}
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "...",
    "quantity": 2,
    "eventId": "...",
    "customerId": "...",
    "createdAt": "..."
  }
}
```

Important notes:

- `Idempotency-Key` is required to prevent duplicate bookings.
- If the same key is reused, the original booking response is returned.
- The booking flow decreases `availableTickets` atomically using a Prisma transaction.

## Health Endpoints

- `GET /health` - returns basic service status

Example response:

```json
{
  "status": "ok"
}
```

- `GET /health/ready` - verifies database connectivity and readiness

Example response:

```json
{
  "status": "ready"
}
```

## Data Model

Defined in `prisma/schema.prisma`:

- `User`
  - `id`, `name`, `email`, `password`, `role`
  - relations: `events`, `bookings`
- `Event`
  - `id`, `title`, `description`, `totalTickets`, `availableTickets`, `price`
  - relations: `organizer`, `bookings`
- `Booking`
  - `id`, `quantity`, `eventId`, `customerId`
  - relations: `event`, `customer`
- `IdempotencyKey`
  - `key`, `response`

## Key Implementation Details

### Authentication

- Uses `jsonwebtoken` with `JWT_SECRET`
- Token payload includes `id`, `email`, and `role`
- `authenticate` middleware rejects missing or invalid bearer tokens

### Authorization

- `authorizeRoles(...)` middleware accepts permitted role names
- Protects event creation and updates for organizers only
- Protects bookings for customers only

### Graceful Shutdown

- `SIGINT` and `SIGTERM` are handled for clean process termination
- The HTTP server closes gracefully before the process exits
- Prisma disconnects cleanly to release database connections

### Booking transaction

- Booking creation executes inside `prisma.$transaction`
- Checks event existence and ticket availability
- Atomically decrements `availableTickets` inside a Prisma transaction
- Stores idempotency keys to prevent duplicate booking creation

### Workers

- `src/workers/booking.worker.js` logs booking confirmation text
- `src/workers/notification.worker.js` logs event update notifications
- `src/workers/worker.helper.js` spawns worker threads from `src/workers`

## Troubleshooting

- `Invalid token` means the JWT is missing or invalid.
- `Forbidden` means your user role cannot access that endpoint.
- `Idempotency-Key header required` means booking requests must include `Idempotency-Key`.
- If `prisma migrate` fails, verify `DATABASE_URL` and PostgreSQL connectivity.

## Future Improvements

- Expand validation coverage across all endpoints
- Return safe sanitized user objects on registration/login
- Add event date fields and filtering
- Persist worker notifications to a real email provider or queue
- Add pagination for event listing

## License

This repository is provided as a demo application and does not include a specific license.
