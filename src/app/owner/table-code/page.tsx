import { ExternalLink, QrCode } from "lucide-react";
import { AppCard, LinkButton, PageShell } from "@/components/bribeme/ui";
import { ensureDemoData } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

export default function OwnerTableCodePage() {
  const { venue, campaigns } = ensureDemoData();
  const activeCampaigns = campaigns.filter((campaign) => campaign.status === "active");

  return (
    <PageShell
      role="owner"
      title="Table code"
      description="One venue code for table tents, menus, receipts, and staff handouts."
      actions={
        <LinkButton href="/patron/qr" variant="default">
          <QrCode /> Open guest landing
        </LinkButton>
      }
    >
      <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
        <AppCard title={`${venue.name} table code`}>
          <div className="grid aspect-square place-items-center rounded-lg border bg-muted">
            <QrCode className="size-32" />
          </div>
          <div className="mt-4 grid gap-2">
            <LinkButton href="/patron/qr">
              <ExternalLink /> Open guest landing
            </LinkButton>
          </div>
        </AppCard>
        <AppCard
          description="The same code can show all currently active rewards, so campaigns can change without reprinting anything."
          title="How this works"
        >
          <div className="grid gap-4 md:grid-cols-3">
            <Detail label="Active rewards" value={String(activeCampaigns.length)} />
            <Detail label="Destination" value="Guest reward landing" />
            <Detail label="Print status" value="Reusable" />
          </div>
          <div className="mt-5 rounded-lg border p-4">
            <p className="text-sm font-medium">Current guest choices</p>
            <div className="mt-3 grid gap-2">
              {activeCampaigns.map((campaign) => (
                <div className="flex items-center justify-between gap-3 text-sm" key={campaign.id}>
                  <span className="truncate">{campaign.rewardLabel}</span>
                  <span className="text-muted-foreground">{campaign.title}</span>
                </div>
              ))}
            </div>
          </div>
        </AppCard>
      </div>
    </PageShell>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}
