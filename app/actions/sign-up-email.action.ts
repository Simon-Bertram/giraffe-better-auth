"use server";

import { auth } from "@/lib/auth";
import { ActionState } from "@/lib/types";
import { z } from "zod";

// Validation schema
const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function signUpEmailAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  // Extract form data
  const rawData = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  // Validate on server (for security and data integrity)
  const validationResult = signUpSchema.safeParse(rawData);
  if (!validationResult.success) {
    return {
      fieldErrors: validationResult.error.flatten().fieldErrors,
      message: "Please fix the errors below",
    };
  }

  const { name, email, password } = validationResult.data;

  // Attempt to create user
  const result = await auth.api.signUpEmail({
    body: {
      name,
      email,
      password,
      callbackURL: "/profile",
    },
  });

  // Check if registration was successful (token exists)
  if (result.token) {
    return { success: true, message: "Registration successful!" };
  }

  // If no token, registration failed
  return {
    message: "Registration failed. Please try again.",
  };
}
