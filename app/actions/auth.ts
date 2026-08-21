"use server";

import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { db } from "@/lib/db";
import { auth, signIn, signOut } from "@/lib/auth";
import { AuthError } from "next-auth";

export interface SignupInput {
  name?: string;
  email: string;
  password: string;
  role: "OWNER" | "CUSTOMER";
}

export interface AuthResponse {
  success: boolean;
  error?: string;
  redirectUrl?: string;
}

export async function signupAction(data: SignupInput): Promise<AuthResponse> {
  const { name, email, password, role } = data;

  if (!email || !email.includes("@")) {
    return { success: false, error: "Please enter a valid email address." };
  }

  if (!password || password.length < 6) {
    return { success: false, error: "Password must be at least 6 characters long." };
  }

  if (role !== "OWNER" && role !== "CUSTOMER") {
    return { success: false, error: "Please select a valid account role." };
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    const existingUser = await db.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return { success: false, error: "An account with this email already exists." };
    }

    const password_hash = await bcrypt.hash(password, 10);

    await db.user.create({
      data: {
        email: normalizedEmail,
        password_hash,
        role: role === "OWNER" ? Role.OWNER : Role.CUSTOMER,
        name: name?.trim() || null,
      },
    });

    return {
      success: true,
      redirectUrl: `/login?registered=true&email=${encodeURIComponent(normalizedEmail)}`,
    };
  } catch (error) {
    console.error("Signup error:", error);
    return { success: false, error: "Failed to create account. Please try again." };
  }
}

export async function loginAction(
  email: string,
  password: string
): Promise<AuthResponse> {
  if (!email || !password) {
    return { success: false, error: "Please provide both email and password." };
  }

  try {
    const normalizedEmail = email.toLowerCase().trim();

    // Verify user role first to decide target redirect path upon successful login
    const user = await db.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return { success: false, error: "Invalid credentials." };
    }

    const targetDashboard = user.role === "OWNER" ? "/owner" : "/customer";

    const res = await signIn("credentials", {
      email: normalizedEmail,
      password,
      redirect: false,
    });

    return {
      success: true,
      redirectUrl: targetDashboard,
    };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { success: false, error: "Invalid email or password." };
        default:
          return { success: false, error: "Authentication failed. Please try again." };
      }
    }
    return { success: false, error: "Invalid email or password." };
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}

export async function requestPasswordResetAction(email: string): Promise<AuthResponse> {
  if (!email || !email.includes("@")) {
    return { success: false, error: "Please enter a valid email address." };
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    const user = await db.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (user) {
      // Import crypto dynamically
      const crypto = await import("crypto");

      // Delete any existing reset tokens for this user
      await db.passwordResetToken.deleteMany({
        where: { user_id: user.id },
      });

      // Generate a 32-byte hex token (secure random string)
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await db.passwordResetToken.create({
        data: {
          user_id: user.id,
          token,
          expires_at: expiresAt,
        },
      });

      const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
      const resetUrl = `${baseUrl}/reset-password/${token}`;

      const { sendPasswordResetEmail } = await import("@/lib/email");
      await sendPasswordResetEmail({
        toEmail: user.email,
        resetUrl,
        recipientName: user.name,
      });
    }

    // Always return generic success message to prevent user enumeration
    return {
      success: true,
    };
  } catch (error) {
    console.error("requestPasswordResetAction error:", error);
    return { success: false, error: "An unexpected error occurred. Please try again." };
  }
}

export async function validateResetTokenAction(token: string): Promise<{ valid: boolean; error?: string }> {
  if (!token) return { valid: false, error: "Invalid token." };

  try {
    const resetToken = await db.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      return { valid: false, error: "This password reset link is invalid or has already been used." };
    }

    if (resetToken.expires_at < new Date()) {
      return { valid: false, error: "This password reset link has expired. Please request a new one." };
    }

    return { valid: true };
  } catch (error) {
    console.error("validateResetTokenAction error:", error);
    return { valid: false, error: "An error occurred while validating the reset link." };
  }
}

export async function resetPasswordAction(
  token: string,
  newPassword: string
): Promise<AuthResponse> {
  if (!token) {
    return { success: false, error: "Invalid reset token." };
  }

  if (!newPassword || newPassword.length < 6) {
    return { success: false, error: "Password must be at least 6 characters long." };
  }

  try {
    const resetToken = await db.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      return { success: false, error: "This password reset link is invalid or has already been used." };
    }

    if (resetToken.expires_at < new Date()) {
      await db.passwordResetToken.delete({ where: { id: resetToken.id } });
      return { success: false, error: "This password reset link has expired. Please request a new one." };
    }

    const password_hash = await bcrypt.hash(newPassword, 10);

    // Update user's password
    await db.user.update({
      where: { id: resetToken.user_id },
      data: { password_hash },
    });

    // Delete all reset tokens for this user
    await db.passwordResetToken.deleteMany({
      where: { user_id: resetToken.user_id },
    });

    return {
      success: true,
      redirectUrl: "/login?reset=true",
    };
  } catch (error) {
    console.error("resetPasswordAction error:", error);
    return { success: false, error: "Failed to reset password. Please try again." };
  }
}

export async function updateUserProfileAction(name: string): Promise<AuthResponse> {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized. Please log in." };
  }

  const trimmedName = name.trim();

  if (!trimmedName) {
    return { success: false, error: "Name cannot be empty." };
  }

  try {
    await db.user.update({
      where: { id: session.user.id },
      data: { name: trimmedName },
    });

    const { revalidatePath } = await import("next/cache");
    revalidatePath("/profile");
    revalidatePath("/owner");
    revalidatePath("/customer");
    revalidatePath("/customer/bookings");

    return {
      success: true,
    };
  } catch (error) {
    console.error("updateUserProfileAction error:", error);
    return { success: false, error: "Failed to update profile name. Please try again." };
  }
}
