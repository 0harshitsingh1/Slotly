"use client";

import { useState } from "react";
import { updateUserProfileAction } from "@/app/actions/auth";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

interface ProfileFormProps {
  initialName: string;
  email: string;
  role: "OWNER" | "CUSTOMER";
  createdAt: string | null;
}

function formatDate(isoString: string | null): string {
  if (!isoString) return "N/A";
  try {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(isoString));
  } catch {
    return "N/A";
  }
}

export function ProfileForm({ initialName, email, role, createdAt }: ProfileFormProps) {
  const [name, setName] = useState(initialName);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      const res = await updateUserProfileAction(name);
      if (res.success) {
        setMessage({ type: "success", text: "Profile name updated successfully!" });
      } else {
        setMessage({ type: "error", text: res.error || "Failed to update profile name." });
      }
    } catch {
      setMessage({ type: "error", text: "An unexpected error occurred. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const getInitial = () => {
    if (name && name.trim().length > 0) {
      return name.trim()[0].toUpperCase();
    }
    if (email && email.trim().length > 0) {
      return email.trim()[0].toUpperCase();
    }
    return "U";
  };

  return (
    <div className="space-y-6">
      {/* Account Overview Header Card */}
      <Card>
        <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-600 font-heading text-xl font-bold text-white shadow-lg shadow-brand-500/20 dark:bg-brand-500">
              {getInitial()}
            </div>
            <div className="space-y-1">
              <h2 className="font-heading font-bold text-lg text-slate-900 dark:text-white">
                {name || "User"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {email}
              </p>
              <div className="pt-1">
                <Badge variant={role === "OWNER" ? "brand" : "info"} size="sm">
                  {role === "OWNER" ? "Business Owner" : "Customer"}
                </Badge>
              </div>
            </div>
          </div>

          {createdAt && (
            <div className="text-left sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Member Since
              </span>
              <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                {formatDate(createdAt)}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Profile Details Card */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Details</CardTitle>
          <CardDescription>
            Update your display name across the Slotly platform.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {message && (
              <div
                className={`rounded-lg p-3.5 text-xs font-semibold border ${
                  message.type === "success"
                    ? "border-success-200 bg-success-50 text-success-700 dark:border-success-900 dark:bg-success-950/60 dark:text-success-300"
                    : "border-danger-200 bg-danger-50 text-danger-700 dark:border-danger-900 dark:bg-danger-950/60 dark:text-danger-300"
                }`}
              >
                {message.type === "success" ? "✓ " : "⚠️ "}
                {message.text}
              </div>
            )}

            <Input
              label="Full Name"
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Doe"
            />

            <Input
              label="Email Address"
              id="email"
              type="email"
              disabled
              value={email}
              helperText="Email address cannot be changed."
            />

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Account Role
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  disabled
                  value={role === "OWNER" ? "Business Owner (OWNER)" : "Customer (CUSTOMER)"}
                  className="block w-full rounded-lg border border-slate-200 bg-slate-100 px-3.5 py-2 text-sm text-slate-500 cursor-not-allowed dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400"
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="justify-end">
            <Button type="submit" variant="primary" isLoading={loading}>
              Save Profile Changes
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
