"use server";

import { revalidatePath } from "next/cache";
import { fromZonedTime } from "date-fns-tz";
import { auth } from "@/lib/auth";
import db from "@/lib/db";

export interface ExceptionActionState {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
}

export async function createAvailabilityExceptionAction(
  _prevState: ExceptionActionState,
  formData: FormData
): Promise<ExceptionActionState> {
  const session = await auth();

  if (!session?.user || session.user.role !== "OWNER") {
    return {
      success: false,
      message: "Unauthorized. Owner permissions required.",
    };
  }

  const business = await db.business.findFirst({
    where: { owner_id: session.user.id },
  });

  if (!business) {
    return {
      success: false,
      message: "No business found. Please register your business first.",
    };
  }

  const dateStr = formData.get("date") as string;
  const isClosedRaw = formData.get("is_closed");
  const isClosed = isClosedRaw === "true" || isClosedRaw === "on";
  const startTime = formData.get("start_time") as string;
  const endTime = formData.get("end_time") as string;

  if (!dateStr) {
    return {
      success: false,
      message: "Please select a valid date.",
    };
  }

  if (!isClosed) {
    if (!startTime || !endTime) {
      return {
        success: false,
        message: "Please provide both start time and end time for custom operating hours.",
      };
    }
    if (startTime >= endTime) {
      return {
        success: false,
        message: "Start time must be strictly earlier than end time.",
      };
    }
  }

  try {
    // Fix: Convert target date string (YYYY-MM-DD) to midnight UTC instant in the business's timezone
    const dayStartUTC = fromZonedTime(`${dateStr}T00:00:00`, business.timezone);
    const dayEndUTC = new Date(dayStartUTC.getTime() + 24 * 60 * 60 * 1000);

    const existing = await db.availabilityException.findFirst({
      where: {
        business_id: business.id,
        date: { gte: dayStartUTC, lt: dayEndUTC },
      },
    });

    if (existing) {
      await db.availabilityException.update({
        where: { id: existing.id },
        data: {
          is_closed: isClosed,
          start_time: isClosed ? null : startTime,
          end_time: isClosed ? null : endTime,
        },
      });
    } else {
      await db.availabilityException.create({
        data: {
          business_id: business.id,
          date: dayStartUTC,
          is_closed: isClosed,
          start_time: isClosed ? null : startTime,
          end_time: isClosed ? null : endTime,
        },
      });
    }

    revalidatePath("/owner/availability/exceptions");
    revalidatePath(`/${business.slug}`);

    return {
      success: true,
      message: "Availability exception saved successfully.",
    };
  } catch (error) {
    console.error("createAvailabilityExceptionAction error:", error);
    return {
      success: false,
      message: "Failed to save availability exception. Please try again.",
    };
  }
}

export async function deleteAvailabilityExceptionAction(
  formData: FormData
): Promise<ExceptionActionState> {
  const session = await auth();

  if (!session?.user || session.user.role !== "OWNER") {
    return {
      success: false,
      message: "Unauthorized. Owner permissions required.",
    };
  }

  const exceptionId = formData.get("exceptionId") as string;

  if (!exceptionId) {
    return {
      success: false,
      message: "Exception ID is required.",
    };
  }

  try {
    const exception = await db.availabilityException.findUnique({
      where: { id: exceptionId },
      include: {
        business: {
          select: { owner_id: true, slug: true },
        },
      },
    });

    if (!exception) {
      return {
        success: false,
        message: "Exception entry not found.",
      };
    }

    // Ownership Authorization Guard
    if (exception.business.owner_id !== session.user.id) {
      return {
        success: false,
        message: "Unauthorized. You can only manage exceptions for your own business.",
      };
    }

    await db.availabilityException.delete({
      where: { id: exceptionId },
    });

    revalidatePath("/owner/availability/exceptions");
    revalidatePath(`/${exception.business.slug}`);

    return {
      success: true,
      message: "Availability exception deleted successfully.",
    };
  } catch (error) {
    console.error("deleteAvailabilityExceptionAction error:", error);
    return {
      success: false,
      message: "Failed to delete availability exception.",
    };
  }
}
