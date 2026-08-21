"use client";

import { useState, useRef, useTransition } from "react";
import Image from "next/image";
import {
  uploadBusinessImageAction,
  deleteBusinessImageAction,
} from "@/app/actions/businessImage";

export interface BusinessImageItem {
  id: string;
  url: string;
  created_at: Date | string;
}

interface BusinessImageManagerProps {
  images: BusinessImageItem[];
  maxImages?: number;
}

const MAX_SIZE_MB = 5;
const MAX_BYTES = MAX_SIZE_MB * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

export function BusinessImageManager({
  images,
  maxImages = 5,
}: BusinessImageManagerProps) {
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isMaxReached = images.length >= maxImages;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    setSuccessMsg(null);

    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Client-side validation: Max images count
    if (isMaxReached) {
      setErrorMsg(`Maximum limit of ${maxImages} images reached.`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // 2. Client-side validation: File type
    if (!ALLOWED_TYPES.includes(file.type.toLowerCase())) {
      setErrorMsg("Invalid file format. Only JPG, PNG, and WebP images are allowed.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // 3. Client-side validation: File size
    if (file.size > MAX_BYTES) {
      setErrorMsg(`File size exceeds ${MAX_SIZE_MB}MB limit (selected file is ${(file.size / (1024 * 1024)).toFixed(1)}MB).`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    startTransition(async () => {
      const res = await uploadBusinessImageAction({ success: false }, formData);

      if (res.success) {
        setSuccessMsg(res.message || "Image uploaded successfully!");
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        setErrorMsg(res.error || "Failed to upload image.");
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    });
  };

  const handleDelete = (imageId: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return;

    setErrorMsg(null);
    setSuccessMsg(null);
    setDeletingId(imageId);

    startTransition(async () => {
      const res = await deleteBusinessImageAction(imageId);
      setDeletingId(null);

      if (res.success) {
        setSuccessMsg(res.message || "Image deleted.");
      } else {
        setErrorMsg(res.error || "Failed to delete image.");
      }
    });
  };

  return (
    <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-gray-100 pb-4 dark:border-gray-800">
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <span>📷</span> Business Photo Gallery
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Upload up to {maxImages} photos of your business or services (JPG, PNG, WebP up to {MAX_SIZE_MB}MB each).
          </p>
        </div>
        <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 self-start sm:self-auto">
          {images.length} / {maxImages} Photos
        </span>
      </div>

      {/* Alerts */}
      {errorMsg && (
        <div className="rounded-md bg-red-50 p-3 text-xs font-medium text-red-600 dark:bg-red-950/50 dark:text-red-400">
          ⚠️ {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="rounded-md bg-green-50 p-3 text-xs font-medium text-green-700 dark:bg-green-950/50 dark:text-green-300">
          ✓ {successMsg}
        </div>
      )}

      {/* Thumbnails Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
        {images.map((img) => (
          <div
            key={img.id}
            className="group relative aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-gray-900"
          >
            <Image
              src={img.url}
              alt="Business photo"
              fill
              sizes="(max-width: 640px) 50vw, 20vw"
              className="object-cover transition group-hover:scale-105"
              unoptimized
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 transition group-hover:opacity-100 flex items-center justify-center">
              <button
                type="button"
                onClick={() => handleDelete(img.id)}
                disabled={isPending || deletingId === img.id}
                className="rounded-full bg-red-600 p-2 text-white shadow-md hover:bg-red-700 disabled:opacity-50 transition"
                title="Delete photo"
              >
                {deletingId === img.id ? (
                  <span className="block h-4 w-4 animate-spin text-xs">⏳</span>
                ) : (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        ))}

        {/* Upload Trigger Tile */}
        {!isMaxReached && (
          <label
            htmlFor="business-image-upload"
            className={`flex aspect-square flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-gray-300 p-4 text-center transition dark:border-gray-700 ${
              isPending
                ? "cursor-not-allowed opacity-50 bg-gray-50 dark:bg-gray-900"
                : "cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 dark:hover:border-blue-500 dark:hover:bg-blue-950/30"
            }`}
          >
            {isPending ? (
              <>
                <span className="text-xl">⏳</span>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Uploading…
                </span>
              </>
            ) : (
              <>
                <span className="text-2xl text-blue-600 dark:text-blue-400">+</span>
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Add Photo
                </span>
                <span className="text-[10px] text-gray-400">
                  JPG, PNG, WebP &lt; 5MB
                </span>
              </>
            )}
            <input
              id="business-image-upload"
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              disabled={isPending || isMaxReached}
              className="hidden"
            />
          </label>
        )}
      </div>
    </div>
  );
}
