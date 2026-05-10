import { z } from "zod";

export const CreateVenueSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).optional(),
});

export const UpdateVenueSchema = z.object({
  name: z.string().trim().min(1),
});

export const CreateCampaignSchema = z.object({
  venueId: z.string().min(1).optional(),
  venueName: z.string().min(1).optional(),
  venueSlug: z.string().min(1).optional(),
  title: z.string().min(1),
  challengePrompt: z.string().min(1),
  rewardLabel: z.string().min(1),
  budgetCents: z.number().int().nonnegative().nullable().optional(),
  maxRedemptions: z.number().int().positive().nullable().optional(),
  validationThreshold: z.number().int().min(0).max(100).optional(),
  startsAt: z.string().datetime().nullable().optional(),
  endsAt: z.string().datetime().nullable().optional(),
  status: z.enum(["draft", "active", "paused", "ended"]).optional(),
});

export const ApproveSocialPostSchema = z.object({
  markPosted: z.boolean().optional(),
});
