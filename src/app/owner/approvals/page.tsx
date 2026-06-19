import { ClipboardCheck } from "lucide-react";
import Link from "next/link";
import { AppCard, formatStatus, PageShell, PhotoPreview, Score, Status } from "@/components/bribe/ui";
import { SocialApprovalButton } from "@/components/bribe/forms";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ensureDemoData } from "@/lib/demo-data";
import { getSubmission, listSocialPosts } from "@/lib/repositories";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ApprovalsPage({
  searchParams,
}: {
  searchParams: Promise<{ postId?: string }>;
}) {
  const { postId } = await searchParams;
  const { venue } = await ensureDemoData();
  const posts = await listSocialPosts({ venueId: venue.id });
  const queue = (
    await Promise.all(
      posts.map(async (item) => ({
        post: item,
        submission: await getSubmission(item.submissionId),
      })),
    )
  ).filter((item) => item.submission);
  const selectedItem = postId ? queue.find((item) => item.post.id === postId) : null;
  const activeItem = selectedItem ?? queue.find((item) => item.post.status === "draft") ?? queue[0];
  const post = activeItem?.post;
  const submission = activeItem?.submission ?? null;

  return (
    <PageShell
      role="owner"
      title="Post queue"
      description="Owners approve generated post descriptions and captions before anything is marked as posted."
    >
      {post && submission ? (
        <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(260px,320px)_minmax(0,1fr)]">
          <AppCard
            description={`${queue.filter((item) => item.post.status === "draft").length} posts need review.`}
            icon={<ClipboardCheck />}
            title="Queue"
          >
            <div className="grid gap-2">
              {queue.map((item) => (
                <Link
                  aria-current={item.post.id === post?.id ? "page" : undefined}
                  className={cn(
                    "block rounded-lg border p-3 transition-colors hover:border-ring hover:bg-accent/50 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                    item.post.id === post?.id && "border-ring bg-accent/60",
                  )}
                  href={`/owner/approvals?postId=${encodeURIComponent(item.post.id)}`}
                  key={item.post.id}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-medium">
                      {item.submission?.patronName ?? "Guest"}
                    </p>
                    <Status tone={item.post.status === "draft" ? "neutral" : "good"}>
                      {formatStatus(item.post.status)}
                    </Status>
                  </div>
                  <p className="mt-1 truncate text-sm text-muted-foreground">
                    {item.submission?.qualityScore ?? "-"} score · {item.submission?.mediaType}
                  </p>
                </Link>
              ))}
            </div>
          </AppCard>
          <AppCard
            description="Approval changes local post state in the database. No real social accounts are connected."
            title="Review post"
          >
            <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(260px,320px)_minmax(0,1fr)]">
              <PhotoPreview
                href={`/owner/submissions/${submission.id}`}
                linkLabel={`Open ${submission.patronName ?? "guest"} submission`}
                src={`/api/submissions/${submission.id}/media`}
              />
              <div className="grid min-w-0 content-start gap-4">
                <div className="grid min-w-0 grid-cols-[repeat(auto-fit,minmax(min(100%,8.5rem),1fr))] gap-3">
                  <Score label="Quality" value={submission.qualityScore ?? 0} />
                  <Score label="Task match" value={submission.taskMatchScore ?? 0} />
                  <Score label="Safety" value={submission.safetyScore ?? 0} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="post-description">Post description</Label>
                  <Textarea
                    className="min-h-20"
                    defaultValue={post.description}
                    id="post-description"
                    readOnly
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="post-caption">Caption</Label>
                  <Textarea
                    className="min-h-32"
                    defaultValue={post.caption}
                    id="post-caption"
                    readOnly
                  />
                </div>
                <div className="grid min-w-0 grid-cols-[repeat(auto-fit,minmax(min(100%,7.5rem),1fr))] gap-2">
                  <Status
                    className="w-full justify-center text-center"
                    tone={post.status === "draft" ? "neutral" : "good"}
                  >
                    {formatStatus(post.status)}
                  </Status>
                  <Status className="w-full justify-center text-center" tone="good">
                    Rights captured
                  </Status>
                  <Status className="w-full justify-center text-center" tone="muted">
                    Owner approval required
                  </Status>
                </div>
                <SocialApprovalButton post={post} />
              </div>
            </div>
          </AppCard>
        </div>
      ) : (
        <AppCard title="No posts ready">
          <p className="text-sm text-muted-foreground">
            Approved patron submissions will create draft posts here.
          </p>
        </AppCard>
      )}
    </PageShell>
  );
}
