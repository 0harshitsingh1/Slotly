"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { CreateServiceSchema } from "@/lib/schemas/service";

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
  };

  const result = CreateServiceSchema.safeParse(raw);

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { name, duration_minutes, price, buffer_minutes } = result.data;

  try {
    await db.service.create({
      data: {
        business_id: business.id,
        name,
        duration_minutes,
        price,
        buffer_minutes,
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
