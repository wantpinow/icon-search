import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { Separator } from "~/components/ui/separator";
import { SidebarTrigger } from "~/components/ui/sidebar";
import { cn } from "~/lib/utils";

export type BreadcrumbLinkProps = {
  href: string;
  label: string;
};

export type BreadcrumbPageProps = {
  label: string;
};

export function InternalPage({
  children,
  breadcrumbPage,
  breadcrumbLinks = [],
  className,
}: {
  children: React.ReactNode;
  breadcrumbPage: BreadcrumbPageProps;
  breadcrumbLinks?: BreadcrumbLinkProps[];
  className?: string;
}) {
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbLinks.map(({ href, label }) => (
                <div key={href} className="flex items-center gap-1.5">
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href={href}>{label}</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                </div>
              ))}
              <BreadcrumbItem key={breadcrumbPage.label}>
                <BreadcrumbPage>{breadcrumbPage.label}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <main className={cn("container px-4 pb-8 pt-5 md:px-6", className)}>
        {children}
      </main>
    </>
  );
}
