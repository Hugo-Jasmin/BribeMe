import { Coffee } from "lucide-react";
import { AppCard, LinkButton, PageShell, Status } from "@/components/bribe/ui";
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

export default async function StaffCampaignsPage() {
  const { campaigns } = await ensureDemoData();
  const issuedRewardsByCampaign = await Promise.all(
    campaigns.map((campaign) => countIssuedRewards(campaign.id)),
  );

  return (
    <PageShell
      role="staff"
      title="Active campaigns"
      description="A shift view so staff know what customers can claim and how many rewards remain."
      actions={
        <LinkButton href="/staff/redeem" variant="default">
          Redeem code
        </LinkButton>
      }
    >
      <AppCard description="Operational and compact for counter use." icon={<Coffee />} title="Campaigns on shift">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Campaign</TableHead>
              <TableHead>Reward</TableHead>
              <TableHead>Used</TableHead>
              <TableHead className="text-right">State</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaigns.map((campaign, index) => (
              <TableRow key={campaign.id}>
                <TableCell>{campaign.title}</TableCell>
                <TableCell>{campaign.rewardLabel}</TableCell>
                <TableCell>
                  {issuedRewardsByCampaign[index]} / {campaign.maxRedemptions ?? "no cap"}
                </TableCell>
                <TableCell className="text-right">
                  <Status tone={campaign.status === "active" ? "good" : "muted"}>
                    {campaign.status}
                  </Status>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </AppCard>
    </PageShell>
  );
}
