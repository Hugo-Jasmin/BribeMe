export type CampaignStatus = "draft" | "active" | "paused" | "ended";
export type SubmissionStatus = "uploaded" | "approved" | "rejected" | "needs_review";
export type RewardStatus = "issued" | "redeemed" | "expired" | "void";
export type SocialPostStatus = "draft" | "approved" | "posted" | "rejected";

export type Venue = {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
};

export type Campaign = {
  id: string;
  venueId: string;
  title: string;
  challengePrompt: string;
  rewardLabel: string;
  budgetCents: number | null;
  maxRedemptions: number | null;
  validationThreshold: number;
  startsAt: string | null;
  endsAt: string | null;
  status: CampaignStatus;
  createdAt: string;
  updatedAt: string;
};

export type Submission = {
  id: string;
  campaignId: string;
  venueId: string;
  patronName: string | null;
  mediaPath: string;
  mediaMime: string;
  mediaType: "image" | "video";
  originalFilename: string | null;
  status: SubmissionStatus;
  qualityScore: number | null;
  taskMatchScore: number | null;
  safetyScore: number | null;
  decisionReason: string | null;
  validationJson: string | null;
  rewardCode: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Reward = {
  id: string;
  submissionId: string;
  campaignId: string;
  venueId: string;
  code: string;
  label: string;
  status: RewardStatus;
  expiresAt: string | null;
  redeemedAt: string | null;
  createdAt: string;
};

export type SocialPost = {
  id: string;
  submissionId: string;
  campaignId: string;
  venueId: string;
  description: string;
  caption: string;
  channelsJson: string;
  status: SocialPostStatus;
  ownerNote: string | null;
  approvedAt: string | null;
  postedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type VerificationResult = {
  approved: boolean;
  qualityScore: number;
  taskMatchScore: number;
  safetyScore: number;
  decisionReason: string;
  observations: string[];
  description: string;
  caption: string;
  hashtags: string[];
};
