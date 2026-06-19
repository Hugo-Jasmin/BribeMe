import { getVenue } from "@/lib/repositories";
import { errorJson, json } from "@/lib/http";
import { saveUploadedMedia, toDataUrl } from "@/lib/media";
import { verifyImageSubmission } from "@/lib/openrouter";
import {
  countIssuedRewards,
  createReward,
  createSocialPost,
  createSubmission,
  getCampaign,
  listSubmissions,
  updateSubmissionVerification,
} from "@/lib/repositories";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  return json({
    submissions: await listSubmissions({
      campaignId: url.searchParams.get("campaignId") ?? undefined,
      venueId: url.searchParams.get("venueId") ?? undefined,
    }),
  });
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const campaignId = getRequiredText(form, "campaignId");
    const patronName = getOptionalText(form, "patronName");
    const media = form.get("media");

    if (!(media instanceof File)) {
      return json({ error: "media file is required" }, { status: 400 });
    }

    const campaign = await getCampaign(campaignId);
    if (!campaign) return json({ error: "Campaign not found" }, { status: 404 });
    if (campaign.status !== "active") {
      return json({ error: "Campaign is not active" }, { status: 409 });
    }

    const venue = await getVenue(campaign.venueId);
    if (!venue) return json({ error: "Venue not found" }, { status: 404 });

    if (
      campaign.maxRedemptions !== null &&
      (await countIssuedRewards(campaign.id)) >= campaign.maxRedemptions
    ) {
      return json({ error: "Campaign reward limit has been reached" }, { status: 409 });
    }

    const stored = await saveUploadedMedia(media);
    const submission = await createSubmission({
      campaignId: campaign.id,
      venueId: venue.id,
      patronName,
      mediaPath: stored.relativePath,
      mediaMime: stored.mimeType,
      mediaType: stored.mediaType,
      originalFilename: stored.originalFilename,
    });

    if (stored.mediaType !== "image") {
      return json(
        {
          submission,
          validation: null,
          reward: null,
          socialPost: null,
          warning: "Video storage is wired, but LLM video validation is not enabled in this demo yet.",
        },
        { status: 202 },
      );
    }

    const validation = await verifyImageSubmission({
      venue,
      campaign,
      imageDataUrl: toDataUrl(stored.bytes, stored.mimeType),
    });

    const reward = validation.approved
      ? await createReward({
          submissionId: submission.id,
          campaignId: campaign.id,
          venueId: venue.id,
          label: campaign.rewardLabel,
          expiresAt: expiryDaysFromNow(7),
        })
      : null;

    const updatedSubmission = await updateSubmissionVerification({
      submissionId: submission.id,
      status: validation.approved ? "approved" : "rejected",
      result: validation,
      rewardCode: reward?.code,
    });

    const socialPost = validation.approved
      ? await createSocialPost({
          submissionId: submission.id,
          campaignId: campaign.id,
          venueId: venue.id,
          description: validation.description,
          caption: captionWithHashtags(validation.caption, validation.hashtags),
        })
      : null;

    return json(
      {
        submission: updatedSubmission,
        validation,
        reward,
        socialPost,
      },
      { status: 201 },
    );
  } catch (error) {
    return errorJson(error);
  }
}

function getRequiredText(form: FormData, key: string) {
  const value = form.get(key);
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${key} is required`);
  }
  return value.trim();
}

function getOptionalText(form: FormData, key: string) {
  const value = form.get(key);
  if (typeof value !== "string" || !value.trim()) return null;
  return value.trim();
}

function expiryDaysFromNow(days: number) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + days);
  return expiresAt.toISOString();
}

function captionWithHashtags(caption: string, hashtags: string[]) {
  const normalizedTags = hashtags
    .map((tag) => tag.trim())
    .filter(Boolean)
    .map((tag) => (tag.startsWith("#") ? tag : `#${tag}`));

  return [caption.trim(), normalizedTags.join(" ")].filter(Boolean).join("\n\n");
}
