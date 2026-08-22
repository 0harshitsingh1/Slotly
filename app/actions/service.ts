"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { CreateServiceSchema, UpdateServiceSchema } from "@/lib/schemas/service";

export interface ServiceActionState {
  success: boolean;
  errors?: Record<string, string[]>;
  message?: string;
}

export async function createServiceAction(
  _prevState: ServiceActionState,
  formData: FormData
): Promise<ServiceActionState> {
  // Auth guard
  const session = await auth();
  if (!session?.user || session.user.role !== "OWNER") {
    redirect("/login");
  }

  const ownerId = session.user.id;

  // Resolve the owner's business
  const business = await db.business.findFirst({
    where: { owner_id: ownerId },
  });

  if (!business) {
    return {
      success: false,
      message: "No business found. Please create a business first.",
    };
  }

  const raw = {
    name: formData.get("name"),
    duration_minutes: formData.get("duration_minutes"),
    price: formData.get("price"),
    buffer_minutes: formData.get("buffer_minutes") || "0",
    gst_number: formData.get("gst_number") || "",
  };

  const result = CreateServiceSchema.safeParse(raw);

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { name, duration_minutes, price, buffer_minutes, gst_number } = result.data;

  try {
    await db.service.create({
      data: {
        business_id: business.id,
        name,
        duration_minutes,
        price,
        buffer_minutes,
        gst_number: gst_number || null,
      },
    });
  } catch (error) {
    console.error("createServiceAction error:", error);
    return {
      success: false,
      message: "Failed to create service. Please try again.",
    };
  }

  revalidatePath("/owner/services");

  return { success: true, message: "Service added successfully." };
}

export async function updateServiceAction(
  _prevState: ServiceActionState,
  formData: FormData
): Promise<ServiceActionState> {
  const session = await auth();
  if (!session?.user || session.user.role !== "OWNER") {
    redirect("/login");
  }

  const serviceId = formData.get("id") as string;
  if (!serviceId) {
    return { success: false, message: "Missing service ID." };
  }

  const existingService = await db.service.findFirst({
    where: {
      id: serviceId,
      business: { owner_id: session.user.id },
    },
  });

  if (!existingService) {
    return { success: false, message: "Service not found or unauthorized." };
  }

  const raw = {
    id: serviceId,
    name: formData.get("name"),
    duration_minutes: formData.get("duration_minutes"),
    price: formData.get("price"),
    buffer_minutes: formData.get("buffer_minutes") || "0",
    gst_number: formData.get("gst_number") || "",
  };

  const result = UpdateServiceSchema.safeParse(raw);

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { name, duration_minutes, price, buffer_minutes, gst_number } = result.data;

  try {
    await db.service.update({
      where: { id: serviceId },
      data: {
        name,
        duration_minutes,
        price,
        buffer_minutes,
        gst_number: gst_number || null,
      },
    });
  } catch (error) {
    console.error("updateServiceAction error:", error);
    return {
      success: false,
      message: "Failed to update service. Please try again.",
    };
  }

  revalidatePath("/owner/services");

  return { success: true, message: "Service updated successfully." };
}
