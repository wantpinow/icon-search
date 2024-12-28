import { getVersionsAction } from "~/server/actions/icons/get-versions";
import { SuggestIcons } from "./_components/suggest-icons";

export default async function HomePage() {
  const versions = await getVersionsAction({ type: "lucide-react" });
  if (!versions?.data) {
    return null;
  }
  return (
    <div className="grid grid-cols-1 gap-8 py-4 md:grid-cols-2 md:py-12">
      <div className="justify-scenter flex flex-col space-y-4">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
          Find the Right Icon, Fast
        </h1>
        <p className="max-w-[600px] text-lg text-muted-foreground md:text-xl">
          Search for the perfect Lucide icon in seconds. Integrate your project
          in minutes via the API.
        </p>
      </div>
      <SuggestIcons versions={versions.data} />
    </div>
  );
}
