import { z } from "zod";
import { getOpenRouterConfig } from "@/lib/config";
import type { Campaign, VerificationResult, Venue } from "@/lib/types";

const OpenRouterResponseSchema = z.object({
  choices: z.array(
    z.object({
      message: z.object({
        content: z.union([
          z.string(),
          z.array(
            z.object({
              type: z.string(),
              text: z.string().optional(),
            }),
          ),
        ]),
      }),
    }),
  ),
});

const VerificationResultSchema = z.object({
  approved: z.boolean(),
  qualityScore: z.number().int().min(0).max(100),
  taskMatchScore: z.number().int().min(0).max(100),
  safetyScore: z.number().int().min(0).max(100),
  decisionReason: z.string().min(1),
  observations: z.array(z.string()).default([]),
  description: z.string().min(1),
  caption: z.string().min(1),
  hashtags: z.array(z.string()).default([]),
});

const CaptionResultSchema = z.object({
  description: z.string().min(1),
  caption: z.string().min(1),
  hashtags: z.array(z.string()).default([]),
});

type VerifySubmissionInput = {
  venue: Venue;
  campaign: Campaign;
  imageDataUrl: string;
  fetchImpl?: typeof fetch;
};

type GenerateCaptionInput = VerifySubmissionInput & {
  currentDescription?: string;
  currentCaption?: string;
};

export async function verifyImageSubmission({
  venue,
  campaign,
  imageDataUrl,
  fetchImpl = fetch,
}: VerifySubmissionInput): Promise<VerificationResult> {
  const text = await requestImageJson({
    venue,
    campaign,
    imageDataUrl,
    fetchImpl,
    prompt: buildVerificationPrompt(venue, campaign),
    system:
      "You are a strict UGC campaign moderator for restaurants and cafes. Return only valid JSON.",
  });

  const result = VerificationResultSchema.parse(parseJsonFromText(text));
  return normalizeApproval(result, campaign.validationThreshold);
}

export async function generateSocialCaption({
  venue,
  campaign,
  imageDataUrl,
  currentDescription,
  currentCaption,
  fetchImpl = fetch,
}: GenerateCaptionInput) {
  const text = await requestImageJson({
    venue,
    campaign,
    imageDataUrl,
    fetchImpl,
    prompt: buildCaptionPrompt(venue, campaign, currentDescription, currentCaption),
    system:
      "You write concise, approval-ready social post descriptions and captions for restaurants and cafes. Return only valid JSON.",
  });

  return CaptionResultSchema.parse(parseJsonFromText(text));
}

async function requestImageJson({
  imageDataUrl,
  fetchImpl,
  prompt,
  system,
}: Omit<VerifySubmissionInput, "fetchImpl"> & {
  fetchImpl: typeof fetch;
  prompt: string;
  system: string;
}) {
  const config = getOpenRouterConfig();
  if (!config.apiKey) {
    throw new Error("OPENROUTER_API_KEY is not set");
  }

  const response = await fetchImpl("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": config.siteUrl,
      "X-Title": config.appName,
    },
    body: JSON.stringify({
      model: config.model,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: system,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt,
            },
            {
              type: "image_url",
              image_url: {
                url: imageDataUrl,
              },
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenRouter request failed: ${response.status} ${body}`);
  }

  const parsed = OpenRouterResponseSchema.parse(await response.json());
  const content = parsed.choices[0]?.message.content;
  const text =
    typeof content === "string"
      ? content
      : content
          .map((part) => part.text)
          .filter(Boolean)
          .join("\n");

  return text;
}

function buildVerificationPrompt(venue: Venue, campaign: Campaign) {
  return `
Evaluate this customer-submitted image for a local restaurant/cafe UGC reward campaign.

Venue: ${venue.name}
Campaign title: ${campaign.title}
Challenge: ${campaign.challengePrompt}
Reward if approved: ${campaign.rewardLabel}
Minimum approval threshold: ${campaign.validationThreshold}/100

Score the image against:
1. qualityScore: clear, usable, appealing enough for the business to post.
2. taskMatchScore: whether the image actually satisfies the challenge.
3. safetyScore: no explicit, hateful, violent, illegal, or brand-damaging content.

Approval rule:
- approved must be true only when all three scores meet or exceed the minimum approval threshold.
- Reject unclear, low-quality, unrelated, unsafe, or obviously staged-to-cheat submissions.

Also write:
- one short internal post description that factually describes the image for the owner.
- one concise public caption the owner could approve for social media, plus a few hashtags.

Return JSON exactly with this shape:
{
  "approved": boolean,
  "qualityScore": number,
  "taskMatchScore": number,
  "safetyScore": number,
  "decisionReason": string,
  "observations": string[],
  "description": string,
  "caption": string,
  "hashtags": string[]
}
`.trim();
}

function buildCaptionPrompt(
  venue: Venue,
  campaign: Campaign,
  currentDescription?: string,
  currentCaption?: string,
) {
  return `
Write fresh social post copy for this approved customer-submitted image.

Venue: ${venue.name}
Campaign title: ${campaign.title}
Challenge: ${campaign.challengePrompt}
Reward context: ${campaign.rewardLabel}
Current description: ${currentDescription?.trim() || "None"}
Current caption: ${currentCaption?.trim() || "None"}

Requirements:
- Create a short internal post description that factually describes the image for the owner.
- Create a new public caption that is meaningfully different from the current caption.
- Keep it concise and natural for a local restaurant/cafe.
- Do not mention discounts, free items, or reward mechanics.
- Include a few relevant hashtags.

Return JSON exactly with this shape:
{
  "description": string,
  "caption": string,
  "hashtags": string[]
}
`.trim();
}

function normalizeApproval(
  result: z.infer<typeof VerificationResultSchema>,
  threshold: number,
): VerificationResult {
  const approved =
    result.approved &&
    result.qualityScore >= threshold &&
    result.taskMatchScore >= threshold &&
    result.safetyScore >= threshold;

  return {
    ...result,
    approved,
  };
}

function parseJsonFromText(text: string) {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (fenced) return JSON.parse(fenced[1]);

    const firstBrace = trimmed.indexOf("{");
    const lastBrace = trimmed.lastIndexOf("}");
    if (firstBrace >= 0 && lastBrace > firstBrace) {
      return JSON.parse(trimmed.slice(firstBrace, lastBrace + 1));
    }

    throw new Error("OpenRouter response did not contain JSON");
  }
}
