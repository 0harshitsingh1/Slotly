import { z } from "zod";

export const CreateServiceSchema = z.object({
  name: z
    .string()
    .min(1, "Service name is required.")
    .max(100, "Service name must be 100 characters or less.")
    .trim(),
  duration_minutes: z.coerce
    .number("Duration must be a number.")
    .int("Duration must be a whole number.")
    .min(5, "Duration must be at least 5 minutes."),
  price: z.coerce
    .number("Price must be a number.")
    .min(0, "Price cannot be negative."),
  buffer_minutes: z.coerce
    .number("Buffer time must be a number.")
    .int("Buffer time must be a whole number.")
    .min(0, "Buffer time cannot be negative.")
    .default(0),
});

export type CreateServiceInput = z.infer<typeof CreateServiceSchema>;
