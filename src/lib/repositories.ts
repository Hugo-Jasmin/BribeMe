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

type QueryValue = string | number | null;

function nowIso() {
  return new Date().toISOString();
}

async function execute(sql: string, args: QueryValue[] = []) {
  const db = await getDb();
  return db.execute({ sql, args });
}

async function firstRow(sql: string, args: QueryValue[] = []) {
  const result = await execute(sql, args);
  return result.rows[0] ?? null;
}

function filteredWhere(filters: Record<string, string | undefined>) {
  const clauses: string[] = [];
  const params: QueryValue[] = [];

  for (const [column, value] of Object.entries(filters)) {
    if (value) {
      clauses.push(`${column} = ?`);
      params.push(value);
    }
  }

  return {
    where: clauses.length ? `WHERE ${clauses.join(" AND ")}` : "",
    params,
  };
}

export async function createVenue(input: { name: string; slug?: string }) {
  const createdAt = nowIso();
  const venue = {
    id: createId("ven"),
    name: input.name,
    slug: input.slug ? slugify(input.slug) : slugify(input.name),
    createdAt,
  };

  await execute("INSERT INTO venues (id, name, slug, created_at) VALUES (?, ?, ?, ?)", [
    venue.id,
    venue.name,
    venue.slug,
    venue.createdAt,
  ]);

  return venue;
}

export async function listVenues() {
  const result = await execute("SELECT * FROM venues ORDER BY created_at DESC");
  return result.rows.map((row) => mapVenue(row as never));
}

export async function getVenue(id: string) {
  const row = await firstRow("SELECT * FROM venues WHERE id = ?", [id]);
  return row ? mapVenue(row as never) : null;
}

export async function updateVenue(id: string, input: { name: string }) {
  await execute("UPDATE venues SET name = ? WHERE id = ?", [input.name, id]);
  return getVenue(id);
}

export async function findVenueBySlug(slug: string) {
  const row = await firstRow("SELECT * FROM venues WHERE slug = ?", [slugify(slug)]);
  return row ? mapVenue(row as never) : null;
}

