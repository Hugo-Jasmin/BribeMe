import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { closeDbForTests } from "@/lib/db";
import {
  createCampaign,
  createReward,
  createSubmission,
  createVenue,
  deleteSubmission,
  getRewardByCode,
  redeemReward,
  listRewards,
  listSocialPosts,
  updateVenue,
  updateSubmissionVerification,
  createSocialPost,
  deleteCampaign,
  listCampaigns,
  listSubmissions,
} from "@/lib/repositories";

let tempDir: string;

beforeEach(async () => {
  tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "bribe-test-"));
  process.env.BRIBE_DATA_DIR = tempDir;
  await closeDbForTests();
});

afterEach(async () => {
  await closeDbForTests();
  fs.rmSync(tempDir, { recursive: true, force: true });
  delete process.env.BRIBE_DATA_DIR;
});

describe("repositories", () => {
  it("updates a venue name without changing its slug", async () => {
    const venue = await createVenue({ name: "Demo Cafe", slug: "demo-cafe" });

    const updated = await updateVenue(venue.id, { name: "Harbour Lane Cafe" });

    expect(updated?.name).toBe("Harbour Lane Cafe");
    expect(updated?.slug).toBe("demo-cafe");
  });

  it("creates a campaign, approves a submission, issues and redeems a reward", async () => {
    const venue = await createVenue({ name: "Demo Cafe" });
    const campaign = await createCampaign({
      venueId: venue.id,
      title: "Coffee shot",
      challengePrompt: "Take a photo with your coffee.",
      rewardLabel: "Free croissant",
      maxRedemptions: 5,
    });

    const submission = await createSubmission({
      campaignId: campaign.id,
      venueId: venue.id,
      patronName: "Pat",
      mediaPath: "image/demo.png",
      mediaMime: "image/png",
      mediaType: "image",
      originalFilename: "demo.png",
    });

    const reward = await createReward({
      submissionId: submission.id,
      campaignId: campaign.id,
      venueId: venue.id,
      label: campaign.rewardLabel,
    });

    const updated = await updateSubmissionVerification({
      submissionId: submission.id,
      status: "approved",
      rewardCode: reward.code,
      result: {
        approved: true,
        qualityScore: 91,
        taskMatchScore: 94,
        safetyScore: 100,
        decisionReason: "Clear image that matches the challenge.",
        observations: ["Coffee is visible."],
        description: "Coffee is visible on the table.",
        caption: "Coffee time at Demo Cafe.",
        hashtags: ["#DemoCafe"],
      },
    });

    expect(updated?.status).toBe("approved");
    expect(updated?.rewardCode).toBe(reward.code);
    expect((await getRewardByCode(reward.code))?.status).toBe("issued");
    expect((await redeemReward(reward.code))?.status).toBe("redeemed");
  });

  it("deletes a submission and cascades related library records", async () => {
    const venue = await createVenue({ name: "Demo Cafe" });
    const campaign = await createCampaign({
      venueId: venue.id,
      title: "Coffee shot",
      challengePrompt: "Take a photo with your coffee.",
      rewardLabel: "Free croissant",
    });
    const submission = await createSubmission({
      campaignId: campaign.id,
      venueId: venue.id,
      mediaPath: "image/demo.png",
      mediaMime: "image/png",
      mediaType: "image",
    });

    await createReward({
      submissionId: submission.id,
      campaignId: campaign.id,
      venueId: venue.id,
      label: campaign.rewardLabel,
    });
    await createSocialPost({
      submissionId: submission.id,
      campaignId: campaign.id,
      venueId: venue.id,
      description: "Coffee is visible on the table.",
      caption: "Coffee time.",
    });

    expect((await deleteSubmission(submission.id))?.id).toBe(submission.id);
    expect(await listRewards({ venueId: venue.id })).toEqual([]);
    expect(await listSocialPosts({ venueId: venue.id })).toEqual([]);
    expect(await deleteSubmission(submission.id)).toBeNull();
  });

  it("deletes a campaign and cascades related submissions", async () => {
    const venue = await createVenue({ name: "Demo Cafe" });
    const campaign = await createCampaign({
      venueId: venue.id,
      title: "Coffee shot",
      challengePrompt: "Take a photo with your coffee.",
      rewardLabel: "Free croissant",
    });
    const submission = await createSubmission({
      campaignId: campaign.id,
      venueId: venue.id,
      mediaPath: "image/demo.png",
      mediaMime: "image/png",
      mediaType: "image",
    });

    await createReward({
      submissionId: submission.id,
      campaignId: campaign.id,
      venueId: venue.id,
      label: campaign.rewardLabel,
    });
    await createSocialPost({
      submissionId: submission.id,
      campaignId: campaign.id,
      venueId: venue.id,
      description: "Coffee is visible on the table.",
      caption: "Coffee time.",
    });

    expect((await deleteCampaign(campaign.id))?.id).toBe(campaign.id);
    expect(await listCampaigns({ venueId: venue.id })).toEqual([]);
    expect(await listSubmissions({ venueId: venue.id })).toEqual([]);
    expect(await listRewards({ venueId: venue.id })).toEqual([]);
    expect(await listSocialPosts({ venueId: venue.id })).toEqual([]);
    expect(await deleteCampaign(campaign.id)).toBeNull();
  });
});
