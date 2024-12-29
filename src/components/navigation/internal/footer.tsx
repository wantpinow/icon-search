import { SidebarFooter } from "~/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Avatar, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { logout } from "~/lib/actions";
import { Icon } from "~/components/ui/icon";
import { Progress } from "~/components/ui/progress";
import { getUserAction } from "~/server/actions/user/crud";
import { redirect } from "next/navigation";
import type { Plan } from "~/config/plans";
import { getUserMonthlyUsageAction } from "~/server/actions/user/usage";
import { Suspense } from "react";

export async function InternalSiderbarFooter() {
  const user = await getUserAction();
  if (user?.data === undefined) {
    redirect("/");
  }

  const signOutAction = async () => {
    "use server";
    await logout();
  };

  const userEmail = user.data.email;
  const userAvatarUrl = user.data.avatarUrl;

  return (
    <SidebarFooter>
      <div className="flex flex-col space-y-4 border-t p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start px-2">
              <Avatar className="mr-2 h-8 w-8">
                <AvatarImage src={userAvatarUrl} alt={userEmail} />
              </Avatar>
              <div className="flex flex-col items-start text-sm">
                <span className="font-medium">{userEmail}</span>
                <span className="text-xs text-muted-foreground">
                  View account
                </span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56"
            align="end"
            side="right"
            forceMount
          >
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{userEmail}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {userEmail}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <form action={signOutAction}>
              <Button
                className="w-full justify-between text-sm"
                size="sm"
                variant="ghost"
                type="submit"
              >
                <span>Sign out</span>
                <Icon name="LogOut" className="mr-2 h-4 w-4" />
              </Button>
            </form>
          </DropdownMenuContent>
        </DropdownMenu>

        <UserUsage plan={user.data.plan} />
      </div>
    </SidebarFooter>
  );
}

export async function UserUsage({ plan }: { plan: Plan }) {
  const apiUsage = await getUserMonthlyUsageAction();

  if (apiUsage?.data === undefined) {
    return null;
  }
  const usage = apiUsage.data;
  const apiLimit = plan.monthlyRequests;

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span>
            <Icon
              name={plan.icon}
              className="mr-1 inline-block h-3 w-3 -translate-y-px"
            />
            {plan.name}
          </span>
          <span>
            {apiLimit === undefined ? `${usage}/∞` : `${usage}/${apiLimit}`}
          </span>
        </div>
        {apiLimit === undefined ? (
          <Progress value={100} className="h-2" />
        ) : (
          <Progress value={(usage / apiLimit) * 100} className="h-2" />
        )}
      </div>
    </Suspense>
  );
}
