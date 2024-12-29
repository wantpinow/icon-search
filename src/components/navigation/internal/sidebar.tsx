import * as React from "react";

import { Sidebar, SidebarContent } from "~/components/ui/sidebar";

import { InternalSidebarMain } from "./main";
import { InternalSidebarHeader } from "./header";
import { InternalSiderbarFooter } from "./footer";

export function InternalSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <InternalSidebarHeader />
      <SidebarContent>
        <InternalSidebarMain />
      </SidebarContent>
      <InternalSiderbarFooter />
    </Sidebar>
  );
}
