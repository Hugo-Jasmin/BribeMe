import { getDb } from "@/lib/db";
import { createCouponCode, createId, slugify } from "@/lib/ids";
import {
  mapCampaign,
  mapReward,
  mapSocialPost,
  mapSubmission,
  mapVenue,
} from "@/lib/rows";
import type {
  Campaign,
  CampaignStatus,
  Reward,
  SocialPost,
  Submission,
  SubmissionStatus,
  VerificationResult,
} from "@/lib/types";

function nowIso() {
  return new Date().toISOString();
}

export function createVenue(input: { name: string; slug?: string }) {
  const createdAt = nowIso();
  const venue = {
    id: createId("ven"),
    name: input.name,
    slug: input.slug ? slugify(input.slug) : slugify(input.name),
    createdAt,
  };

  getDb()
    .prepare("INSERT INTO venues (id, name, slug, created_at) VALUES (?, ?, ?, ?)")
    .run(venue.id, venue.name, venue.slug, venue.createdAt);

  return venue;
}

export function listVenues() {
  return getDb()
    .prepare("SELECT * FROM venues ORDER BY created_at DESC")
    .all()
    .map((row) => mapVenue(row as never));
}

export function getVenue(id: string) {
  const row = getDb().prepare("SELECT * FROM venues WHERE id = ?").get(id);
  return row ? mapVenue(row as never) : null;
}

export function updateVenue(id: string, input: { name: string }) {
  getDb().prepare("UPDATE venues SET name = ? WHERE id = ?").run(input.name, id);
  return getVenue(id);
}

export function findVenueBySlug(slug: string) {
  const row = getDb().prepare("SELECT * FROM venues WHERE slug = ?").get(slugify(slug));
  return row ? mapVenue(row as never) : null;
}