export async function createCampaign(input: {
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

  await execute(
    `INSERT INTO campaigns (
      id, venue_id, title, challenge_prompt, reward_label, budget_cents,
      max_redemptions, validation_threshold, starts_at, ends_at, status,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
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
    ],
  );

  return campaign;
}

export async function listCampaigns(filters: { venueId?: string; status?: CampaignStatus } = {}) {
  const { where, params } = filteredWhere({
    venue_id: filters.venueId,
    status: filters.status,
  });
  const result = await execute(`SELECT * FROM campaigns ${where} ORDER BY created_at DESC`, params);
  return result.rows.map((row) => mapCampaign(row as never));
}

export async function getCampaign(id: string) {
  const row = await firstRow("SELECT * FROM campaigns WHERE id = ?", [id]);
  return row ? mapCampaign(row as never) : null;
}

export async function deleteCampaign(id: string) {
  const campaign = await getCampaign(id);
  if (!campaign) return null;

  await execute("DELETE FROM campaigns WHERE id = ?", [id]);
  return campaign;
}

export async function countIssuedRewards(campaignId: string) {
  const row = (await firstRow(
    "SELECT COUNT(*) AS total FROM rewards WHERE campaign_id = ? AND status != 'void'",
    [campaignId],
  )) as unknown as { total: number } | null;
  return row?.total ?? 0;
}

export async function createSubmission(input: {
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

  await execute(
    `INSERT INTO submissions (
      id, campaign_id, venue_id, patron_name, media_path, media_mime,
      media_type, original_filename, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
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
    ],
  );

  return submission;
}

export async function updateSubmissionVerification(input: {
  submissionId: string;
  status: SubmissionStatus;
  result: VerificationResult;
  rewardCode?: string | null;
}) {
  await execute(
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
    [
      input.status,
      input.result.qualityScore,
      input.result.taskMatchScore,
      input.result.safetyScore,
      input.result.decisionReason,
      JSON.stringify(input.result),
      input.rewardCode ?? null,
      nowIso(),
      input.submissionId,
    ],
  );

  return getSubmission(input.submissionId);
}

export async function getSubmission(id: string) {
  const row = await firstRow("SELECT * FROM submissions WHERE id = ?", [id]);
  return row ? mapSubmission(row as never) : null;
}

export async function deleteSubmission(id: string) {
  const submission = await getSubmission(id);
  if (!submission) return null;

  await execute("DELETE FROM submissions WHERE id = ?", [id]);
  return submission;
}

export async function listSubmissions(filters: { campaignId?: string; venueId?: string } = {}) {
  const { where, params } = filteredWhere({
    campaign_id: filters.campaignId,
    venue_id: filters.venueId,
  });
  const result = await execute(`SELECT * FROM submissions ${where} ORDER BY created_at DESC`, params);
  return result.rows.map((row) => mapSubmission(row as never));
}

export async function listRewards(filters: { campaignId?: string; venueId?: string } = {}) {
  const { where, params } = filteredWhere({
    campaign_id: filters.campaignId,
    venue_id: filters.venueId,
  });
  const result = await execute(`SELECT * FROM rewards ${where} ORDER BY created_at DESC`, params);
  return result.rows.map((row) => mapReward(row as never));
}

export async function createReward(input: {
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

  await execute(
    `INSERT INTO rewards (
      id, submission_id, campaign_id, venue_id, code, label, status,
      expires_at, redeemed_at, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
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
    ],
  );

  return reward;
}

export async function getRewardByCode(code: string) {
  const row = await firstRow("SELECT * FROM rewards WHERE code = ?", [code]);
  return row ? mapReward(row as never) : null;
}

export async function redeemReward(code: string) {
  const reward = await getRewardByCode(code);
  if (!reward) return null;
  if (reward.status !== "issued") return reward;

  await execute("UPDATE rewards SET status = 'redeemed', redeemed_at = ? WHERE code = ?", [
    nowIso(),
    code,
  ]);

  return getRewardByCode(code);
}

export async function createSocialPost(input: {
  submissionId: string;
  campaignId: string;
  venueId: string;
  description: string;
  caption: string;
  channels?: string[];
}) {
  const timestamp = nowIso();
  const post: SocialPost = {
    id: createId("post"),
    submissionId: input.submissionId,
    campaignId: input.campaignId,
    venueId: input.venueId,
    description: input.description,
    caption: input.caption,
    channelsJson: JSON.stringify(input.channels ?? ["instagram", "tiktok", "facebook"]),
    status: "draft",
    ownerNote: null,
    approvedAt: null,
    postedAt: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  await execute(
    `INSERT INTO social_posts (
      id, submission_id, campaign_id, venue_id, description, caption, channels_json,
      status, owner_note, approved_at, posted_at, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      post.id,
      post.submissionId,
      post.campaignId,
      post.venueId,
      post.description,
      post.caption,
      post.channelsJson,
      post.status,
      post.ownerNote,
      post.approvedAt,
      post.postedAt,
      post.createdAt,
      post.updatedAt,
    ],
  );

  return post;
}

export async function listSocialPosts(filters: { venueId?: string; campaignId?: string } = {}) {
  const { where, params } = filteredWhere({
    venue_id: filters.venueId,
    campaign_id: filters.campaignId,
  });
  const result = await execute(`SELECT * FROM social_posts ${where} ORDER BY created_at DESC`, params);
  return result.rows.map((row) => mapSocialPost(row as never));
}

export async function getSocialPost(id: string) {
  const row = await firstRow("SELECT * FROM social_posts WHERE id = ?", [id]);
  return row ? mapSocialPost(row as never) : null;
}

export async function approveSocialPost(id: string) {
  const timestamp = nowIso();
  await execute(
    `UPDATE social_posts
     SET status = 'approved', approved_at = ?, updated_at = ?
     WHERE id = ? AND status = 'draft'`,
    [timestamp, timestamp, id],
  );

  return getSocialPost(id);
}

export async function updateDraftSocialPostCopy(input: {
  id: string;
  description: string;
  caption: string;
}) {
  await execute(
    `UPDATE social_posts
     SET description = ?, caption = ?, updated_at = ?
     WHERE id = ? AND status = 'draft'`,
    [input.description, input.caption, nowIso(), input.id],
  );

  return getSocialPost(input.id);
}

export async function markSocialPostPosted(id: string) {
  const timestamp = nowIso();
  await execute(
    `UPDATE social_posts
     SET status = 'posted', posted_at = ?, updated_at = ?
     WHERE id = ? AND status = 'approved'`,
    [timestamp, timestamp, id],
  );

  return getSocialPost(id);
}
