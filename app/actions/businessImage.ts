"use server";

import { revalidatePath } from "next/cache";
import { put, del } from "@vercel/blob";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_IMAGES_PER_BUSINESS = 5;

export interface ImageActionState {
  success: boolean;
  message?: string;
  error?: string;
}

export async function uploadBusinessImageAction(
  _prevState: ImageActionState,
  formData: FormData
): Promise<ImageActionState> {
  const session = await auth();

  if (!session?.user || session.user.role !== "OWNER") {
    return { success: false, error: "Unauthorized access." };
  }

  const file = formData.get("file") as File | null;

  if (!file || !(file instanceof File) || file.size === 0) {
    return { success: false, error: "Please select an image file to upload." };
  }

  // Server-side validation: file size
  if (file.size > MAX_FILE_SIZE) {
    return { success: false, error: "File size exceeds 5MB limit." };
  }

  // Server-side validation: mime type
  if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
    return {
      success: false,
      error: "Invalid file format. Only JPG, PNG, and WebP images are allowed.",
    };
  }

  try {
    // Find business owned by user
    const business = await db.business.findFirst({
      where: { owner_id: session.user.id },
      include: { _count: { select: { images: true } } },
    });

    if (!business) {
      return { success: false, error: "Business profile not found." };
    }

    if (business._count.images >= MAX_IMAGES_PER_BUSINESS) {
      return {
        success: false,
        error: `Maximum limit of ${MAX_IMAGES_PER_BUSINESS} images reached for this business. Delete an existing image to upload a new one.`,
      };
    }

    // Sanitize filename
    const safeFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const blobFilename = `businesses/${business.id}/${Date.now()}-${safeFilename}`;

    // Upload to Vercel Blob
    const blob = await put(blobFilename, file, {
      access: "public",
      addRandomSuffix: true,
    });

    // Save BusinessImage record in database
    await db.businessImage.create({
      data: {
        business_id: business.id,
        url: blob.url,
      },
    });

    revalidatePath("/owner/business/edit");
    revalidatePath(`/${business.slug}`);
    revalidatePath("/businesses");

    return {
      success: true,
      message: "Image uploaded successfully!",
    };
  } catch (error: unknown) {
    console.error("uploadBusinessImageAction error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Failed to upload image.";

    if (errorMessage.includes("BLOB_READ_WRITE_TOKEN") || errorMessage.includes("No token found")) {
      return {
        success: false,
        error: "Vercel Blob storage token missing. Please set BLOB_READ_WRITE_TOKEN in environment settings.",
      };
    }

    return {
      success: false,
      error: errorMessage || "Failed to upload image. Please try again.",
    };
  }
}

export async function deleteBusinessImageAction(
  imageId: string
): Promise<ImageActionState> {
  const session = await auth();

  if (!session?.user || session.user.role !== "OWNER") {
    return { success: false, error: "Unauthorized access." };
  }

  try {
    const image = await db.businessImage.findUnique({
      where: { id: imageId },
      include: { business: true },
    });

    if (!image) {
      return { success: false, error: "Image not found." };
    }

    // Verify that the logged-in owner owns this business
    if (image.business.owner_id !== session.user.id) {
      return { success: false, error: "Unauthorized access to this image." };
    }

    // Try deleting from Vercel Blob
    try {
      if (image.url.includes("public.blob.vercel-storage.com") || image.url.includes("vercel-storage.com")) {
        await del(image.url);
      }
    } catch (blobErr) {
      console.warn("Failed to delete blob file from Vercel Blob, removing DB record anyway:", blobErr);
    }

    // Delete DB record
    await db.businessImage.delete({
      where: { id: imageId },
    });

    revalidatePath("/owner/business/edit");
    revalidatePath(`/${image.business.slug}`);
    revalidatePath("/businesses");

    return {
      success: true,
      message: "Image deleted successfully.",
    };
  } catch (error) {
    console.error("deleteBusinessImageAction error:", error);
    return {
      success: false,
      error: "Failed to delete image. Please try again.",
    };
  }
}
