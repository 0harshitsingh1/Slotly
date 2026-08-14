import { z } from "zod";

export const TimeStringSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Time must be in HH:mm format.");

export const DayAvailabilitySchema = z
  .object({
    day_of_week: z.number().int().min(0).max(6),
    is_open: z.boolean(),
    start_time: z.string().optional().nullable(),
    end_time: z.string().optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.is_open) {
        if (!data.start_time || !data.end_time) return false;
        return data.start_time < data.end_time;
      }
      return true;
    },
    {
      message: "Start time must be strictly earlier than end time for open days.",
      path: ["end_time"],
    }
  );

export const SaveWeeklyAvailabilitySchema = z.object({
  schedule: z.array(DayAvailabilitySchema),
});

export type SaveWeeklyAvailabilityInput = z.infer<
  typeof SaveWeeklyAvailabilitySchema
>;

export const CreateExceptionSchema = z
  .object({
    date: z.string().min(1, "Date is required."),
    is_closed: z.boolean(),
    start_time: z.string().optional().nullable(),
    end_time: z.string().optional().nullable(),
  })
  .refine(
    (data) => {
      if (!data.is_closed) {
        if (!data.start_time || !data.end_time) return false;
        return data.start_time < data.end_time;
      }
      return true;
    },
    {
      message: "Start time must be strictly earlier than end time for custom hours.",
      path: ["end_time"],
    }
  );

export type CreateExceptionInput = z.infer<typeof CreateExceptionSchema>;
