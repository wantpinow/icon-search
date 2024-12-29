import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar";
import { cookies } from "next/headers";
import { SIDEBAR_COOKIE_NAME } from "~/lib/shadcn";
import { InternalSidebar } from "~/components/navigation/internal/sidebar";

export default async function InternalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const defaultOpen = cookieStore.get(SIDEBAR_COOKIE_NAME)?.value === "true";
  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <InternalSidebar />
      <SidebarInset className="overflow-clip">{children}</SidebarInset>
    </SidebarProvider>
  );
}
