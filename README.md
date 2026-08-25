# Slotly

A full-stack appointment booking platform for local service businesses
— salons, tutors, clinics, and similar providers — who need a simple,
reliable way to manage appointments without paying for enterprise
scheduling software.

Business owners set their weekly availability and services; customers
discover businesses and book open slots in real time. The core
challenge Slotly solves is **conflict-free scheduling**: preventing
double-bookings even when multiple customers try to book the same
slot simultaneously, while correctly handling buffer time between
appointments and one-off schedule exceptions.

## Live Demo

**[slotly-sand.vercel.app](https://slotly-sand.vercel.app)**

> Note: the free-tier database may take a few seconds to "wake up" on
> the first request after a period of inactivity.

## Key Features

**For customers**
- Browse a directory of businesses with photos, descriptions, and
  services offered
- Real-time availability computed from weekly hours, one-off
  exceptions, and existing bookings
- Race-condition-safe booking — if two customers try to book the same
  slot simultaneously, only one succeeds; the other is cleanly
  rejected with no double-booking
- Email confirmations and cancellation notices
- Self-service password reset

**For business owners**
- Owner dashboard with revenue, booking counts, and an analytics
  chart of bookings over time
- Manage business details, address, and a photo gallery
- Define services with duration, price, buffer time, and optional GST
  number
- Set recurring weekly availability and one-off exceptions (holidays,
  custom hours)
- View and cancel customer bookings, with automatic email
  notifications on cancellation
- Role-scoped navigation — owners manage their business and cannot
  browse or book as a customer

## Tech Stack

- **Frontend/Backend:** Next.js (App Router), TypeScript, Server
  Actions
- **Database:** PostgreSQL (Neon), Prisma ORM
- **Auth:** NextAuth (Auth.js v5), Credentials provider, password
  reset via emailed tokens
- **Email:** Brevo (transactional email API)
- **File storage:** Vercel Blob (business photo uploads)
- **Charts:** Recharts (owner analytics)
- **Icons:** lucide-react
- **Deployment:** Vercel + Neon

## Technical Highlights

- **Conflict-free booking logic:** availability slots are computed
  server-side by combining weekly availability, one-off exceptions,
  and existing bookings (including buffer time on both sides of each
  booking). Booking creation re-validates availability inside a
  database transaction and relies on a unique constraint as a final
  safety net against race conditions — verified under real concurrent
  load by firing simultaneous booking requests for the same slot.
- **Timezone handling:** all timestamps are stored in UTC and
  converted to the relevant local timezone at display time.
- **Role-based access control:** owner and customer accounts have
  distinct dashboards, navigation, and route-level restrictions
  enforced via middleware, not just hidden UI.

## Running Locally

1. Clone the repo and install dependencies:
   ```bash
   git clone https://github.com/0harshitsingh1/Slotly.git
   cd Slotly
   npm install
   ```

2. Set up your environment variables — copy `.env.example` to `.env`
   and fill in the required values:
   ```bash
   cp .env.example .env
   ```
   You'll need:
   - `DATABASE_URL` — a PostgreSQL connection string (local or hosted)
   - `NEXTAUTH_SECRET` — generate with `openssl rand -base64 32`
   - `NEXTAUTH_URL` — `http://localhost:3000` for local development
   - `BREVO_API_KEY` / `BREVO_SENDER_EMAIL` — for transactional email
     (free tier at [brevo.com](https://www.brevo.com))
   - `BLOB_READ_WRITE_TOKEN` — for photo uploads (free Vercel Blob
     store)

3. Push the Prisma schema to your database:
   ```bash
   npx prisma migrate dev
   ```

4. Start the dev server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## Deployment

Deployed on Vercel with a Neon PostgreSQL production database.
Migrations are applied automatically as part of the build step
(`prisma migrate deploy`). See `.env.example` for the full list of
environment variables required in production.