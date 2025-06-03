"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { authenticate, validateEmail } from "./auth/auth";
import { createTokenEdge } from "./auth/auth-edge";

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // Validate input
  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  if (!validateEmail(email)) {
    return { error: "Invalid email format" };
  }

  try {
    // Authenticate user
    const result = await authenticate({ email, password });

    if (!result) {
      return { error: "Invalid credentials" };
    }

    // Create edge-compatible token for middleware
    const edgeToken = await createTokenEdge({
      userId: result.user.id,
      email: result.user.email,
      role: result.user.role,
    });

    // Set authentication cookie using server-side cookies
    const cookieStore = cookies();
    cookieStore.set("auth-token", edgeToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    // Redirect will happen after this function returns
    redirect("/");
  } catch (error) {
    console.error("Login error:", error);
    return { error: "An error occurred during login" };
  }
}

export async function logoutAction() {
  const cookieStore = cookies();
  cookieStore.delete("auth-token");
  redirect("/login");
}
