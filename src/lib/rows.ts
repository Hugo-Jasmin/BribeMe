import type {
  Campaign,
  Reward,
  SocialPost,
  Submission,
  Venue,
} from "@/lib/types";

type VenueRow = {
  id: string;
  name: string;
  slug: string;
  created_at: string;
};

type CampaignRow = {
  id: string;
  venue_id: string;
  title: string;
  challenge_prompt: string;
  reward_label: string;
  budget_cents: number | null;
  max_redemptions: number | null;
  validation_threshold: number;
  starts_at: string | null;
  ends_at: string | null;
  status: Campaign["status"];
  created_at: string;
  updated_at: string;
};

type SubmissionRow = {
  id: string;
  campaign_id: string;
  venue_id: string;
  patron_name: string | null;
  media_path: string;
  media_mime: string;
  media_type: Submission["mediaType"];
  original_filename: string | null;
  status: Submission["status"];
  quality_score: number | null;
  task_match_score: number | null;
  safety_score: number | null;
  decision_reason: string | null;
  validation_json: string | null;
  reward_code: string | null;
  created_at: string;
  updated_at: string;
};

type RewardRow = {
  id: string;
  submission_id: string;
  campaign_id: string;
  venue_id: string;
  code: string;
  label: string;
  status: Reward["status"];
  expires_at: string | null;
  redeemed_at: string | null;
  created_at: string;
};

type SocialPostRow = {
  id: string;
  submission_id: string;
  campaign_id: string;
  venue_id: string;
  description: string | null;
  caption: string;
  channels_json: string;
  status: SocialPost["status"];
  owner_note: string | null;
  approved_at: string | null;
  posted_at: string | null;
  created_at: string;
  updated_at: string;
};

export function mapVenue(row: VenueRow): Venue {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    createdAt: row.created_at,
  };
}

export function mapCampaign(row: CampaignRow): Campaign {
  return {
    id: row.id,
    venueId: row.venue_id,
    title: row.title,
    challengePrompt: row.challenge_prompt,
    rewardLabel: row.reward_label,
    budgetCents: row.budget_cents,
    maxRedemptions: row.max_redemptions,
    validationThreshold: row.validation_threshold,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapSubmission(row: SubmissionRow): Submission {
  return {
    id: row.id,
    campaignId: row.campaign_id,
    venueId: row.venue_id,
    patronName: row.patron_name,
    mediaPath: row.media_path,
    mediaMime: row.media_mime,
    mediaType: row.media_type,
    originalFilename: row.original_filename,
    status: row.status,
    qualityScore: row.quality_score,
    taskMatchScore: row.task_match_score,
    safetyScore: row.safety_score,
    decisionReason: row.decision_reason,
    validationJson: row.validation_json,
    rewardCode: row.reward_code,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapReward(row: RewardRow): Reward {
  return {
    id: row.id,
    submissionId: row.submission_id,
    campaignId: row.campaign_id,
    venueId: row.venue_id,
    code: row.code,
    label: row.label,
    status: row.status,
    expiresAt: row.expires_at,
    redeemedAt: row.redeemed_at,
    createdAt: row.created_at,
  };
}

export function mapSocialPost(row: SocialPostRow): SocialPost {
  return {
    id: row.id,
    submissionId: row.submission_id,
    campaignId: row.campaign_id,
    venueId: row.venue_id,
    description: row.description ?? "",
    caption: row.caption,
    channelsJson: row.channels_json,
    status: row.status,
    ownerNote: row.owner_note,
    approvedAt: row.approved_at,
    postedAt: row.posted_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
