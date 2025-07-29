import { GalleryVerticalEnd } from "lucide-react";
import LoginForm from "@/components/login-form";
import Image from "next/image";
import { ReturnButton } from "@/components/return-button";

export default function Login() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <ReturnButton href="/" label="Home" />
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            Acme Inc.
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
            <p className="text-muted-foreground text-sm"></p>
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <Image
          src="/https://placecats.com/bella/300/200"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover"
          width={300}
          height={200}
        />
      </div>
    </div>
  );
}
