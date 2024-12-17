import { getVersionsAction } from "~/server/actions/icons/get-versions";
import { SuggestIcons } from "./_components/suggest-icons";

export default async function HomePage() {
  const versions = await getVersionsAction({ type: "lucide-react" });
  if (!versions?.data) {
    return null;
  }
  return (
    <div className="py-4 md:py-12">
      <SuggestIcons versions={versions.data} />
    </div>
  );
}
