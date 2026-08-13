"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { CreateBusinessSchema } from "@/lib/schemas/business";
import { generateUniqueSlug } from "@/lib/utils/slugify";

export interface BusinessActionState {
  success: boolean;
  errors?: Record<string, string[]>;
  message?: string;
}

export async function createBusinessAction(
  _prevState: BusinessActionState,
  formData: FormData
): Promise<BusinessActionState> {
  // Auth guard
  const session = await auth();
  if (!session?.user || session.user.role !== "OWNER") {
    redirect("/login");
  }

  const raw = {
    name: formData.get("name"),
    description: formData.get("description"),
    timezone: formData.get("timezone"),
  };

  const result = CreateBusinessSchema.safeParse(raw);

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { name, description, timezone } = result.data;
  const ownerId = session.user.id;

  try {
    // Check if this owner already has a business
    const existing = await db.business.findFirst({
      where: { owner_id: ownerId },
    });

    if (existing) {
      return {
        success: false,
        message: "You already have a business registered. You can manage it from the Services page.",
      };
    }

    const slug = await generateUniqueSlug(name, db);

    await db.business.create({
      data: {
        owner_id: ownerId,
        name,
        description: description || null,
        timezone,
        slug,
      },
    });
  } catch (error) {
    console.error("createBusinessAction error:", error);
    return {
      success: false,
      message: "Failed to create business. Please try again.",
    };
  }

  redirect("/owner/services");
}
