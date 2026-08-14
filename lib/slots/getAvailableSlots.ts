import { addMinutes, addDays, startOfDay, setHours, setMinutes } from "date-fns";
import { toZonedTime, fromZonedTime } from "date-fns-tz";
import db from "../db";

export interface TimeSlot {
  startAt: Date;
  endAt: Date;
}

export interface ExistingBooking {
  start_at: Date;
  end_at: Date;
}

export interface AvailabilityWindow {
  start_time: string;
  end_time: string;
}

export interface AvailabilityExceptionData {
  is_closed: boolean;
  start_time: string | null;
  end_time: string | null;
}

export function parseLocalTime(
  hhmm: string,
  baseDate: Date,
  timezone: string,
): Date {
  const [h, m] = hhmm.split(":").map(Number);
  let local = setHours(baseDate, h);
  local = setMinutes(local, m);
  return fromZonedTime(local, timezone);
}

export function computeAvailableSlots(
  date: Date,
  timezone: string,
  weeklyWindows: AvailabilityWindow[],
  exception: AvailabilityExceptionData | null,
  durationMinutes: number,
  bufferMinutes: number,
  existingBookings: ExistingBooking[],
): TimeSlot[] {
  if (exception?.is_closed) {
    return [];
  }

  let windows: AvailabilityWindow[];

  if (exception && exception.start_time && exception.end_time) {
    windows = [
      { start_time: exception.start_time, end_time: exception.end_time },
    ];
  } else if (weeklyWindows.length > 0) {
    windows = weeklyWindows;
  } else {
    return [];
  }

  const zonedMidnight = startOfDay(toZonedTime(date, timezone));

  const slots: TimeSlot[] = [];

  for (const window of windows) {
    const windowOpenUTC = parseLocalTime(window.start_time, zonedMidnight, timezone);
    const windowCloseUTC = parseLocalTime(window.end_time, zonedMidnight, timezone);

    let cursor = windowOpenUTC;

    while (true) {
      const candidateStart = cursor;
      const candidateEnd = addMinutes(candidateStart, durationMinutes);

      if (candidateEnd > windowCloseUTC) break;

      const hasConflict = existingBookings.some((booking) => {
        const bufferedBookingStart = addMinutes(booking.start_at, -bufferMinutes);
        const bufferedBookingEnd = addMinutes(booking.end_at, bufferMinutes);

        return (
          candidateStart < bufferedBookingEnd &&
          candidateEnd > bufferedBookingStart
        );
      });

      if (!hasConflict) {
        slots.push({ startAt: candidateStart, endAt: candidateEnd });
      }

      cursor = addMinutes(cursor, durationMinutes);
    }
  }

  return slots;
}

export async function getAvailableSlots(
  businessId: string,
  serviceId: string,
  date: Date,
  prismaClient: any = db
): Promise<TimeSlot[]> {
  const business = await prismaClient.business.findUnique({
    where: { id: businessId },
    select: { timezone: true },
  });

  if (!business) return [];

  const zonedDate = toZonedTime(date, business.timezone);
  const dayOfWeek = zonedDate.getDay();

  const weeklyWindows = await prismaClient.availability.findMany({
    where: { business_id: businessId, day_of_week: dayOfWeek },
    select: { start_time: true, end_time: true },
  });

  // Calculate dayStartUTC and dayEndUTC in the business's timezone safely handling DST days (23h/25h)
  const dayStart = startOfDay(zonedDate);
  const dayStartUTC = fromZonedTime(dayStart, business.timezone);
  const dayEndZoned = addDays(dayStart, 1);
  const dayEndUTC = fromZonedTime(dayEndZoned, business.timezone);

  const exception = await prismaClient.availabilityException.findFirst({
    where: {
      business_id: businessId,
      date: { gte: dayStartUTC, lt: dayEndUTC },
    },
    select: { is_closed: true, start_time: true, end_time: true },
  });

  const service = await prismaClient.service.findUnique({
    where: { id: serviceId },
    select: { duration_minutes: true, buffer_minutes: true },
  });

  if (!service) return [];

  // Fix: Fetch ALL confirmed bookings that overlap with the day window [dayStartUTC, dayEndUTC)
  const existingBookings = await prismaClient.booking.findMany({
    where: {
      business_id: businessId,
      status: "CONFIRMED",
      start_at: { lt: dayEndUTC },
      end_at: { gt: dayStartUTC },
    },
    select: { start_at: true, end_at: true },
  });

  return computeAvailableSlots(
    date,
    business.timezone,
    weeklyWindows,
    exception,
    service.duration_minutes,
    service.buffer_minutes,
    existingBookings,
  );
}
