import { PageDescription } from "~/components/layout/page-description";
import { PageTitle } from "~/components/layout/page-title";
import { InternalPage } from "~/components/navigation/internal/page";
import { PlansCard } from "./_components/plans-card";
import { getUserAction } from "~/server/actions/user/crud";
import { redirect } from "next/navigation";

export default async function BillingPage() {
  const user = await getUserAction();
  if (user?.data === undefined) {
    redirect("/");
  }
  return (
    <InternalPage
      breadcrumbLinks={[{ label: "Settings", href: "/billing" }]}
      breadcrumbPage={{ label: "Billing" }}
    >
      <PageTitle>Billing</PageTitle>
      <PageDescription className="mb-4">
        Manage your plans and billing information.
      </PageDescription>
      <PlansCard plan={user.data.plan} />
    </InternalPage>
  );
}
