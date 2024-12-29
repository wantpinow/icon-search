import { cn } from "~/lib/utils";

export function PageTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h1
      className={cn("text-2xl font-light leading-9 text-foreground", className)}
    >
      {children}
    </h1>
  );
}
