import { logout } from "~/lib/actions";
import { auth } from "~/lib/validate";
import { SuggestIcons } from "./_components/suggest-icons";

export default async function HomePage() {
  const { user } = await auth();
  const logoutAction = async () => {
    "use server";
    await logout();
  };

  return (
    <div>
      {user ? (
        <div>
          Hello, {user.username}! Want to{" "}
          <form action={logoutAction}>
            <button type="submit">sign out</button>
          </form>
          ?
        </div>
      ) : (
        <div>
          Please <a href="/login">sign in</a>.
        </div>
      )}
      <SuggestIcons />
    </div>
  );
}
