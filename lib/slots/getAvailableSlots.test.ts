import { describe, it, expect } from "vitest";
import {
  computeAvailableSlots,
  getAvailableSlots,
  parseLocalTime,
  type AvailabilityWindow,
  type AvailabilityExceptionData,
  type ExistingBooking,
} from "./getAvailableSlots";
import { startOfDay } from "date-fns";
import { toZonedTime } from "date-fns-tz";

const TZ = "America/New_York";

function utc(hhmm: string): Date {
  const baseDate = new Date("2025-03-10T00:00:00Z");
  const zonedMidnight = startOfDay(toZonedTime(baseDate, TZ));
  return parseLocalTime(hhmm, zonedMidnight, TZ);
}

const TEST_DATE = new Date("2025-03-10T00:00:00Z");

const NINE_TO_FIVE: AvailabilityWindow[] = [
  { start_time: "09:00", end_time: "17:00" },
];

describe("computeAvailableSlots", () => {
  it("returns all slots when there are no existing bookings", () => {
    const result = computeAvailableSlots(
      TEST_DATE,
      TZ,
      NINE_TO_FIVE,
      null,
      60,
      0,
      [],
    );

    expect(result.isClosed).toBe(false);
    expect(result.slots).toHaveLength(8);
    expect(result.slots[0].startAt).toEqual(utc("09:00"));
    expect(result.slots[0].endAt).toEqual(utc("10:00"));
    expect(result.slots[7].startAt).toEqual(utc("16:00"));
    expect(result.slots[7].endAt).toEqual(utc("17:00"));
  });

  it("excludes the slot occupied by a mid-day booking", () => {
    const bookings: ExistingBooking[] = [
      { start_at: utc("12:00"), end_at: utc("13:00") },
    ];

    const result = computeAvailableSlots(
      TEST_DATE,
      TZ,
      NINE_TO_FIVE,
      null,
      60,
      0,
      bookings,
    );

    expect(result.isClosed).toBe(false);
    expect(result.slots).toHaveLength(7);
    const starts = result.slots.map((s) => s.startAt.getTime());
    expect(starts).not.toContain(utc("12:00").getTime());
    expect(starts).toContain(utc("11:00").getTime());
    expect(starts).toContain(utc("13:00").getTime());
  });

  it("respects buffer_minutes before and after existing bookings", () => {
    const bookings: ExistingBooking[] = [
      { start_at: utc("12:00"), end_at: utc("13:00") },
    ];

    const result = computeAvailableSlots(
      TEST_DATE,
      TZ,
      NINE_TO_FIVE,
      null,
      30,
      15,
      bookings,
    );

    expect(result.isClosed).toBe(false);
    const starts = result.slots.map((s) => s.startAt.getTime());

    expect(starts).toContain(utc("11:00").getTime());
    expect(starts).toContain(utc("13:30").getTime());
    expect(starts).not.toContain(utc("11:30").getTime());
    expect(starts).not.toContain(utc("12:00").getTime());
    expect(starts).not.toContain(utc("12:30").getTime());
    expect(starts).not.toContain(utc("13:00").getTime());
  });

  it("returns isClosed: true and an empty array when the day is marked as closed by an exception", () => {
    const exception: AvailabilityExceptionData = {
      is_closed: true,
      start_time: null,
      end_time: null,
    };

    const result = computeAvailableSlots(
      TEST_DATE,
      TZ,
      NINE_TO_FIVE,
      exception,
      60,
      0,
      [],
    );

    expect(result.isClosed).toBe(true);
    expect(result.slots).toEqual([]);
  });

  it("returns isClosed: true and an empty array when no weekly windows exist", () => {
    const result = computeAvailableSlots(
      TEST_DATE,
      TZ,
      [],
      null,
      60,
      0,
      [],
    );

    expect(result.isClosed).toBe(true);
    expect(result.slots).toEqual([]);
  });

  it("returns isClosed: false and an empty array when the business is open but fully booked", () => {
    // 09:00 - 10:00 (1-hour window) with a 60-min booking covering 09:00-10:00
    const bookings: ExistingBooking[] = [
      { start_at: utc("09:00"), end_at: utc("10:00") },
    ];

    const result = computeAvailableSlots(
      TEST_DATE,
      TZ,
      [{ start_time: "09:00", end_time: "10:00" }],
      null,
      60,
      0,
      bookings,
    );

    expect(result.isClosed).toBe(false);
    expect(result.slots).toEqual([]);
  });

  it("uses override hours from an exception instead of weekly windows", () => {
    const exception: AvailabilityExceptionData = {
      is_closed: false,
      start_time: "10:00",
      end_time: "14:00",
    };

    const result = computeAvailableSlots(
      TEST_DATE,
      TZ,
      NINE_TO_FIVE,
      exception,
      60,
      0,
      [],
    );

    expect(result.isClosed).toBe(false);
    expect(result.slots).toHaveLength(4);
    expect(result.slots[0].startAt).toEqual(utc("10:00"));
    expect(result.slots[3].endAt).toEqual(utc("14:00"));
  });

  it("handles multiple bookings correctly", () => {
    const bookings: ExistingBooking[] = [
      { start_at: utc("09:00"), end_at: utc("10:00") },
      { start_at: utc("14:00"), end_at: utc("15:00") },
    ];

    const result = computeAvailableSlots(
      TEST_DATE,
      TZ,
      NINE_TO_FIVE,
      null,
      60,
      0,
      bookings,
    );

    expect(result.isClosed).toBe(false);
    expect(result.slots).toHaveLength(6);
    const starts = result.slots.map((s) => s.startAt.getTime());

    expect(starts).not.toContain(utc("09:00").getTime());
    expect(starts).not.toContain(utc("14:00").getTime());
    expect(starts).toContain(utc("10:00").getTime());
    expect(starts).toContain(utc("13:00").getTime());
    expect(starts).toContain(utc("15:00").getTime());
  });

  it("allows a slot that starts exactly when a buffered booking ends", () => {
    const bookings: ExistingBooking[] = [
      { start_at: utc("12:00"), end_at: utc("13:00") },
    ];

    const result = computeAvailableSlots(
      TEST_DATE,
      TZ,
      [{ start_time: "13:30", end_time: "14:30" }],
      null,
      60,
      30,
      bookings,
    );

    expect(result.isClosed).toBe(false);
    expect(result.slots).toHaveLength(1);
    expect(result.slots[0].startAt).toEqual(utc("13:30"));
  });
});

