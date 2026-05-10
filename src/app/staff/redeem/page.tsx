import { TicketCheck } from "lucide-react";
import { LinkButton, PageShell } from "@/components/bribeme/ui";
import { StaffRedeemForm } from "@/components/bribeme/forms";
import { ensureDemoData } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

export default async function StaffRedeemPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;
  ensureDemoData();

  return (
    <PageShell
      role="staff"
      title="Redeem reward"
      description="Check and redeem a patron reward code from phone, tablet, or desktop."
      actions={
        <LinkButton href="/staff/campaigns">
          <TicketCheck /> View active campaigns
        </LinkButton>
      }
    >
      <StaffRedeemForm initialCode={code} />
    </PageShell>
  );
}
