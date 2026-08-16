"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { getAvailableSlots } from "@/lib/slots/getAvailableSlots";
import {
  sendBookingConfirmationEmail,
  sendBookingCancellationEmail,
} from "@/lib/email";

export interface CreateBookingInput {
  businessId: string;
  serviceId: string;
  customerId: string;
  startAt: string | Date;
}

export interface BookingActionResult {
  success: boolean;
  bookingId?: string;
  message?: string;
}

/**
 * Helper to format booking start time in business timezone
 */
function formatTimeInTimezone(date: Date, timezone: string): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: timezone,
    }).format(new Date(date));
  } catch {
    return new Date(date).toLocaleString();
  }
}

/**
 * Server Action to create a booking with concurrency control.
 */
export async function createBookingAction(
  input: CreateBookingInput
): Promise<BookingActionResult> {
  const { businessId, serviceId, customerId, startAt } = input;

  if (!businessId || !serviceId || !customerId || !startAt) {
    return {
      success: false,
      message: "Missing required booking details.",
    };
  }

  const requestedStartAt = new Date(startAt);
  if (isNaN(requestedStartAt.getTime())) {
    return {
      success: false,
      message: "Invalid slot start time.",
    };
  }

  try {
    const booking = await db.$transaction(
      async (tx) => {
        // 1. Re-validate slot availability within the transaction
        const { slots: availableSlots } = await getAvailableSlots(
          businessId,
          serviceId,
          requestedStartAt,
          tx
        );

        const isSlotAvailable = availableSlots.some(
          (slot) => slot.startAt.getTime() === requestedStartAt.getTime()
        );

        if (!isSlotAvailable) {
          throw new Error("SLOT_UNAVAILABLE");
        }

        // 2. Fetch service to calculate end_at
        const service = await tx.service.findUnique({
          where: { id: serviceId },
          select: { duration_minutes: true },
        });

        if (!service) {
          throw new Error("SERVICE_NOT_FOUND");
        }

        const requestedEndAt = new Date(
          requestedStartAt.getTime() + service.duration_minutes * 60 * 1000
        );

        // 3. Insert booking with CONFIRMED status
        const newBooking = await tx.booking.create({
          data: {
            business_id: businessId,
            service_id: serviceId,
            customer_id: customerId,
            start_at: requestedStartAt,
            end_at: requestedEndAt,
            status: "CONFIRMED",
          },
        });

        return newBooking;
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      }
    );

    // Fetch details for email notification (outside transaction)
    const bookingDetails = await db.booking.findUnique({
      where: { id: booking.id },
      include: {
        customer: { select: { email: true, name: true } },
        business: { select: { name: true, slug: true, timezone: true } },
        service: { select: { name: true, price: true } },
      },
    });

    if (bookingDetails) {
      const formattedTime = formatTimeInTimezone(
        bookingDetails.start_at,
        bookingDetails.business.timezone
      );

      // Trigger Resend Confirmation Email (non-blocking try/catch)
      sendBookingConfirmationEmail({
        bookingId: bookingDetails.id,
        customerEmail: bookingDetails.customer.email,
        customerName: bookingDetails.customer.name,
        businessName: bookingDetails.business.name,
        businessSlug: bookingDetails.business.slug,
        serviceName: bookingDetails.service.name,
        formattedTime,
        price: bookingDetails.service.price,
      }).catch((err) =>
        console.error("Error sending booking confirmation email:", err)
      );
    }

    return {
      success: true,
      bookingId: booking.id,
      message: "Booking confirmed successfully!",
    };
  } catch (error: any) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        success: false,
        message: "This slot was just taken by another user. Please choose another time.",
      };
    }

    if (error.message === "SLOT_UNAVAILABLE") {
      return {
        success: false,
        message: "This slot is no longer available. Please choose another time.",
      };
    }

    if (error.message === "SERVICE_NOT_FOUND") {
      return {
        success: false,
        message: "The requested service could not be found.",
      };
    }

    console.error("createBookingAction error:", error);
    return {
      success: false,
      message: "An unexpected error occurred while processing your booking. Please try again.",
    };
  }
}

/**
 * Server Action for an owner to cancel a booking.
 * Strictly verifies that the authenticated user owns the business associated with the booking.
 */
