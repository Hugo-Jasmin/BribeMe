import {
  createCampaign,
  createVenue,
  findVenueBySlug,
  getVenue,
  listCampaigns,
} from "@/lib/repositories";
import { errorJson, json } from "@/lib/http";
import { CreateCampaignSchema } from "@/lib/schemas";
import { revalidatePath } from "next/cache";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const venueId = url.searchParams.get("venueId") ?? undefined;
  const status = url.searchParams.get("status") ?? undefined;

  return json({
    campaigns: await listCampaigns({
      venueId,
      status: status as never,
    }),
  });
}

export async function POST(request: Request) {
  try {
    const input = CreateCampaignSchema.parse(await request.json());
    const venue = await resolveVenue(input);

    const campaign = await createCampaign({
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

    revalidatePath("/owner");
    revalidatePath("/owner/campaigns");
    revalidatePath("/patron/qr");
    revalidatePath("/patron/submit");

    return json({ venue, campaign }, { status: 201 });
  } catch (error) {
    return errorJson(error);
  }
}

async function resolveVenue(input: {
  venueId?: string;
  venueName?: string;
  venueSlug?: string;
}) {
  if (input.venueId) {
    const venue = await getVenue(input.venueId);
    if (!venue) throw new Error("Venue not found");
    return venue;
  }

  if (!input.venueName) {
    throw new Error("venueId or venueName is required");
  }

  if (input.venueSlug) {
    const existing = await findVenueBySlug(input.venueSlug);
    if (existing) return existing;
  }

  return createVenue({
    name: input.venueName,
    slug: input.venueSlug,
  });
}