export function createCampaign(input: {
  venueId: string;
  title: string;
  challengePrompt: string;
  rewardLabel: string;
  budgetCents?: number | null;
  maxRedemptions?: number | null;
  validationThreshold?: number;
  startsAt?: string | null;
  endsAt?: string | null;
  status?: CampaignStatus;
}) {
  const timestamp = nowIso();
  const campaign: Campaign = {
    id: createId("camp"),
    venueId: input.venueId,
    title: input.title,
    challengePrompt: input.challengePrompt,
    rewardLabel: input.rewardLabel,
    budgetCents: input.budgetCents ?? null,
    maxRedemptions: input.maxRedemptions ?? null,
    validationThreshold: input.validationThreshold ?? 70,
    startsAt: input.startsAt ?? null,
    endsAt: input.endsAt ?? null,
    status: input.status ?? "active",
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  getDb()
    .prepare(
      `INSERT INTO campaigns (
        id, venue_id, title, challenge_prompt, reward_label, budget_cents,
        max_redemptions, validation_threshold, starts_at, ends_at, status,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      campaign.id,
      campaign.venueId,
      campaign.title,
      campaign.challengePrompt,
      campaign.rewardLabel,
      campaign.budgetCents,
      campaign.maxRedemptions,
      campaign.validationThreshold,
      campaign.startsAt,
      campaign.endsAt,
      campaign.status,
      campaign.createdAt,
      campaign.updatedAt,
    );

  return campaign;
}

export function listCampaigns(filters: { venueId?: string; status?: CampaignStatus } = {}) {
  const clauses: string[] = [];
  const params: unknown[] = [];

  if (filters.venueId) {
    clauses.push("venue_id = ?");
    params.push(filters.venueId);
  }
  if (filters.status) {
    clauses.push("status = ?");
    params.push(filters.status);
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  return getDb()
    .prepare(`SELECT * FROM campaigns ${where} ORDER BY created_at DESC`)
    .all(...params)
    .map((row) => mapCampaign(row as never));
}

export function getCampaign(id: string) {
  const row = getDb().prepare("SELECT * FROM campaigns WHERE id = ?").get(id);
  return row ? mapCampaign(row as never) : null;
}

export function countIssuedRewards(campaignId: string) {
  const row = getDb()
    .prepare("SELECT COUNT(*) AS total FROM rewards WHERE campaign_id = ? AND status != 'void'")
    .get(campaignId) as { total: number };
  return row.total;
}

export function createSubmission(input: {
  campaignId: string;
  venueId: string;
  patronName?: string | null;
  mediaPath: string;
  mediaMime: string;
  mediaType: Submission["mediaType"];
  originalFilename?: string | null;
}) {
  const timestamp = nowIso();
  const submission: Submission = {
    id: createId("sub"),
    campaignId: input.campaignId,
    venueId: input.venueId,
    patronName: input.patronName ?? null,
    mediaPath: input.mediaPath,
    mediaMime: input.mediaMime,
    mediaType: input.mediaType,
    originalFilename: input.originalFilename ?? null,
    status: "uploaded",
    qualityScore: null,
    taskMatchScore: null,
    safetyScore: null,
    decisionReason: null,
    validationJson: null,
    rewardCode: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  getDb()
    .prepare(
      `INSERT INTO submissions (
        id, campaign_id, venue_id, patron_name, media_path, media_mime,
        media_type, original_filename, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      submission.id,
      submission.campaignId,
      submission.venueId,
      submission.patronName,
      submission.mediaPath,
      submission.mediaMime,
      submission.mediaType,
      submission.originalFilename,
      submission.status,
      submission.createdAt,
      submission.updatedAt,
    );

  return submission;
}

export function updateSubmissionVerification(input: {
  submissionId: string;
  status: SubmissionStatus;
  result: VerificationResult;
  rewardCode?: string | null;
}) {
  getDb()
    .prepare(
      `UPDATE submissions SET
        status = ?,
        quality_score = ?,
        task_match_score = ?,
        safety_score = ?,
        decision_reason = ?,
        validation_json = ?,
        reward_code = ?,
        updated_at = ?
      WHERE id = ?`,
    )
    .run(
      input.status,
      input.result.qualityScore,
      input.result.taskMatchScore,
      input.result.safetyScore,
      input.result.decisionReason,
      JSON.stringify(input.result),
      input.rewardCode ?? null,
      nowIso(),
      input.submissionId,
    );

  return getSubmission(input.submissionId);
}

export function getSubmission(id: string) {
  const row = getDb().prepare("SELECT * FROM submissions WHERE id = ?").get(id);
  return row ? mapSubmission(row as never) : null;
}

export function deleteSubmission(id: string) {
  const submission = getSubmission(id);
  if (!submission) return null;

  getDb().prepare("DELETE FROM submissions WHERE id = ?").run(id);
  return submission;
}

export function listSubmissions(filters: { campaignId?: string; venueId?: string } = {}) {
  const clauses: string[] = [];
  const params: unknown[] = [];

  if (filters.campaignId) {
    clauses.push("campaign_id = ?");
    params.push(filters.campaignId);
  }
  if (filters.venueId) {
    clauses.push("venue_id = ?");
    params.push(filters.venueId);
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  return getDb()
    .prepare(`SELECT * FROM submissions ${where} ORDER BY created_at DESC`)
    .all(...params)
    .map((row) => mapSubmission(row as never));
}

export function listRewards(filters: { campaignId?: string; venueId?: string } = {}) {
  const clauses: string[] = [];
  const params: unknown[] = [];

  if (filters.campaignId) {
    clauses.push("campaign_id = ?");
    params.push(filters.campaignId);
  }
  if (filters.venueId) {
    clauses.push("venue_id = ?");
    params.push(filters.venueId);
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  return getDb()
    .prepare(`SELECT * FROM rewards ${where} ORDER BY created_at DESC`)
    .all(...params)
    .map((row) => mapReward(row as never));
}

export function createReward(input: {
  submissionId: string;
  campaignId: string;
  venueId: string;
  label: string;
  expiresAt?: string | null;
}) {
  const reward: Reward = {
    id: createId("rew"),
    submissionId: input.submissionId,
    campaignId: input.campaignId,
    venueId: input.venueId,
    code: createCouponCode(),
    label: input.label,
    status: "issued",
    expiresAt: input.expiresAt ?? null,
    redeemedAt: null,
    createdAt: nowIso(),
  };

  getDb()
    .prepare(
      `INSERT INTO rewards (
        id, submission_id, campaign_id, venue_id, code, label, status,
        expires_at, redeemed_at, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      reward.id,
      reward.submissionId,
      reward.campaignId,
      reward.venueId,
      reward.code,
      reward.label,
      reward.status,
      reward.expiresAt,
      reward.redeemedAt,
      reward.createdAt,
    );

  return reward;
}

export function getRewardByCode(code: string) {
  const row = getDb().prepare("SELECT * FROM rewards WHERE code = ?").get(code);
  return row ? mapReward(row as never) : null;
}

export function redeemReward(code: string) {
  const reward = getRewardByCode(code);
  if (!reward) return null;
  if (reward.status !== "issued") return reward;

  getDb()
    .prepare("UPDATE rewards SET status = 'redeemed', redeemed_at = ? WHERE code = ?")
    .run(nowIso(), code);

  return getRewardByCode(code);
}

export function createSocialPost(input: {
  submissionId: string;
  campaignId: string;
  venueId: string;
  caption: string;
  channels?: string[];
}) {
  const timestamp = nowIso();
  const post: SocialPost = {
    id: createId("post"),
    submissionId: input.submissionId,
    campaignId: input.campaignId,
    venueId: input.venueId,
    caption: input.caption,
    channelsJson: JSON.stringify(input.channels ?? ["instagram", "tiktok", "facebook"]),
    status: "draft",
    ownerNote: null,
    approvedAt: null,
    postedAt: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  getDb()
    .prepare(
      `INSERT INTO social_posts (
        id, submission_id, campaign_id, venue_id, caption, channels_json,
        status, owner_note, approved_at, posted_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      post.id,
      post.submissionId,
      post.campaignId,
      post.venueId,
      post.caption,
      post.channelsJson,
      post.status,
      post.ownerNote,
      post.approvedAt,
      post.postedAt,
      post.createdAt,
      post.updatedAt,
    );

  return post;
}

export function listSocialPosts(filters: { venueId?: string; campaignId?: string } = {}) {
  const clauses: string[] = [];
  const params: unknown[] = [];

  if (filters.venueId) {
    clauses.push("venue_id = ?");
    params.push(filters.venueId);
  }
  if (filters.campaignId) {
    clauses.push("campaign_id = ?");
    params.push(filters.campaignId);
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  return getDb()
    .prepare(`SELECT * FROM social_posts ${where} ORDER BY created_at DESC`)
    .all(...params)
    .map((row) => mapSocialPost(row as never));
}

export function getSocialPost(id: string) {
  const row = getDb().prepare("SELECT * FROM social_posts WHERE id = ?").get(id);
  return row ? mapSocialPost(row as never) : null;
}

export function approveSocialPost(id: string) {
  getDb()
    .prepare(
      `UPDATE social_posts
       SET status = 'approved', approved_at = ?, updated_at = ?
       WHERE id = ? AND status = 'draft'`,
    )
    .run(nowIso(), nowIso(), id);

  return getSocialPost(id);
}

export function updateDraftSocialPostCaption(id: string, caption: string) {
  getDb()
    .prepare(
      `UPDATE social_posts
       SET caption = ?, updated_at = ?
       WHERE id = ? AND status = 'draft'`,
    )
    .run(caption, nowIso(), id);

  return getSocialPost(id);
}

export function markSocialPostPosted(id: string) {
  getDb()
    .prepare(
      `UPDATE social_posts
       SET status = 'posted', posted_at = ?, updated_at = ?
       WHERE id = ? AND status = 'approved'`,
    )
    .run(nowIso(), nowIso(), id);

  return getSocialPost(id);
}
