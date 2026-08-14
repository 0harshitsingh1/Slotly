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

## Key Features

- Role-based dashboards for business owners and customers
- Real-time availability computation (weekly schedule + exceptions + existing bookings)
- Race-condition-safe booking creation using database transactions (`Serializable` isolation level) and unique constraints
- Resend email confirmations and cancellations
- Timezone-aware display across business and customer views

## Tech Stack

- **Frontend/Backend:** Next.js 15 (App Router), TypeScript, Server Actions
- **Database:** PostgreSQL, Prisma ORM
- **Auth:** NextAuth (Auth.js v5), Credentials provider
- **Email:** Resend API
- **Deployment:** Vercel + Neon Postgres

## Environment Variables

| Variable | Description | Example / Location |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | Neon connection string with `?sslmode=require` |
| `AUTH_SECRET` / `NEXTAUTH_SECRET` | NextAuth encryption secret | Generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Canonical app domain URL | `https://slotly.vercel.app` |
| `RESEND_API_KEY` | Resend transactional email API key | `re_123456789...` |
| `EMAIL_FROM` | Verified sender email address | `Slotly <onboarding@resend.dev>` |

---

## Deployment Guide: Vercel + Neon Postgres

Follow these exact steps to connect Neon Postgres and deploy Slotly on Vercel.

### Step 1: Set Up Hosted Postgres on Neon

1. Go to [Neon.tech](https://neon.tech) and log in or create an account.
2. Click **Create Project**, name your project (e.g., `slotly-db`), and select your preferred region.
3. Once the database project is created, copy the **Pooled Connection String** from your dashboard (it looks like `postgresql://user:password@ep-cool-name-123.us-east-2.aws.neon.tech/neondb?sslmode=require`).

### Step 2: Deploy to Vercel

1. Push your latest code to your GitHub repository.
2. Go to the [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New... > Project**.
3. Import your GitHub `Slotly` repository.
4. In the **Environment Variables** section, add the following variables:
   - `DATABASE_URL` = *(Your Neon connection string from Step 1)*
   - `AUTH_SECRET` = *(Random 32-character string from `openssl rand -base64 32`)*
   - `NEXTAUTH_SECRET` = *(Same string as `AUTH_SECRET`)*
   - `NEXTAUTH_URL` = `https://<your-project-name>.vercel.app`
   - `RESEND_API_KEY` = *(Your Resend API Key)*
   - `EMAIL_FROM` = `Slotly <onboarding@resend.dev>`
5. Click **Deploy**.
   *Note: The Vercel build script automatically runs `prisma generate && prisma migrate deploy && next build` to create all database tables in Neon during build.*

### Step 3: Seed Demo Data in Production

Once deployed, populate the Neon database with demo business data:

Run the seed command locally using your production `DATABASE_URL`:

```bash
DATABASE_URL="your-neon-connection-string" npm run seed
```

This populates:
- **Demo Owner Account**: `owner@demo.com` / `password123`
- **Demo Customer Account**: `customer@demo.com` / `password123`
- **Demo Business**: `Glow & Grace Salon` (`/glow-and-grace`) with 3 active services and sample bookings.

---

## Running Locally

1. Clone the repo and install dependencies:
   ```bash
   git clone https://github.com/0harshitsingh1/Slotly.git
   cd Slotly
   npm install
   ```

2. Set up `.env` file:
   ```bash
   cp .env.example .env
   ```

3. Run migrations and seed data:
   ```bash
   npx prisma migrate dev
   npm run seed
   ```

4. Start the dev server:
   ```bash
   npm run dev
   ```

5. Open `http://localhost:3000`
