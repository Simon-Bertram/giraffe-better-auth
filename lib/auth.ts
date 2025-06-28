import { betterAuth } from "better-auth";

export const { auth, signIn, signUp, signOut } = betterAuth({
  database: postgres(process.env.DATABASE_URL),
});
