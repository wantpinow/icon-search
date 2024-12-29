import { PageDescription } from "~/components/layout/page-description";
import { PageTitle } from "~/components/layout/page-title";
import { InternalPage } from "~/components/navigation/internal/page";
import { ApiKeysCard } from "./_components/api-keys-card";

export default function ApiKeysPage() {
  return (
    <InternalPage
      breadcrumbLinks={[{ label: "Settings", href: "/api-keys" }]}
      breadcrumbPage={{ label: "API Keys" }}
    >
      <PageTitle>Key Management</PageTitle>
      <PageDescription className="mb-4">
        Manage your API keys used to authenticate requests via the API.
      </PageDescription>
      <ApiKeysCard />
    </InternalPage>
  );
}
