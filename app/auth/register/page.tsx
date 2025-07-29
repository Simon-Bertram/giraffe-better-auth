import { RegisterForm } from "@/components/register-form";
import { ReturnButton } from "@/components/return-button";

export default function Register() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <h1 className="text-3xl font-bold mb-8">Register</h1>
        <ReturnButton href="/" label="Home" />
        <RegisterForm />
      </div>
    </div>
  );
}
