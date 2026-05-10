import fs from "node:fs";
import path from "node:path";
import { getUploadsDir } from "@/lib/config";
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

export function ensureDemoData(): DemoData {
  const venue = findVenueBySlug(DEMO_SLUG) ?? createVenue({ name: "Demo Cafe", slug: DEMO_SLUG });
  let campaigns = listCampaigns({ venueId: venue.id });

  if (!campaigns.length) {
    campaigns = createSeedCampaigns(venue.id);
  }

  let submissions = listSubmissions({ venueId: venue.id });
  if (!submissions.length) {
    seedSubmissions(venue, campaigns);
    submissions = listSubmissions({ venueId: venue.id });
  }

  return { venue, campaigns, submissions };
}

export function getPrimaryDemoCampaign() {
  const { campaigns } = ensureDemoData();
  return campaigns.find((campaign) => campaign.status === "active") ?? campaigns[0];
}

function createSeedCampaigns(venueId: string) {
  return [
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
  ];
}

function seedSubmissions(venue: Venue, campaigns: Campaign[]) {
  for (const [index, scenario] of demoScenarios.entries()) {
    const campaign = campaigns[index % campaigns.length];
    const mediaPath = copyDemoMedia(scenario.image, scenario.id);
    const submission = createSubmission({
      campaignId: campaign.id,
      venueId: venue.id,
      patronName: scenario.patron,
      mediaPath,
      mediaMime: "image/png",
      mediaType: "image",
      originalFilename: path.basename(scenario.image),
    });

    const approved = scenario.status === "Approved";
    const needsReview = scenario.status === "Pending";
    const reward = approved
      ? createReward({
          submissionId: submission.id,
          campaignId: campaign.id,
          venueId: venue.id,
          label: campaign.rewardLabel,
          expiresAt: daysFromNow(7),
        })
      : null;

    updateSubmissionVerification({
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
        caption: scenario.caption,
        hashtags: ["#DemoCafe", "#BribeMe"],
      },
    });

    if (approved) {
      createSocialPost({
        submissionId: submission.id,
        campaignId: campaign.id,
        venueId: venue.id,
        caption: `${scenario.caption}\n\n#DemoCafe #BribeMe`,
        channels: scenario.channels.map((channel) => channel.toLowerCase()),
      });
    }
  }
}

function copyDemoMedia(publicPath: string, id: string) {
  const filename = `${id}.png`;
  const relativePath = path.join("image", filename);
  const target = path.join(getUploadsDir(), relativePath);
  if (fs.existsSync(target)) return relativePath;

  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(path.join(process.cwd(), "public", publicPath), target);
  return relativePath;
}

function daysFromNow(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}
