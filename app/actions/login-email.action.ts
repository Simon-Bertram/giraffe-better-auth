"use server";

import { auth } from "@/lib/auth";
import { z } from "zod";
import { redirect } from "next/navigation";

// Validation schema
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

// TypeScript interface for the action result
export interface LoginActionResult {
  success: boolean;
  message?: string;
  fieldErrors?: {
    email?: string[];
    password?: string[];
  };
}

export async function loginEmailAction(
  prevState: LoginActionResult | null,
  formData: FormData
): Promise<LoginActionResult> {
  // Extract form data
  const rawData = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  // Validate on server (for security and data integrity)
  const validationResult = loginSchema.safeParse(rawData);
  if (!validationResult.success) {
    return {
      success: false,
      fieldErrors: validationResult.error.flatten().fieldErrors,
      message: "Please fix the errors below",
    };
  }

  const { email, password } = validationResult.data;

  // Attempt to login user
  const result = await auth.api.signInEmail({
    body: {
      email,
      password,
      callbackURL: "/profile",
    },
    asResponse: true, // returns a response object instead of data
  });

  // Check if the response is successful (2xx or 3xx status codes)
  if (result.status >= 200 && result.status < 400) {
    // Successful login - Better Auth will handle the redirect via callbackURL
    return { success: true };
  }

  // Handle different error status codes
  const errorData = await result.json().catch(() => ({}));

  return {
    success: false,
    message:
      errorData.message || "Login failed. Please check your credentials.",
    fieldErrors: {
      email: errorData.email ? [errorData.email] : undefined,
      password: errorData.password ? [errorData.password] : undefined,
    },
  };
}
