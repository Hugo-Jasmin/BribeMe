import { ClipboardCheck, QrCode, ScanLine } from "lucide-react";
import { AppCard, LinkButton, PageShell } from "@/components/bribe/ui";
import { ensureDemoData } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

export default async function Home() {
  await ensureDemoData();

  return (
    <PageShell
      role="home"
      title="Bribe"
      description="Choose the actual role surface. Patrons use the QR flow, owners run the desktop dashboard, and staff redeem rewards from a compact counter view."
    >
      <div className="grid gap-4 md:grid-cols-3">
        <AppCard
          description="Vertical phone flow opened by the restaurant QR code."
          icon={<QrCode />}
          title="Patron"
        >
          <LinkButton href="/patron/qr" variant="default">
            Open QR flow
          </LinkButton>
        </AppCard>
        <AppCard
          description="Desktop web view for campaigns, approvals, rewards, and settings."
          icon={<ClipboardCheck />}
          title="Owner"
        >
          <LinkButton href="/owner" variant="default">
            Open dashboard
          </LinkButton>
        </AppCard>
        <AppCard
          description="Responsive shift tools for code checks and campaign rules."
          icon={<ScanLine />}
          title="Staff"
        >
          <LinkButton href="/staff/redeem" variant="default">
            Open staff view
          </LinkButton>
        </AppCard>
      </div>
    </PageShell>
  );
}
