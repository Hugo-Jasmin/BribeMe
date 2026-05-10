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
} from "@/lib/repositories";

let tempDir: string;

beforeEach(() => {
  tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "bribeme-test-"));
  process.env.BRIBEME_DATA_DIR = tempDir;
  closeDbForTests();
});

afterEach(() => {
  closeDbForTests();
  fs.rmSync(tempDir, { recursive: true, force: true });
  delete process.env.BRIBEME_DATA_DIR;
});

describe("repositories", () => {
  it("updates a venue name without changing its slug", () => {
    const venue = createVenue({ name: "Demo Cafe", slug: "demo-cafe" });

    const updated = updateVenue(venue.id, { name: "Harbour Lane Cafe" });

    expect(updated?.name).toBe("Harbour Lane Cafe");
    expect(updated?.slug).toBe("demo-cafe");
  });

  it("creates a campaign, approves a submission, issues and redeems a reward", () => {
    const venue = createVenue({ name: "Demo Cafe" });
    const campaign = createCampaign({
      venueId: venue.id,
      title: "Coffee shot",
      challengePrompt: "Take a photo with your coffee.",
      rewardLabel: "Free croissant",
      maxRedemptions: 5,
    });

    const submission = createSubmission({
      campaignId: campaign.id,
      venueId: venue.id,
      patronName: "Pat",
      mediaPath: "image/demo.png",
      mediaMime: "image/png",
      mediaType: "image",
      originalFilename: "demo.png",
    });

    const reward = createReward({
      submissionId: submission.id,
      campaignId: campaign.id,
      venueId: venue.id,
      label: campaign.rewardLabel,
    });

    const updated = updateSubmissionVerification({
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
        caption: "Coffee time at Demo Cafe.",
        hashtags: ["#DemoCafe"],
      },
    });

    expect(updated?.status).toBe("approved");
    expect(updated?.rewardCode).toBe(reward.code);
    expect(getRewardByCode(reward.code)?.status).toBe("issued");
    expect(redeemReward(reward.code)?.status).toBe("redeemed");
  });

  it("deletes a submission and cascades related library records", () => {
    const venue = createVenue({ name: "Demo Cafe" });
    const campaign = createCampaign({
      venueId: venue.id,
      title: "Coffee shot",
      challengePrompt: "Take a photo with your coffee.",
      rewardLabel: "Free croissant",
    });
    const submission = createSubmission({
      campaignId: campaign.id,
      venueId: venue.id,
      mediaPath: "image/demo.png",
      mediaMime: "image/png",
      mediaType: "image",
    });

    createReward({
      submissionId: submission.id,
      campaignId: campaign.id,
      venueId: venue.id,
      label: campaign.rewardLabel,
    });
    createSocialPost({
      submissionId: submission.id,
      campaignId: campaign.id,
      venueId: venue.id,
      caption: "Coffee time.",
    });

    expect(deleteSubmission(submission.id)?.id).toBe(submission.id);
    expect(listRewards({ venueId: venue.id })).toEqual([]);
    expect(listSocialPosts({ venueId: venue.id })).toEqual([]);
    expect(deleteSubmission(submission.id)).toBeNull();
  });
});
