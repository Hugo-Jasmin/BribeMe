import fs from "node:fs/promises";
import path from "node:path";
import { getDataDir } from "../src/lib/config";

const baseUrl = process.env.BRIBE_BASE_URL ?? "http://localhost:3000";

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

async function main() {
  const campaignResponse = await fetch(`${baseUrl}/api/campaigns`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      venueName: "Bribe API Demo Cafe",
      venueSlug: `bribe-api-demo-${Date.now()}`,
      title: "Next round on us",
      challengePrompt:
        "Take a clear photo of your friend group at the table with drinks visible.",
      rewardLabel: "Next round on us",
      budgetCents: 10000,
      maxRedemptions: 20,
      validationThreshold: 70,
    }),
  });

  if (!campaignResponse.ok) {
    throw new Error(`Campaign creation failed: ${await campaignResponse.text()}`);
  }

  const { campaign } = (await campaignResponse.json()) as {
    campaign: { id: string };
  };

  const fixturePath = path.join(
    getDataDir(),
    "fixtures",
    "friend-group-drinks-realistic.png",
  );
  const image = await fs.readFile(fixturePath);

  const form = new FormData();
  form.set("campaignId", campaign.id);
  form.set("patronName", "API verifier");
  form.set(
    "media",
    new File([image], "friend-group-drinks-realistic.png", { type: "image/png" }),
  );

  const submissionResponse = await fetch(`${baseUrl}/api/submissions`, {
    method: "POST",
    body: form,
  });

  if (!submissionResponse.ok) {
    throw new Error(`Submission failed: ${await submissionResponse.text()}`);
  }

  const submissionPayload = (await submissionResponse.json()) as {
    submission: { id: string; status: string; rewardCode: string | null };
    validation: { approved: boolean; qualityScore: number; taskMatchScore: number };
    reward: { code: string; status: string } | null;
    socialPost: { id: string; status: string } | null;
  };

  if (!submissionPayload.validation.approved || !submissionPayload.reward) {
    throw new Error(`Expected approval and reward: ${JSON.stringify(submissionPayload)}`);
  }

  const approveResponse = await fetch(
    `${baseUrl}/api/social-posts/${submissionPayload.socialPost?.id}/approve`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markPosted: true }),
    },
  );

  if (!approveResponse.ok) {
    throw new Error(`Social approval failed: ${await approveResponse.text()}`);
  }

  const { socialPost } = (await approveResponse.json()) as {
    socialPost: { id: string; status: string };
  };

  console.log(
    JSON.stringify(
      {
        campaignId: campaign.id,
        submissionId: submissionPayload.submission.id,
        submissionStatus: submissionPayload.submission.status,
        rewardCode: submissionPayload.reward.code,
        rewardStatus: submissionPayload.reward.status,
        qualityScore: submissionPayload.validation.qualityScore,
        taskMatchScore: submissionPayload.validation.taskMatchScore,
        socialPostStatus: socialPost.status,
      },
      null,
      2,
    ),
  );
}
