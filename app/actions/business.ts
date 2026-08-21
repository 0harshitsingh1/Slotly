"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { CreateBusinessSchema, UpdateBusinessSchema } from "@/lib/schemas/business";
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

  const rawLatitude = formData.get("latitude");
  const rawLongitude = formData.get("longitude");

  const raw = {
    name: formData.get("name"),
    description: formData.get("description"),
    address: formData.get("address"),
    timezone: formData.get("timezone"),
    latitude: rawLatitude !== "" && rawLatitude !== null ? rawLatitude : undefined,
    longitude: rawLongitude !== "" && rawLongitude !== null ? rawLongitude : undefined,
  };

  const result = CreateBusinessSchema.safeParse(raw);

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { name, description, address, timezone, latitude, longitude } = result.data;
  const ownerId = session.user.id;

  try {
    // Check if this owner already has a business
    const existing = await db.business.findFirst({
      where: { owner_id: ownerId },
    });

    if (existing) {
      return {
        success: false,
        message: "You already have a business registered. You can manage it on your business page.",
      };
    }

    const slug = await generateUniqueSlug(name, db);

    await db.business.create({
      data: {
        owner_id: ownerId,
        name,
        description: description || null,
        address: address || null,
        timezone,
        slug,
        latitude: latitude ?? null,
        longitude: longitude ?? null,
      },
    });
  } catch (error) {
    console.error("createBusinessAction error:", error);
    return {
      success: false,
      message: "Failed to create business. Please try again.",
    };
  }

  redirect("/owner/business");
}

export async function updateBusinessAction(
  _prevState: BusinessActionState,
  formData: FormData
): Promise<BusinessActionState> {
  // Auth guard
  const session = await auth();
  if (!session?.user || session.user.role !== "OWNER") {
    redirect("/login");
  }

  const rawLatitude = formData.get("latitude");
  const rawLongitude = formData.get("longitude");

  const raw = {
    name: formData.get("name"),
    description: formData.get("description"),
    address: formData.get("address"),
    timezone: formData.get("timezone"),
    latitude: rawLatitude !== "" && rawLatitude !== null ? rawLatitude : undefined,
    longitude: rawLongitude !== "" && rawLongitude !== null ? rawLongitude : undefined,
  };

  const result = UpdateBusinessSchema.safeParse(raw);

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { name, description, address, timezone, latitude, longitude } = result.data;
  const ownerId = session.user.id;

  try {
    const existing = await db.business.findFirst({
      where: { owner_id: ownerId },
    });

    if (!existing) {
      return {
        success: false,
        message: "Business profile not found.",
      };
    }

    await db.business.update({
      where: { id: existing.id },
      data: {
        name,
        description: description || null,
        address: address || null,
        timezone,
        latitude: latitude ?? null,
        longitude: longitude ?? null,
      },
    });

    revalidatePath("/owner/business");
    revalidatePath(`/${existing.slug}`);
    revalidatePath("/businesses");

    return {
      success: true,
      message: "Business details updated successfully!",
    };
  } catch (error) {
    console.error("updateBusinessAction error:", error);
    return {
      success: false,
      message: "Failed to update business. Please try again.",
    };
  }
}

