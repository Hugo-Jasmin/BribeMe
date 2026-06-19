import { createVenue, listVenues } from "@/lib/repositories";
import { errorJson, json } from "@/lib/http";
import { CreateVenueSchema } from "@/lib/schemas";

export const runtime = "nodejs";

export async function GET() {
  return json({ venues: await listVenues() });
}

export async function POST(request: Request) {
  try {
    const input = CreateVenueSchema.parse(await request.json());
    return json({ venue: await createVenue(input) }, { status: 201 });
  } catch (error) {
    return errorJson(error);
  }
}