export async function cancelOwnerBookingAction(
  formData: FormData
): Promise<BookingActionResult> {
  const session = await auth();

  if (!session?.user || session.user.role !== "OWNER") {
    return {
      success: false,
      message: "Unauthorized. Owner permissions required.",
    };
  }

  const bookingId = formData.get("bookingId") as string;

  if (!bookingId) {
    return {
      success: false,
      message: "Booking ID is required.",
    };
  }

  try {
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: {
        customer: { select: { email: true, name: true } },
        business: { select: { owner_id: true, name: true, slug: true, timezone: true } },
        service: { select: { name: true, price: true } },
      },
    });

    if (!booking) {
      return {
        success: false,
        message: "Booking not found.",
      };
    }

    // Authorization Guard: Guarantee that only the business owner can cancel their own bookings!
    if (booking.business.owner_id !== session.user.id) {
      return {
        success: false,
        message: "Unauthorized. You can only cancel bookings for your own business.",
      };
    }

    if (booking.status === "CANCELLED") {
      return {
        success: false,
        message: "This booking is already cancelled.",
      };
    }

    await db.booking.update({
      where: { id: bookingId },
      data: { status: "CANCELLED" },
    });

    const formattedTime = formatTimeInTimezone(
      booking.start_at,
      booking.business.timezone
    );

    // Trigger Resend Cancellation Email (non-blocking try/catch)
    sendBookingCancellationEmail({
      bookingId: booking.id,
      customerEmail: booking.customer.email,
      customerName: booking.customer.name,
      businessName: booking.business.name,
      businessSlug: booking.business.slug,
      serviceName: booking.service.name,
      formattedTime,
      price: booking.service.price,
    }).catch((err) =>
      console.error("Error sending booking cancellation email:", err)
    );

    revalidatePath("/owner/bookings");

    return {
      success: true,
      message: "Booking cancelled successfully.",
    };
  } catch (error) {
    console.error("cancelOwnerBookingAction error:", error);
    return {
      success: false,
      message: "Failed to cancel booking. Please try again.",
    };
  }
}

/**
 * Server Action for a customer to cancel their own booking.
 * Only allowed if:
 * 1. User is authenticated.
 * 2. User is the owner of the booking (booking.customer_id === session.user.id).
 * 3. Booking status is currently PENDING or CONFIRMED.
 */
export async function cancelCustomerBookingAction(
  formData: FormData
): Promise<BookingActionResult> {
  const session = await auth();

  if (!session?.user) {
    return {
      success: false,
      message: "Unauthorized. Please log in to perform this action.",
    };
  }

  const bookingId = formData.get("bookingId") as string;

  if (!bookingId) {
    return {
      success: false,
      message: "Booking ID is required.",
    };
  }

  try {
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: {
        customer: { select: { email: true, name: true } },
        business: { select: { name: true, slug: true, timezone: true } },
        service: { select: { name: true, price: true } },
      },
    });

    if (!booking) {
      return {
        success: false,
        message: "Booking not found.",
      };
    }

    // Ownership Check: Customer can only cancel their own booking!
    if (booking.customer_id !== session.user.id) {
      return {
        success: false,
        message: "Unauthorized. You can only cancel your own bookings.",
      };
    }

    // Status Check: Only PENDING or CONFIRMED bookings can be cancelled!
    if (booking.status !== "PENDING" && booking.status !== "CONFIRMED") {
      return {
        success: false,
        message: `Cannot cancel a booking that is currently ${booking.status.toLowerCase()}. Only PENDING or CONFIRMED bookings can be cancelled.`,
      };
    }

    await db.booking.update({
      where: { id: bookingId },
      data: { status: "CANCELLED" },
    });

    const formattedTime = formatTimeInTimezone(
      booking.start_at,
      booking.business.timezone
    );

    // Trigger Resend Cancellation Email (non-blocking try/catch)
    sendBookingCancellationEmail({
      bookingId: booking.id,
      customerEmail: booking.customer.email,
      customerName: booking.customer.name,
      businessName: booking.business.name,
      businessSlug: booking.business.slug,
      serviceName: booking.service.name,
      formattedTime,
      price: booking.service.price,
    }).catch((err) =>
      console.error("Error sending booking cancellation email:", err)
    );

    revalidatePath("/customer/bookings");
    revalidatePath("/customer");

    return {
      success: true,
      message: "Your booking has been cancelled successfully.",
    };
  } catch (error) {
    console.error("cancelCustomerBookingAction error:", error);
    return {
      success: false,
      message: "Failed to cancel booking. Please try again.",
    };
  }
}
