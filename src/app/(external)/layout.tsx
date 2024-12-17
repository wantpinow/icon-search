import Link from "next/link";
import { Icon } from "~/components/ui/icon";
import { auth } from "~/lib/validate";

export default async function ExternalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await auth();
  return (
    <>
      <header className="fixed left-0 top-0 h-16 w-full">
        <div className="container mx-auto flex h-full items-center justify-between px-3 font-mono">
          <Link href="/" className="flex items-center gap-3">
            <Icon name="TextSearch" className="h-6 w-6" />
            <span>icon-search</span>
          </Link>
          <Link href={user ? "/dashboard" : "/login/github"}>API Access</Link>
        </div>
      </header>
      <main className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-200 pt-16">
        <div className="container mx-auto px-3 py-4">{children}</div>
      </main>
    </>
  );
}
