This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Server Action Error Handling Patterns

This project demonstrates modern Next.js 15 patterns for handling errors in server actions using `useActionState` and proper error handling strategies.

### Key Principles

1. **Use `useActionState` for expected errors** - Return errors as values instead of throwing them
2. **Validate on both frontend and backend** - Client validation for UX, server validation for security
3. **Use try/catch only for unexpected errors** - Network failures, database connection issues, etc.
4. **Progressive enhancement** - Start with client validation, enhance with server validation

### Server Action Implementation

```typescript
// app/actions/sign-up-email.action.ts
"use server";

import { auth } from "@/lib/auth";
import { z } from "zod";

// Define the action state type
type ActionState = {
  success?: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
};

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
  const result = await auth.emailAndPassword.signUp({
    email,
    password,
    additionalFields: {
      name,
    },
  });

  // Handle expected errors as return values
  if (result.error) {
    if (result.error.status === 422) {
      return {
        message: "This email address is already registered",
      };
    }

    return {
      message: result.error.message || "Registration failed",
    };
  }

  // Success case
  return {
    success: true,
    message: "Registration successful!",
  };
}
```

### Client Component with useActionState

```typescript
// components/register-form.tsx
"use client";

import { useActionState } from "react";
import { signUpEmailAction } from "@/app/actions/sign-up-email.action";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export function RegisterForm() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(signUpEmailAction, {
    success: false,
    message: "",
    fieldErrors: {},
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  // Handle server-side field errors
  React.useEffect(() => {
    if (state.fieldErrors) {
      Object.entries(state.fieldErrors).forEach(([field, errors]) => {
        form.setError(field as any, {
          type: "server",
          message: errors[0],
        });
      });
    }
  }, [state.fieldErrors, form]);

  // Handle success/error messages
  React.useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast.success(state.message);
        router.push("/profile");
      } else {
        toast.error(state.message);
      }
    }
  }, [state.message, state.success, router]);

  return (
    <form action={formAction}>
      {/* Form fields */}
      <button type="submit" disabled={isPending}>
        {isPending ? "Creating account..." : "Sign up"}
      </button>
    </form>
  );
}
```

### Progressive Enhancement Pattern

For the best user experience, combine client and server validation:

```typescript
export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(signUpEmailAction, {
    success: false,
    message: "",
    fieldErrors: {},
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema), // Client-side validation
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    // Client validation passed, now submit to server
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("email", data.email);
    formData.append("password", data.password);

    formAction(formData);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields with client validation */}
    </form>
  );
}
```

### When to Use Try/Catch

Only use try/catch for **unexpected errors**:

```typescript
export async function signUpEmailAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    // ... validation and business logic

    const result = await auth.emailAndPassword.signUp({
      email,
      password,
      additionalFields: { name },
    });

    // Handle expected errors as return values
    if (result.error) {
      return { message: result.error.message };
    }

    return { success: true, message: "Success!" };
  } catch (error) {
    // Only for unexpected errors (network, database connection, etc.)
    console.error("Unexpected error:", error);
    return { message: "An unexpected error occurred" };
  }
}
```

### Best Practices Summary

1. **Use `useActionState`** for managing server action state
2. **Return expected errors** instead of throwing them
3. **Validate on both frontend and backend** for security and UX
4. **Use try/catch only for unexpected errors**
5. **Leverage progressive enhancement** with client-side validation
6. **Keep server actions focused** on business logic, not UI concerns
7. **Use consistent error response structures** across all actions
8. **Log unexpected errors** but don't expose them to clients

### Error Handling Flow

1. **Client Validation** - Immediate feedback for better UX
2. **Server Validation** - Security and data integrity
3. **Business Logic** - Handle expected business errors as return values
4. **Unexpected Errors** - Use try/catch for network/database failures
5. **User Feedback** - Display appropriate messages based on error type

This approach ensures robust error handling while maintaining excellent user experience and following Next.js 15's recommended patterns.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
