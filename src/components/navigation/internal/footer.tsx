import { SidebarFooter } from "~/components/ui/sidebar";
import { Button } from "~/components/ui/button";
import { logout } from "~/lib/actions";

export function InternalSiderbarFooter() {
  const signOutAction = async () => {
    "use server";
    await logout();
  };

  return (
    <SidebarFooter>
      <form action={signOutAction}>
        <Button className="w-full" variant="outline">
          Sign out
        </Button>
      </form>
    </SidebarFooter>
  );
}
