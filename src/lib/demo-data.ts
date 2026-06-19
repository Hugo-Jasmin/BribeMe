import path from "node:path";
import { demoScenarios } from "@/lib/demo-scenarios";
import {
  createCampaign,
  createReward,
  createSocialPost,
  createSubmission,
  createVenue,
  findVenueBySlug,
  listCampaigns,
  listSubmissions,
  updateSubmissionVerification,
} from "@/lib/repositories";
import type { Campaign, Submission, Venue } from "@/lib/types";

export type DemoData = {
  venue: Venue;
  campaigns: Campaign[];
  submissions: Submission[];
};

const DEMO_SLUG = "demo-cafe";

export async function ensureDemoData(): Promise<DemoData> {
  const venue =
    (await findVenueBySlug(DEMO_SLUG)) ??
    (await createVenue({ name: "Demo Cafe", slug: DEMO_SLUG }));
  let campaigns = await listCampaigns({ venueId: venue.id });

  if (!campaigns.length) {
    campaigns = await createSeedCampaigns(venue.id);
  }

  let submissions = await listSubmissions({ venueId: venue.id });
  if (!submissions.length) {
    await seedSubmissions(venue, campaigns);
    submissions = await listSubmissions({ venueId: venue.id });
  }

  return { venue, campaigns, submissions };
}

export async function getPrimaryDemoCampaign() {
  const { campaigns } = await ensureDemoData();
  return campaigns.find((campaign) => campaign.status === "active") ?? campaigns[0];
}

async function createSeedCampaigns(venueId: string) {
  return Promise.all([
    createCampaign({
      venueId,
      title: "Coffee and croissant",
      challengePrompt: "Take a photo of your coffee.",
      rewardLabel: "Free croissant",
      budgetCents: 10000,
      maxRedemptions: 20,
      validationThreshold: 70,
      status: "active",
    }),
    createCampaign({
      venueId,
      title: "Friends with drinks",
      challengePrompt: "Take a clear photo of your group at the table with drinks visible.",
      rewardLabel: "Next round on us",
      budgetCents: 25000,
      maxRedemptions: 10,
      validationThreshold: 75,
      status: "active",
    }),
    createCampaign({
      venueId,
      title: "Weekend table",
      challengePrompt: "Photograph a plated dish or brunch spread as it arrives at the table.",
      rewardLabel: "10% off your next visit",
      budgetCents: 18000,
      maxRedemptions: 40,
      validationThreshold: 72,
      status: "paused",
    }),
  ]);
}

async function seedSubmissions(venue: Venue, campaigns: Campaign[]) {
  for (const [index, scenario] of demoScenarios.entries()) {
    const campaign = campaigns[index % campaigns.length];
    const submission = await createSubmission({
      campaignId: campaign.id,
      venueId: venue.id,
      patronName: scenario.patron,
      mediaPath: scenario.image,
      mediaMime: "image/png",
      mediaType: "image",
      originalFilename: path.basename(scenario.image),
    });

    const approved = scenario.status === "Approved";
    const needsReview = scenario.status === "Pending";
    const reward = approved
      ? await createReward({
          submissionId: submission.id,
          campaignId: campaign.id,
          venueId: venue.id,
          label: campaign.rewardLabel,
          expiresAt: daysFromNow(7),
        })
      : null;

    await updateSubmissionVerification({
      submissionId: submission.id,
      status: approved ? "approved" : needsReview ? "needs_review" : "rejected",
      rewardCode: reward?.code,
      result: {
        approved,
        qualityScore: scenario.score,
        taskMatchScore: Math.min(100, scenario.score + 4),
        safetyScore: approved || needsReview ? 95 : 62,
        decisionReason: approved
          ? `The image is clear and matches "${campaign.challengePrompt}".`
          : needsReview
            ? "The image is usable, but the owner should confirm it fits the campaign before posting."
            : "The image does not clearly satisfy the campaign prompt.",
        observations: [scenario.challenge],
        description: scenario.challenge,
        caption: scenario.caption,
        hashtags: ["#DemoCafe", "#Bribe"],
      },
    });

    if (approved) {
      await createSocialPost({
        submissionId: submission.id,
        campaignId: campaign.id,
        venueId: venue.id,
        description: scenario.challenge,
        caption: `${scenario.caption}\n\n#DemoCafe #Bribe`,
        channels: scenario.channels.map((channel) => channel.toLowerCase()),
      });
    }
  }
}

function daysFromNow(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}