describe("getAvailableSlots integration with DB mock", () => {
  it("queries availabilityException and overrides weekly windows with custom start/end times", async () => {
    const mockPrisma = {
      business: {
        findUnique: async () => ({ timezone: "America/New_York" }),
      },
      availability: {
        findMany: async () => [{ start_time: "09:00", end_time: "17:00" }],
      },
      availabilityException: {
        findFirst: async () => ({
          is_closed: false,
          start_time: "11:00",
          end_time: "15:00",
        }),
      },
      service: {
        findUnique: async () => ({ duration_minutes: 60, buffer_minutes: 0 }),
      },
      booking: {
        findMany: async () => [],
      },
    };

    const { slots, isClosed } = await getAvailableSlots(
      "biz_123",
      "srv_123",
      new Date("2025-03-10T12:00:00Z"),
      mockPrisma as any
    );

    expect(isClosed).toBe(false);
    expect(slots).toHaveLength(4);
    expect(slots[0].startAt.toISOString()).toBe("2025-03-10T15:00:00.000Z");
    expect(slots[3].endAt.toISOString()).toBe("2025-03-10T19:00:00.000Z");
  });
});

describe("parseLocalTime", () => {
  it("converts HH:mm in a timezone to a UTC Date on the given base date", () => {
    const base = startOfDay(toZonedTime(new Date("2025-03-10T00:00:00Z"), TZ));
    const result = parseLocalTime("09:00", base, TZ);

    expect(result.getUTCHours()).toBe(13);
    expect(result.getUTCMinutes()).toBe(0);
  });
});
