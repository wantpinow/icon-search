"use client";

import Link from "next/link";
import { Badge } from "~/components/ui/badge";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import { Icon, type IconName } from "~/components/ui/icon";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "~/components/ui/sidebar";

export function InternalSidebarMain() {
  type NavItem = {
    title: string;
    icon: IconName;
    isActive?: boolean;
    url?: string;
    items?: {
      title: string;
      url: string;
      icon?: IconName;
    }[];
    new?: boolean;
  };

  const items: NavItem[] = [
    {
      title: "Dashboard",
      icon: "LayoutGrid",
      url: "/dashboard",
    },
    {
      title: "Get Started",
      icon: "Code",
      url: "/get-started",
    },
    {
      title: "Settings",
      icon: "Settings",
      items: [
        {
          title: "API Keys",
          url: `/api-keys`,
        },
        {
          title: "Billing",
          url: `/billing`,
        },
      ],
      isActive: true,
    },
  ];

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => {
          if (item.items !== undefined) {
            return (
              <Collapsible
                key={item.title}
                asChild
                defaultOpen={item.isActive}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.title}>
                      <Icon name={item.icon} />
                      <span>{item.title}</span>
                      <Icon
                        name="ChevronRight"
                        className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
                      />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild>
                            <Link href={subItem.url}>
                              {subItem.icon && <Icon name={subItem.icon} />}
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            );
          }
          if (item.url === undefined) {
            return null;
          }
          return (
            <Link href={item.url} key={item.title}>
              <SidebarMenuButton tooltip={item.title}>
                <Icon name={item.icon} />
                <span>{item.title}</span>
                {item.new && (
                  <Badge className="ml-auto px-2 text-xs font-semibold">
                    NEW
                  </Badge>
                )}
              </SidebarMenuButton>
            </Link>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
