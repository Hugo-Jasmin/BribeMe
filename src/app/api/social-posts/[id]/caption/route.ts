import { errorJson, json } from "@/lib/http";
import { readStoredMedia, toDataUrl } from "@/lib/media";
import { generateSocialCaption } from "@/lib/openrouter";
import {
  getCampaign,
  getSocialPost,
  getSubmission,
  getVenue,
  updateDraftSocialPostCopy,
} from "@/lib/repositories";

export const runtime = "nodejs";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const post = await getSocialPost(id);
    if (!post) return json({ error: "Social post not found" }, { status: 404 });
    if (post.status !== "draft") {
      return json({ error: "Only draft posts can be regenerated" }, { status: 409 });
    }

    const submission = await getSubmission(post.submissionId);
    if (!submission) return json({ error: "Submission not found" }, { status: 404 });
    if (submission.mediaType !== "image") {
      return json({ error: "Post copy regeneration only supports images" }, { status: 409 });
    }

    const campaign = await getCampaign(post.campaignId);
    if (!campaign) return json({ error: "Campaign not found" }, { status: 404 });

    const venue = await getVenue(post.venueId);
    if (!venue) return json({ error: "Venue not found" }, { status: 404 });

    const bytes = await readStoredMedia(submission.mediaPath);
    const result = await generateSocialCaption({
      venue,
      campaign,
      imageDataUrl: toDataUrl(bytes, submission.mediaMime),
      currentDescription: post.description,
      currentCaption: post.caption,
    });

    const socialPost = await updateDraftSocialPostCopy({
      id,
      description: result.description,
      caption: captionWithHashtags(result.caption, result.hashtags),
    });

    return json({ socialPost });
  } catch (error) {
    return errorJson(error);
  }
}

function captionWithHashtags(caption: string, hashtags: string[]) {
  const normalizedTags = hashtags
    .map((tag) => tag.trim())
    .filter(Boolean)
    .map((tag) => (tag.startsWith("#") ? tag : `#${tag}`));

  return [caption.trim(), normalizedTags.join(" ")].filter(Boolean).join("\n\n");
}
