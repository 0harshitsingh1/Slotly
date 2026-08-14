# Slotly

Slotly is a full-stack appointment scheduling platform built for service providers — such as salons, tutors, clinics, and freelancers — who need an intuitive, self-hosted way to offer online booking without paying for enterprise scheduling software. It solves the complex problem of **conflict-free real-time scheduling** by dynamically computing available time slots based on weekly operating hours, custom holiday exceptions, appointment durations, and required buffer gaps. By wrapping availability checks and reservation inserts in `Serializable` database transactions and enforcing database-level unique constraints, Slotly guarantees zero double-bookings even when multiple customers attempt to book the exact same slot at the exact same millisecond.

## 🚀 Live Demo

[View Live Demo](https://slotly-demo.vercel.app) *(Link placeholder — replace with your Vercel deployment URL)*

---

## 🛠️ Tech Stack

- **Framework & Logic:** Next.js 15 (App Router), TypeScript, Server Actions, React 19
- **Styling:** Vanilla CSS & Tailwind CSS
- **Database & ORM:** PostgreSQL, Prisma ORM
- **Authentication:** NextAuth (Auth.js v5), Credentials Provider, `bcryptjs`
- **Email Notifications:** Resend API
- **Testing & Deployment:** Vitest, Vercel, Neon Serverless Postgres

---

## ⚡ Technical Highlights

Slotly specifically addresses two of the hardest engineering challenges in appointment scheduling software:

### 1. Conflict-Free Booking Logic & Concurrency Control
- **Dynamic Slot Generation:** The slot engine steps through business operating windows in increments of service duration, testing candidate intervals `[candidateStart, candidateEnd)` against buffered existing bookings `[bookingStart - buffer, bookingEnd + buffer)`. Two intervals overlap if and only if `candidateStart < bufferedEnd && candidateEnd > bufferedStart`.
- **Race Condition Prevention:** To prevent double-booking when two concurrent requests hit the server simultaneously:
  1. Availability is re-validated server-side **inside a `Serializable` database transaction**.
  2. If two requests slip past the availability check concurrently, PostgreSQL enforces a composite unique constraint (`@@unique([business_id, start_at])`). The second insert immediately fails with error code `P2002`, returning a graceful *"This slot was just taken"* message to the user.

### 2. Timezone-Aware Computation & DST Handling
- **UTC Database Storage:** All DateTime values (`start_at`, `end_at`, `date`) are stored strictly in UTC in PostgreSQL.
- **DST-Safe Slot Calculation:** Local operating hours (`"09:00" - "17:00"`) are converted to UTC relative to the business's timezone using `date-fns-tz`. The engine calculates local day boundaries by adding wall-clock days before converting to UTC, properly handling 23-hour and 25-hour days during Daylight Saving Time (DST) spring-forward and fall-back transitions.
- **Context-Specific Display**:
  - **Public Booking Page & Owner Dashboard:** Converted to the **business's stored timezone** (`business.timezone`) so local operating hours remain fixed and accurate.
  - **Customer Dashboard:** Dynamically converted on the client side to the **customer's local browser timezone** (`Intl.DateTimeFormat().resolvedOptions().timeZone`) so cross-timezone clients see appointments in their local wall-clock time.

---

## 💻 Setup Instructions (Run Locally)

### Prerequisites
- Node.js 20+ installed
- PostgreSQL database running locally or hosted (e.g. Neon, Supabase, Docker)

### 1. Clone the Repository
```bash
git clone https://github.com/0harshitsingh1/Slotly.git
cd Slotly
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Open `.env` and fill in your connection string and secrets:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/slotly?schema=public"
AUTH_SECRET="your-32-character-secret"
NEXTAUTH_SECRET="your-32-character-secret"
NEXTAUTH_URL="http://localhost:3000"
RESEND_API_KEY="re_your_resend_key"
EMAIL_FROM="Slotly <onboarding@resend.dev>"
```

### 4. Run Database Migrations
```bash
npx prisma migrate dev
```

### 5. Seed Demo Data
Populate the database with a sample business (`Glow & Grace Salon`), services, weekly hours, and demo user accounts:
```bash
npm run seed
```

**Demo Credentials Created:**
- **Owner Account:** `owner@demo.com` / `password123`
- **Customer Account:** `customer@demo.com` / `password123`
- **Public Booking URL:** `http://localhost:3000/glow-and-grace`

### 6. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 7. Run Unit Tests
```bash
npx vitest run
```
