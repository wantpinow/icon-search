import Link from "next/link";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

export function ExternalFooter({ className }: { className?: string }) {
  return (
    <div className={cn("border-t py-12", className)}>
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="text-center text-sm">
          Built with ❤️ by{" "}
          <Link
            className="fill-primary/70 stroke-primary/70 text-primary/70"
            href="https://github.com/wantpinow/icon-search"
            target="_blank"
          >
            @wantpinow
          </Link>
        </div>
        <div className="hidden md:inline-flex">
          <Button variant="link" asChild>
            <Link href="/privacy-policy">Privacy Policy</Link>
          </Button>
          <Button variant="link" asChild>
            <Link href="/terms-of-service">Terms of Service</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
