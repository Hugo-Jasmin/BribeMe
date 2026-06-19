import { BarChart3, ClipboardCheck, Gift, QrCode } from "lucide-react";
import Link from "next/link";
import { AppCard, formatStatus, LinkButton, Metric, PageShell, PhotoPreview, Status } from "@/components/bribe/ui";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { ensureDemoData } from "@/lib/demo-data";
import { countIssuedRewards, listRewards, listSocialPosts } from "@/lib/repositories";

export const dynamic = "force-dynamic";

export default async function OwnerDashboardPage() {
  const { venue, campaigns, submissions } = await ensureDemoData();
  const [rewards, socialPosts, issuedRewardsByCampaign] = await Promise.all([
    listRewards({ venueId: venue.id }),
    listSocialPosts({ venueId: venue.id }),
    Promise.all(campaigns.map((campaign) => countIssuedRewards(campaign.id))),
  ]);
  const pendingPosts = socialPosts.filter((post) => post.status === "draft").length;
  const activeCampaigns = campaigns.filter((campaign) => campaign.status === "active");
  const issued = rewards.filter((reward) => reward.status !== "void").length;
  const budgetUsed = Math.round(issued * 5);

  return (
    <PageShell
      role="owner"
      title={`${venue.name} owner dashboard`}
      description="Campaign health, pending approvals, issued rewards, and budget usage from the local backend."
    >
      <div className="grid gap-5">
        <div className="grid gap-3 md:grid-cols-4">
          <Metric label="Active campaigns" value={String(activeCampaigns.length)} />
          <Metric label="Pending posts" value={String(pendingPosts)} />
          <Metric label="Rewards issued" value={String(issued)} />
          <Metric label="Budget used" value={`$${budgetUsed}`} />
        </div>
        <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
          <AppCard
            description="Campaigns that are currently accepting submissions."
            icon={<BarChart3 />}
            title="Campaign performance"
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Rewards</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign, index) => {
                  const campaignRewards = issuedRewardsByCampaign[index];
                  const campaignHref = `/owner/campaigns/${campaign.id}`;

                  return (
                    <TableRow className="cursor-pointer" key={campaign.id}>
                      <TableCell className="p-0">
                        <Link className="block p-2 font-medium" href={campaignHref}>
                          {campaign.title}
                        </Link>
                      </TableCell>
                      <TableCell className="p-0">
                        <Link className="block p-2" href={campaignHref}>
                          <Status tone={campaign.status === "active" ? "good" : "muted"}>
                            {formatStatus(campaign.status)}
                          </Status>
                        </Link>
                      </TableCell>
                      <TableCell className="p-0">
                        <Link className="block p-2" href={campaignHref}>
                          {campaignRewards} / {campaign.maxRedemptions ?? "no cap"}
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </AppCard>
          <AppCard description="A compact operating summary for today." icon={<Gift />} title="Budget and rewards">
            <div className="space-y-5">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-medium">Estimated budget</p>
                  <p className="font-mono text-sm">${budgetUsed} / $750</p>
                </div>
                <Progress value={Math.min(100, (budgetUsed / 750) * 100)} />
              </div>
              <div className="grid gap-3">
                <LinkButton href="/owner/rewards">
                  <Gift /> Open reward ledger
                </LinkButton>
                <LinkButton href="/owner/table-code">
                  <QrCode /> View table code
                </LinkButton>
              </div>
            </div>
          </AppCard>
        </div>
        <AppCard description="Recent uploads stored in Turso and served by the media endpoint." icon={<ClipboardCheck />} title="Recent submissions">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {submissions.slice(0, 10).map((submission) => (
              <div className="space-y-2" key={submission.id}>
                <PhotoPreview
                  compact
                  href={`/owner/submissions/${submission.id}`}
                  linkLabel={`Open ${submission.patronName ?? "guest"} submission`}
                  src={`/api/submissions/${submission.id}/media`}
                />
                <div>
                  <p className="truncate text-sm font-medium">
                    {submission.patronName ?? "Guest"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatStatus(submission.status)} · {submission.qualityScore ?? "-"} score
                  </p>
                </div>
              </div>
            ))}
          </div>
        </AppCard>
      </div>
    </PageShell>
  );
}
