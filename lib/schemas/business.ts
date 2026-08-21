import { z } from "zod";

// Curated list of common IANA timezone identifiers
export const TIMEZONES = [
  "UTC",
  // Americas
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Anchorage",
  "America/Honolulu",
  "America/Phoenix",
  "America/Toronto",
  "America/Vancouver",
  "America/Mexico_City",
  "America/Bogota",
  "America/Lima",
  "America/Santiago",
  "America/Sao_Paulo",
  "America/Argentina/Buenos_Aires",
  "America/Caracas",
  // Europe
  "Europe/London",
  "Europe/Dublin",
  "Europe/Lisbon",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Madrid",
  "Europe/Rome",
  "Europe/Amsterdam",
  "Europe/Brussels",
  "Europe/Zurich",
  "Europe/Vienna",
  "Europe/Warsaw",
  "Europe/Prague",
  "Europe/Budapest",
  "Europe/Bucharest",
  "Europe/Athens",
  "Europe/Helsinki",
  "Europe/Stockholm",
  "Europe/Oslo",
  "Europe/Copenhagen",
  "Europe/Moscow",
  "Europe/Istanbul",
  // Africa
  "Africa/Cairo",
  "Africa/Nairobi",
  "Africa/Lagos",
  "Africa/Johannesburg",
  // Asia
  "Asia/Dubai",
  "Asia/Karachi",
  "Asia/Kolkata",
  "Asia/Colombo",
  "Asia/Dhaka",
  "Asia/Bangkok",
  "Asia/Jakarta",
  "Asia/Singapore",
  "Asia/Kuala_Lumpur",
  "Asia/Shanghai",
  "Asia/Hong_Kong",
  "Asia/Taipei",
  "Asia/Seoul",
  "Asia/Tokyo",
  "Asia/Manila",
  "Asia/Riyadh",
  "Asia/Tehran",
  "Asia/Baghded",
  "Asia/Beirut",
  // Oceania
  "Australia/Sydney",
  "Australia/Melbourne",
  "Australia/Brisbane",
  "Australia/Perth",
  "Australia/Adelaide",
  "Pacific/Auckland",
  "Pacific/Fiji",
  "Pacific/Honolulu",
] as const;

export type Timezone = (typeof TIMEZONES)[number];

export const CreateBusinessSchema = z.object({
  name: z
    .string()
    .min(1, "Business name is required.")
    .max(100, "Business name must be 100 characters or less.")
    .trim(),
  description: z
    .string()
    .max(500, "Description must be 500 characters or less.")
    .trim()
    .optional()
    .or(z.literal("")),
  address: z
    .string()
    .max(300, "Address must be 300 characters or less.")
    .trim()
    .optional()
    .or(z.literal("")),
  timezone: z.enum(TIMEZONES, {
    message: "Please select a valid timezone.",
  }),
  latitude: z.coerce
    .number()
    .min(-90, "Latitude must be between -90 and 90.")
    .max(90, "Latitude must be between -90 and 90.")
    .optional()
    .nullable(),
  longitude: z.coerce
    .number()
    .min(-180, "Longitude must be between -180 and 180.")
    .max(180, "Longitude must be between -180 and 180.")
    .optional()
    .nullable(),
});

export type CreateBusinessInput = z.infer<typeof CreateBusinessSchema>;

export const UpdateBusinessSchema = CreateBusinessSchema;
export type UpdateBusinessInput = z.infer<typeof UpdateBusinessSchema>;
