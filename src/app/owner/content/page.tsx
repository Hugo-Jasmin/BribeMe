import { Download, Library, ShieldCheck } from "lucide-react";
import { DeleteContentButton } from "@/components/bribe/content-library-actions";
import { AppCard, formatStatus, Metric, PageShell, PhotoPreview, Status } from "@/components/bribe/ui";
import { Button } from "@/components/ui/button";
import { ensureDemoData } from "@/lib/demo-data";
import { getCampaign } from "@/lib/repositories";

export const dynamic = "force-dynamic";

export default async function ContentLibraryPage() {
  const { submissions } = await ensureDemoData();
  const approved = submissions.filter((submission) => submission.status === "approved");
  const campaignsBySubmission = new Map(
    await Promise.all(
      approved.map(async (submission) => [
        submission.id,
        await getCampaign(submission.campaignId),
      ] as const),
    ),
  );

  return (
    <PageShell
      role="owner"
      title="Content library"
      description="Approved customer content archive for downloading media and checking rights."
    >
      <div className="grid gap-5">
        <div className="grid gap-3 md:grid-cols-3">
          <Metric label="Approved media" value={String(approved.length)} />
          <Metric label="With rights" value={String(approved.length)} />
          <Metric label="Average score" value={averageScore(approved)} />
        </div>
        <AppCard
          description="Every item here has usage rights captured from the patron flow."
          icon={<Library />}
          title="Approved media"
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {approved.map((submission) => {
              const campaign = campaignsBySubmission.get(submission.id);
              return (
                <div className="space-y-3 rounded-lg border p-3" key={submission.id}>
                  <PhotoPreview
                    compact
                    href={`/owner/submissions/${submission.id}`}
                    linkLabel={`Open ${submission.patronName ?? "guest"} submission`}
                    src={`/api/submissions/${submission.id}/media`}
                  />
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{submission.patronName ?? "Guest"}</p>
                      <p className="truncate text-sm text-muted-foreground">
                        {formatStatus(submission.mediaType)} · {submission.qualityScore ?? "-"} score
                      </p>
                      <p className="truncate text-sm text-muted-foreground">
                        {campaign?.title ?? "Campaign unavailable"}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Button asChild size="icon-sm" variant="outline">
                        <a href={`/api/submissions/${submission.id}/media`} download>
                          <Download />
                          <span className="sr-only">Download</span>
                        </a>
                      </Button>
                      <DeleteContentButton
                        label={submission.patronName ?? "this image"}
                        submissionId={submission.id}
                      />
                    </div>
                  </div>
                  <Status tone="good" icon={<ShieldCheck />}>
                    Rights captured
                  </Status>
                </div>
              );
            })}
          </div>
        </AppCard>
      </div>
    </PageShell>
  );
}

function averageScore(submissions: Array<{ qualityScore: number | null }>) {
  const scores = submissions.flatMap((submission) =>
    submission.qualityScore == null ? [] : [submission.qualityScore],
  );
  if (!scores.length) return "-";
  return String(Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length));
}
