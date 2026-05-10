import { Clock3 } from "lucide-react";
import { AppCard, CheckLine, LinkButton, PageShell, PhotoPreview } from "@/components/bribeme/ui";
import { Progress } from "@/components/ui/progress";
import { getSubmission } from "@/lib/repositories";

export const dynamic = "force-dynamic";

export default async function PatronCheckingPage({
  searchParams,
}: {
  searchParams: Promise<{ submissionId?: string }>;
}) {
  const { submissionId } = await searchParams;
  const submission = submissionId ? getSubmission(submissionId) : null;
  const done = submission?.status === "approved" || submission?.status === "rejected";
  const mediaSrc = submission ? `/api/submissions/${submission.id}/media` : undefined;

  return (
    <PageShell
      role="patron"
      title="Checking your submission"
      description="The upload is saved and the model result decides whether you see a reward or retry."
      actions={
        submission?.rewardCode ? (
          <LinkButton href={`/patron/reward?code=${submission.rewardCode}`} variant="default">
            Show reward
          </LinkButton>
        ) : null
      }
    >
      <AppCard icon={<Clock3 />} title={done ? "Verification complete" : "Verification in progress"}>
        <div className="grid gap-5">
          <PhotoPreview
            href={mediaSrc}
            linkLabel="Open your submitted media"
            src={mediaSrc}
          />
          <div className="grid content-start gap-5">
            <Progress value={done ? 100 : 68} />
            <div className="grid gap-2">
              <CheckLine checked={Boolean(submission)}>Upload saved</CheckLine>
              <CheckLine checked={done}>Image quality checked</CheckLine>
              <CheckLine checked={done}>Reward decision</CheckLine>
            </div>
            {submission?.rewardCode ? (
              <LinkButton href={`/patron/reward?code=${submission.rewardCode}`} variant="default">
                Show approved result
              </LinkButton>
            ) : submission?.status === "rejected" ? (
              <LinkButton href={`/patron/try-again?submissionId=${submission.id}`} variant="default">
                Show retry guidance
              </LinkButton>
            ) : null}
          </div>
        </div>
      </AppCard>
    </PageShell>
  );
}
