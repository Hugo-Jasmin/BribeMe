import { Megaphone, Settings2 } from "lucide-react";
import { AppCard, formatStatus, LinkButton, Metric, PageShell, Status } from "@/components/bribeme/ui";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ensureDemoData } from "@/lib/demo-data";
import { countIssuedRewards } from "@/lib/repositories";

export const dynamic = "force-dynamic";

export default function CampaignsPage() {
  const { campaigns } = ensureDemoData();
  const active = campaigns.filter((campaign) => campaign.status === "active").length;
  const paused = campaigns.filter((campaign) => campaign.status === "paused").length;
  const totalRewards = campaigns.reduce((sum, campaign) => sum + countIssuedRewards(campaign.id), 0);

  return (
    <PageShell
      role="owner"
      title="Campaigns"
      description="Manage reward campaigns, limits, and performance."
      actions={
        <LinkButton href="/owner/campaigns/new" variant="default">
          <Megaphone /> New campaign
        </LinkButton>
      }
    >
      <div className="grid gap-5">
        <div className="grid gap-3 md:grid-cols-3">
          <Metric label="Active" value={String(active)} />
          <Metric label="Paused" value={String(paused)} />
          <Metric label="Rewards issued" value={String(totalRewards)} />
        </div>
        <AppCard
          description="Campaigns share the venue table code. Changing a campaign does not require a new printed code."
          title="All campaigns"
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reward</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{campaign.title}</p>
                      <p className="max-w-lg truncate text-sm text-muted-foreground">
                        {campaign.challengePrompt}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Status tone={campaign.status === "active" ? "good" : "muted"}>
                      {formatStatus(campaign.status)}
                    </Status>
                  </TableCell>
                  <TableCell>{campaign.rewardLabel}</TableCell>
                  <TableCell className="text-right">
                    <LinkButton href={`/owner/campaigns/${campaign.id}`}>
                      <Settings2 /> Manage
                    </LinkButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </AppCard>
      </div>
    </PageShell>
  );
}
