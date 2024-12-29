"use client";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Icon } from "~/components/ui/icon";

export function SidebarUserButtonContent() {
  return (
    <>
      <Avatar className="size-8 rounded-lg">
        <AvatarImage src={`https://api.dicebear.com/9.x/glass/svg?seed=${0}`} />
        <AvatarFallback className="rounded-lg bg-muted"></AvatarFallback>
      </Avatar>
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-semibold">John Doe</span>
        <span className="truncate text-xs">john.doe@example.com</span>
      </div>
      <Icon name="ChevronsUpDown" className="ml-auto size-4" />
    </>
  );
}
