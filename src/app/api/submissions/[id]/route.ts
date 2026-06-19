import { errorJson, json } from "@/lib/http";
import { deleteStoredMedia } from "@/lib/media";
import { deleteSubmission } from "@/lib/repositories";

export const runtime = "nodejs";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const submission = await deleteSubmission(id);
    if (!submission) return json({ error: "Submission not found" }, { status: 404 });

    await deleteStoredMedia(submission.mediaPath);
    return json({ submission });
  } catch (error) {
    return errorJson(error);
  }
}
