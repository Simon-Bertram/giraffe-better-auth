import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div>
      <h1>Home</h1>
      <div className="flex gap-2">
        {" "}
        <Button variant="outline">
          <Link href="/auth/register">Register</Link>
        </Button>
        <Button variant="outline">
          <Link href="/auth/login">Login</Link>
        </Button>{" "}
      </div>
    </div>
  );
}
