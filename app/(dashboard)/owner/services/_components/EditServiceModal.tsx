"use client";

import { useState, useActionState, useEffect } from "react";
import { updateServiceAction, type ServiceActionState } from "@/app/actions/service";

interface ServiceData {
  id: string;
  name: string;
  duration_minutes: number;
  price: number;
  buffer_minutes: number;
  gst_number: string | null;
}

interface EditServiceModalProps {
  service: ServiceData;
}

const initialState: ServiceActionState = { success: false };

export function EditServiceModal({ service }: EditServiceModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(
    updateServiceAction,
    initialState
  );

  useEffect(() => {
    if (state.success) {
      setIsOpen(false);
    }
  }, [state.success]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
      >
        ✏️ Edit
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Edit Service Details
              </h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {state.message && (
              <div
                className={`rounded-lg p-3 text-xs font-semibold ${
                  state.success
                    ? "bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-300"
                    : "bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400"
                }`}
              >
                {state.message}
              </div>
            )}

            <form action={formAction} className="space-y-4">
              <input type="hidden" name="id" value={service.id} />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Name */}
                <div className="sm:col-span-2 space-y-1">
                  <label htmlFor={`edit-name-${service.id}`} className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300">
                    Service Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id={`edit-name-${service.id}`}
                    name="name"
                    type="text"
                    required
                    defaultValue={service.name}
                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  />
                  {state.errors?.name && (
                    <p className="text-xs text-red-600 dark:text-red-400">
                      {state.errors.name[0]}
                    </p>
                  )}
                </div>

                {/* Duration */}
                <div className="space-y-1">
                  <label htmlFor={`edit-duration-${service.id}`} className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300">
                    Duration (minutes) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id={`edit-duration-${service.id}`}
                    name="duration_minutes"
                    type="number"
                    required
                    min={5}
                    step={5}
                    defaultValue={service.duration_minutes}
                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  />
                  {state.errors?.duration_minutes && (
                    <p className="text-xs text-red-600 dark:text-red-400">
                      {state.errors.duration_minutes[0]}
                    </p>
                  )}
                </div>

                {/* Price */}
                <div className="space-y-1">
                  <label htmlFor={`edit-price-${service.id}`} className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300">
                    Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id={`edit-price-${service.id}`}
                    name="price"
                    type="number"
                    required
                    min={0}
                    step={0.01}
                    defaultValue={service.price}
                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  />
                  {state.errors?.price && (
                    <p className="text-xs text-red-600 dark:text-red-400">
                      {state.errors.price[0]}
                    </p>
                  )}
                </div>

                {/* Buffer */}
                <div className="space-y-1">
                  <label htmlFor={`edit-buffer-${service.id}`} className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300">
                    Buffer Time (min) <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <input
                    id={`edit-buffer-${service.id}`}
                    name="buffer_minutes"
                    type="number"
                    min={0}
                    step={5}
                    defaultValue={service.buffer_minutes}
                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  />
                  {state.errors?.buffer_minutes && (
                    <p className="text-xs text-red-600 dark:text-red-400">
                      {state.errors.buffer_minutes[0]}
                    </p>
                  )}
                </div>

                {/* GST Number */}
                <div className="sm:col-span-2 space-y-1">
                  <label htmlFor={`edit-gst-${service.id}`} className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300">
                    GST Number <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <input
                    id={`edit-gst-${service.id}`}
                    name="gst_number"
                    type="text"
                    maxLength={15}
                    placeholder="22AAAAA0000A1Z5"
                    defaultValue={service.gst_number || ""}
                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm uppercase text-slate-900 shadow-sm focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 placeholder:normal-case font-mono"
                  />
                  {state.errors?.gst_number && (
                    <p className="text-xs text-red-600 dark:text-red-400">
                      {state.errors.gst_number[0]}
                    </p>
                  )}
                  <p className="text-[11px] text-slate-400">
                    15-character GSTIN format (e.g. 22AAAAA0000A1Z5).
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-lg bg-brand-600 px-5 py-2 text-xs font-semibold text-white shadow hover:bg-brand-700 disabled:opacity-50 dark:bg-brand-500"
                >
                  {isPending ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
