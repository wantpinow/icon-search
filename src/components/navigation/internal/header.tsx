import { Icon } from "~/components/ui/icon";
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "~/components/ui/sidebar";

export async function InternalSidebarHeader() {
  return (
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <div className="flex items-center justify-center gap-2 py-5 text-sm font-medium">
            <Icon name="TextSearch" size={20} />
            <span className="tracking-wide">Icon Search</span>
          </div>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
  );
}
