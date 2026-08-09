# Slotly

A full-stack booking and scheduling platform for local businesses —
salons, tutors, clinics, and similar service providers — who need a
simple way to manage appointments without paying for enterprise
scheduling software.

Business owners set their weekly availability and services; customers
book open slots in real time. The core challenge Slotly solves is
**conflict-free scheduling**: preventing double-bookings even when
multiple customers try to book the same slot simultaneously, while
correctly handling timezones, buffer time between appointments, and
one-off schedule exceptions (holidays, early closures).

## Live Demo

[Add your deployed Vercel URL here once deployed]

## Key Features

- Role-based dashboards for business owners and customers
- Real-time availability computation (weekly schedule + exceptions +
  existing bookings)
- Race-condition-safe booking creation using database transactions
  and unique constraints
- Email confirmations and cancellations
- Timezone-aware display across business and customer views

## Tech Stack

- **Frontend/Backend:** Next.js 15 (App Router), TypeScript, Server Actions
- **Database:** PostgreSQL, Prisma ORM
- **Auth:** NextAuth (Auth.js v5), Credentials provider
- **Email:** Resend
- **Deployment:** Vercel + Neon/Postgres.app

## Technical Highlights

- **Conflict-free booking logic:** availability slots are computed
  server-side by combining weekly availability, one-off exceptions,
  and existing bookings (with buffer time). Booking creation
  re-validates availability inside a database transaction and relies
  on a unique constraint as a final safety net against race conditions.
- **Timezone handling:** all timestamps are stored in UTC and
  converted to the business's or customer's local timezone at display
  time.

## Running Locally

1. Clone the repo and install dependencies:
```bash
   git clone https://github.com/your-username/Slotly.git
   cd Slotly
   npm install
```

2. Set up your environment variables — copy `.env.example` to `.env`
   and fill in your PostgreSQL connection string and a NextAuth secret:
```bash
   cp .env.example .env
```

3. Push the Prisma schema to your database:
```bash
   npx prisma db push
```

4. Start the dev server:
```bash
   npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)
