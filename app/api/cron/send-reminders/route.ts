import { NextResponse } from "next/server";
import db from "@/lib/db";

// Fallback utility since formatTimeInTimezone is used elsewhere
function formatTimeInTimezone(isoString: string | Date, timezone: string): string {
  try {
    const d = typeof isoString === "string" ? new Date(isoString) : isoString;
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: timezone,
    }).format(d);
  } catch {
    const d = typeof isoString === "string" ? new Date(isoString) : isoString;
    return d.toLocaleString();
  }
}

export async function GET(request: Request) {
  try {
    // 1. Verify Vercel Cron Authentication
    // Vercel Cron sends a secret header. We must verify it to prevent unauthorized triggering.
    const authHeader = request.headers.get("authorization");
    if (
      process.env.CRON_SECRET &&
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    
    // 2. Define the 1-hour rolling window: 24 to 25 hours from now
    // E.g., if now is 10:00 AM, we look for bookings between 10:00 AM and 11:00 AM tomorrow.
    const windowStart = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now
    const windowEnd = new Date(now.getTime() + 25 * 60 * 60 * 1000);   // 25 hours from now

    // 3. Find matching bookings
    const bookings = await db.booking.findMany({
      where: {
        status: "CONFIRMED",
        reminder_sent: false,
        start_at: {
          gte: windowStart,
          lt: windowEnd,
        },
      },
      include: {
        customer: { select: { email: true, name: true } },
        business: { select: { name: true, slug: true, timezone: true } },
        service: { select: { name: true, price: true } },
      },
    });

    if (bookings.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No upcoming bookings found requiring a reminder.",
        count: 0,
      });
    }

    // Load email function dynamically to avoid heavy imports if not needed
    const { sendBookingReminderEmail } = await import("@/lib/email");

    let successCount = 0;
    let failureCount = 0;

    // 4. Process each booking concurrently but safely
    const emailPromises = bookings.map(async (booking) => {
      try {
        const formattedTime = formatTimeInTimezone(
          booking.start_at,
          booking.business.timezone
        );

        const emailResult = await sendBookingReminderEmail({
          bookingId: booking.id,
          customerEmail: booking.customer.email,
          customerName: booking.customer.name,
          businessName: booking.business.name,
          businessSlug: booking.business.slug,
          serviceName: booking.service.name,
          formattedTime,
          price: booking.service.price,
        });

        if (!emailResult.success) {
          throw new Error(JSON.stringify(emailResult.error));
        }

        // Mark as sent in the database immediately after successful send
        await db.booking.update({
          where: { id: booking.id },
          data: { reminder_sent: true },
        });

        successCount++;
      } catch (err) {
        console.error(`Failed to send reminder for booking ${booking.id}:`, err);
        failureCount++;
      }
    });

    await Promise.allSettled(emailPromises);

    return NextResponse.json({
      success: true,
      message: `Processed ${bookings.length} reminders.`,
      successCount,
      failureCount,
    });
  } catch (error) {
    console.error("Cron Error (send-reminders):", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
