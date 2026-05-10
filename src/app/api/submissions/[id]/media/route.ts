import { getSubmission } from "@/lib/repositories";
import { getDemoPublicPathForStoredMedia } from "@/lib/demo-scenarios";
import { errorJson, json } from "@/lib/http";
import { readStoredMedia } from "@/lib/media";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const submission = getSubmission(id);
    if (!submission) return json({ error: "Submission not found" }, { status: 404 });

    const demoPublicPath = getDemoPublicPathForStoredMedia(submission.mediaPath);
    if (demoPublicPath) {
      return Response.redirect(new URL(demoPublicPath, _request.url), 307);
    }

    const media = await readStoredMedia(submission.mediaPath);
    return new Response(media, {
      headers: {
        "Content-Type": submission.mediaMime,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    return errorJson(error);
  }
}
