import { cn } from "~/lib/utils";

export function PageDescription({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h1
      className={cn(
        "text-base font-light leading-9 text-muted-foreground",
        className,
      )}
    >
      {children}
    </h1>
  );
}
