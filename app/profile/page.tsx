import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { SignOutButton } from "@/components/sign-out-button";
import { ReturnButton } from "@/components/return-button";

export default async function ProfilePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return <div>Not authorised</div>;
  }
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <ReturnButton href="/" label="Home" />
        <h1 className="text-3xl font-bold mb-8">Profile</h1>
        <SignOutButton />
        <pre>{JSON.stringify(session, null, 2)}</pre>
      </div>
    </div>
  );
}
