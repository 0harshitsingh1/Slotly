"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import db from "@/lib/db";
import {
  SaveWeeklyAvailabilitySchema,
  CreateExceptionSchema,
  type SaveWeeklyAvailabilityInput,
} from "@/lib/schemas/availability";

export interface AvailabilityActionState {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
}

/**
 * Server Action to save weekly recurring availability for an owner's business.
 * Replaces existing Availability rows for the business atomically inside a transaction.
 */
export async function saveWeeklyAvailabilityAction(
  input: SaveWeeklyAvailabilityInput
): Promise<AvailabilityActionState> {
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

  // Zod Validation
  const validation = SaveWeeklyAvailabilitySchema.safeParse(input);

  if (!validation.success) {
    return {
      success: false,
      message: "Invalid schedule input. Please verify operating hours.",
    };
  }

  const { schedule } = validation.data;

  try {
    await db.$transaction(async (tx) => {
      // 1. Delete all existing weekly availability rows for this business
      await tx.availability.deleteMany({
        where: { business_id: business.id },
      });

      // 2. Insert new availability rows for days marked as open
      const openDays = schedule.filter(
        (day) => day.is_open && day.start_time && day.end_time
      );

      if (openDays.length > 0) {
        await tx.availability.createMany({
          data: openDays.map((day) => ({
            business_id: business.id,
            day_of_week: day.day_of_week,
            start_time: day.start_time!,
            end_time: day.end_time!,
          })),
        });
      }
    });

    revalidatePath("/owner/availability");
    revalidatePath("/owner/availability/exceptions");
    revalidatePath(`/${business.slug}`);

    return {
      success: true,
      message: "Weekly recurring availability saved successfully!",
    };
  } catch (error) {
    console.error("saveWeeklyAvailabilityAction error:", error);
    return {
      success: false,
      message: "Failed to save weekly availability. Please try again.",
    };
  }
}

/**
 * Server Action to create or update an availability exception (holiday/closure/custom hours).
 */
export async function createAvailabilityExceptionAction(
  _prevState: AvailabilityActionState,
  formData: FormData
): Promise<AvailabilityActionState> {
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
  const isClosed = isClosedRaw === "true" || isClosedRaw === "on" || isClosedRaw === "1";
  
  // Fix Bug 2: Force start_time and end_time to null when isClosed is true
  const startTime = isClosed ? null : ((formData.get("start_time") as string) || null);
  const endTime = isClosed ? null : ((formData.get("end_time") as string) || null);

  // Zod Validation
  const validation = CreateExceptionSchema.safeParse({
    date: dateStr,
    is_closed: isClosed,
    start_time: startTime,
    end_time: endTime,
  });

  if (!validation.success) {
    const errorMsg =
      validation.error.issues[0]?.message || "Invalid exception parameters.";
    return {
      success: false,
      message: errorMsg,
    };
  }

  try {
    // Fix Bug 1: Store calendar date as explicit UTC midnight instant (YYYY-MM-DDT00:00:00.000Z)
    // This prevents timezone conversions from shifting the calendar date forward/backward by a day.
    const dayStartUTC = new Date(`${dateStr}T00:00:00.000Z`);
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
          date: dayStartUTC,
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

    revalidatePath("/owner/availability");
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

/**
 * Server Action to delete an availability exception.
 */
export async function deleteAvailabilityExceptionAction(
  formData: FormData
): Promise<AvailabilityActionState> {
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

    revalidatePath("/owner/availability");
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
