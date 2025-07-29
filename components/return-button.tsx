import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";

interface ReturnButtonProps {
  href: string;
  label: string;
}

export const ReturnButton = ({ href, label }: ReturnButtonProps) => {
  return (
    <Button variant="outline" size="sm" asChild>
      <Link href={href}>
        {label}
        <ArrowLeftIcon />
      </Link>
    </Button>
  );
};
