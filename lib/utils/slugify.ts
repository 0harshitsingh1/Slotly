import { PrismaClient } from "@prisma/client";

/**
 * Converts a string to a URL-safe kebab-case slug.
 * e.g. "Joe's Salon & Spa!" → "joes-salon-spa"
 */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")                       // decompose accented chars
    .replace(/[\u0300-\u036f]/g, "")        // strip diacritics
    .replace(/[^a-z0-9\s-]/g, "")          // remove non-alphanumeric (keep spaces & hyphens)
    .trim()
    .replace(/\s+/g, "-")                  // collapse whitespace to hyphens
    .replace(/-+/g, "-")                   // collapse multiple hyphens
    .replace(/^-|-$/g, "");                // strip leading/trailing hyphens
}

/**
 * Generates a unique slug for a business name by checking the database.
 * Appends a numeric suffix if the base slug is already taken.
 * e.g. "joes-salon" → "joes-salon-2" → "joes-salon-3" …
 */
export async function generateUniqueSlug(
  name: string,
  db: PrismaClient
): Promise<string> {
  const base = slugify(name) || "business";

  const existing = await db.business.findUnique({ where: { slug: base } });
  if (!existing) return base;

  // Find all slugs that start with the base slug
  const similar = await db.business.findMany({
    where: { slug: { startsWith: base } },
    select: { slug: true },
  });

  const slugSet = new Set(similar.map((b) => b.slug));
  let counter = 2;
  while (slugSet.has(`${base}-${counter}`)) {
    counter++;
  }
  return `${base}-${counter}`;
}
