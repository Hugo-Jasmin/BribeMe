import {
  createCampaign,
  createVenue,
  findVenueBySlug,
  getVenue,
  listCampaigns,
} from "@/lib/repositories";
import { errorJson, json } from "@/lib/http";
import { CreateCampaignSchema } from "@/lib/schemas";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const venueId = url.searchParams.get("venueId") ?? undefined;
  const status = url.searchParams.get("status") ?? undefined;

  return json({
    campaigns: listCampaigns({
      venueId,
      status: status as never,
    }),
  });
}

export async function POST(request: Request) {
  try {
    const input = CreateCampaignSchema.parse(await request.json());
    const venue = resolveVenue(input);

    const campaign = createCampaign({
      venueId: venue.id,
      title: input.title,
      challengePrompt: input.challengePrompt,
      rewardLabel: input.rewardLabel,
      budgetCents: input.budgetCents,
      maxRedemptions: input.maxRedemptions,
      validationThreshold: input.validationThreshold,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      status: input.status,
    });

    return json({ venue, campaign }, { status: 201 });
  } catch (error) {
    return errorJson(error);
  }
}

function resolveVenue(input: {
  venueId?: string;
  venueName?: string;
  venueSlug?: string;
}) {
  if (input.venueId) {
    const venue = getVenue(input.venueId);
    if (!venue) throw new Error("Venue not found");
    return venue;
  }

  if (!input.venueName) {
    throw new Error("venueId or venueName is required");
  }

  if (input.venueSlug) {
    const existing = findVenueBySlug(input.venueSlug);
    if (existing) return existing;
  }

  return createVenue({
    name: input.venueName,
    slug: input.venueSlug,
  });
}
