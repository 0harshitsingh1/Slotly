"use server";

import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { db } from "@/lib/db";
import { signIn, signOut } from "@/lib/auth";
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
