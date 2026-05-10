import { AlertCircle, Camera } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AppCard, LinkButton, PageShell, PhotoPreview } from "@/components/bribeme/ui";
import { getSubmission } from "@/lib/repositories";

export const dynamic = "force-dynamic";

export default async function PatronTryAgainPage({
  searchParams,
}: {
  searchParams: Promise<{ submissionId?: string }>;
}) {
  const { submissionId } = await searchParams;
  const submission = submissionId ? getSubmission(submissionId) : null;
  const mediaSrc = submission ? `/api/submissions/${submission.id}/media` : undefined;
  const retryHref = submission
    ? `/patron/submit?campaignId=${submission.campaignId}`
    : "/patron";

  return (
    <PageShell
      role="patron"
      title="Try one more photo"
      description="The reason comes from the backend verification result."
      actions={
        <LinkButton href={retryHref} variant="default">
          <Camera /> Retake photo
        </LinkButton>
      }
    >
      <AppCard icon={<AlertCircle />} title="Submission not approved">
        <div className="grid gap-5">
          <PhotoPreview
            href={mediaSrc}
            linkLabel="Open your submitted media"
            src={mediaSrc}
          />
          <div className="grid content-start gap-4">
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertTitle>We could not verify this photo</AlertTitle>
              <AlertDescription>
                {submission?.decisionReason ??
                  "Take another photo with the table, reward item, and venue context visible."}
              </AlertDescription>
            </Alert>
            <div className="rounded-lg border p-4">
              <p className="font-medium">What to change</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Keep the item in frame, avoid blur, and make sure the photo is taken inside the venue.
              </p>
            </div>
            <LinkButton href={retryHref} variant="default">
              <Camera /> Try again
            </LinkButton>
          </div>
        </div>
      </AppCard>
    </PageShell>
  );
}
