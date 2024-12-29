import { PageTitle } from "~/components/layout/page-title";
import { InternalPage } from "~/components/navigation/internal/page";

export default function DashboardPage() {
  return (
    <InternalPage breadcrumbPage={{ label: "Home" }}>
      <PageTitle>Welcome back!</PageTitle>
    </InternalPage>
  );
}
