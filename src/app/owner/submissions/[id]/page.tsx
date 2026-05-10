import { Eye, ShieldCheck } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AppCard, formatStatus, LinkButton, PageShell, PhotoPreview, Score, Status } from "@/components/bribeme/ui";
import { ensureDemoData } from "@/lib/demo-data";
import { getCampaign, getRewardByCode, getSubmission, listSubmissions } from "@/lib/repositories";

export const dynamic = "force-dynamic";

export default async function SubmissionReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  ensureDemoData();
  const { id } = await params;
  const fallback = listSubmissions()[0];
  const submission = id === "demo" ? fallback : getSubmission(id);
  const campaign = submission ? getCampaign(submission.campaignId) : null;
  const reward = submission?.rewardCode ? getRewardByCode(submission.rewardCode) : null;

  return (
    <PageShell
      role="owner"
      title="Submission review"
      description="Inspect the model result, reward state, and media saved through the backend."
      actions={
        <LinkButton href="/owner/approvals" variant="default">
          <Eye /> Open post queue
        </LinkButton>
      }
    >
      {submission && campaign ? (
        <AppCard icon={<Eye />} title={`${submission.patronName ?? "Guest"}'s submission`}>
          <div className="grid gap-5 xl:grid-cols-[320px_1fr]">
            <PhotoPreview
              href={`/api/submissions/${submission.id}/media`}
              linkLabel={`Open ${submission.patronName ?? "guest"} submission media`}
              src={`/api/submissions/${submission.id}/media`}
            />
            <div className="grid content-start gap-4">
              <div className="grid gap-3 md:grid-cols-3">
                <Score label="Quality" value={submission.qualityScore ?? 0} />
                <Score label="Task match" value={submission.taskMatchScore ?? 0} />
                <Score label="Safety" value={submission.safetyScore ?? 0} />
              </div>
              <Alert variant={submission.status === "rejected" ? "destructive" : "default"}>
                <ShieldCheck className="size-4" />
                <AlertTitle>Review result: {formatStatus(submission.status)}</AlertTitle>
                <AlertDescription>
                  {submission.decisionReason ?? "No model reason has been saved yet."}
                </AlertDescription>
              </Alert>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border p-3">
                  <p className="text-sm text-muted-foreground">Campaign</p>
                  <p className="mt-1 font-medium">{campaign.title}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-sm text-muted-foreground">Code</p>
                  <p className="mt-1 font-mono font-medium">{reward?.code ?? "Not issued"}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-sm text-muted-foreground">State</p>
                  <div className="mt-1">
                    <Status tone={submission.status === "approved" ? "good" : "neutral"}>
                      {formatStatus(reward?.status ?? submission.status)}
                    </Status>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </AppCard>
      ) : (
        <AppCard title="Submission not found">
          <LinkButton href="/owner">Back to dashboard</LinkButton>
        </AppCard>
      )}
    </PageShell>
  );
}
