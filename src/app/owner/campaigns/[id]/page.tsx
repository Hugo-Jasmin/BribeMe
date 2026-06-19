import { DeleteCampaignButton } from "@/components/bribe/campaign-actions";
import { AppCard, formatStatus, LinkButton, PageShell, Status } from "@/components/bribe/ui";
import { Progress } from "@/components/ui/progress";
import { ensureDemoData, getPrimaryDemoCampaign } from "@/lib/demo-data";
import { countIssuedRewards, getCampaign, listSubmissions } from "@/lib/repositories";

export const dynamic = "force-dynamic";

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { venue } = await ensureDemoData();
  const { id } = await params;
  const campaign = id === "demo" ? await getPrimaryDemoCampaign() : await getCampaign(id);
  const [submissions, rewardsIssued] = campaign
    ? await Promise.all([
        listSubmissions({ campaignId: campaign.id }),
        countIssuedRewards(campaign.id),
      ])
    : [[], 0] as const;
  const approvals = submissions.filter((submission) => submission.status === "approved").length;
  const rewardsLeft =
    campaign?.maxRedemptions == null ? "No cap" : String(Math.max(0, campaign.maxRedemptions - rewardsIssued));
  const rewardUsage = campaign?.maxRedemptions
    ? Math.min(100, (rewardsIssued / campaign.maxRedemptions) * 100)
    : 0;

  return (
    <PageShell
      role="owner"
      title={campaign?.title ?? "Campaign not found"}
      description="Campaign performance, rewards, and submissions."
      actions={
        campaign ? (
          <DeleteCampaignButton
            campaignId={campaign.id}
            redirectTo="/owner/campaigns"
            title={campaign.title}
          />
        ) : undefined
      }
    >
      {campaign ? (
        <section className="overflow-hidden rounded-lg border bg-card">
          <div className="grid gap-5 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Status tone={campaign.status === "active" ? "good" : "muted"}>
                  {formatStatus(campaign.status)}
                </Status>
                <p className="text-sm text-muted-foreground">{venue.name}</p>
              </div>
              <div className="mt-4 max-w-4xl">
                <p className="text-sm text-muted-foreground">Customer prompt</p>
                <p className="mt-1 text-lg font-medium leading-7">{campaign.challengePrompt}</p>
              </div>
              <p className="mt-3 text-sm">
                <span className="text-muted-foreground">Reward:</span>{" "}
                <span className="font-medium">{campaign.rewardLabel}</span>
              </p>
            </div>

            <div className="min-w-0 lg:w-72">
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="text-sm font-medium">Usage</p>
                <p className="font-mono text-sm text-muted-foreground">
                  {rewardsIssued} / {campaign.maxRedemptions ?? "no cap"}
                </p>
              </div>
              <Progress value={rewardUsage} />
            </div>
          </div>

          <div className="grid border-y bg-muted/20 sm:grid-cols-5">
            <CampaignMetric label="Uploads" value={String(submissions.length)} />
            <CampaignMetric label="Approved" value={String(approvals)} />
            <CampaignMetric label="Rewards issued" value={String(rewardsIssued)} />
            <CampaignMetric label="Limit" value={campaign.maxRedemptions == null ? "No cap" : String(campaign.maxRedemptions)} />
            <CampaignMetric label="Left" value={rewardsLeft} />
          </div>

          <div className="p-4 sm:p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base font-semibold">Submissions</h2>
              <p className="text-sm text-muted-foreground">{submissions.length} total</p>
            </div>
            <div className="divide-y rounded-md border">
              {submissions.map((submission) => (
                <div
                  className="grid gap-3 p-3 sm:grid-cols-[minmax(0,1.1fr)_140px_100px_minmax(0,1fr)_auto] sm:items-center"
                  key={submission.id}
                >
                  <p className="min-w-0 truncate font-medium">{submission.patronName ?? "Guest"}</p>
                  <Status tone={statusTone(submission.status)}>{formatStatus(submission.status)}</Status>
                  <p className="font-mono text-sm text-muted-foreground">
                    Score {submission.qualityScore ?? "-"}
                  </p>
                  <p className="min-w-0 truncate font-mono text-sm text-muted-foreground">
                    {submission.rewardCode ?? "Reward waiting"}
                  </p>
                  <LinkButton href={`/owner/submissions/${submission.id}`}>Review</LinkButton>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <AppCard title="Campaign not found">
          <LinkButton href="/owner">Back to dashboard</LinkButton>
        </AppCard>
      )}
    </PageShell>
  );
}

function CampaignMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b p-3 sm:border-b-0 sm:border-r sm:last:border-r-0">
      <p className="text-xs font-medium uppercase text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
    </div>
  );
}

function statusTone(status: string) {
  if (status === "approved") return "good";
  if (status === "rejected") return "bad";
  if (status === "needs_review") return "neutral";
  return "muted";
}
