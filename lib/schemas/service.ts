import { z } from "zod";

const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i;

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
  gst_number: z
    .string()
    .trim()
    .transform((val) => val.toUpperCase())
    .refine((val) => val === "" || gstRegex.test(val), {
      message: "Invalid GSTIN format. Expected 15 characters, e.g. 22AAAAA0000A1Z5.",
    })
    .optional(),
});

export const UpdateServiceSchema = CreateServiceSchema.extend({
  id: z.string().min(1, "Service ID is required."),
});

export type CreateServiceInput = z.infer<typeof CreateServiceSchema>;
export type UpdateServiceInput = z.infer<typeof UpdateServiceSchema>;
