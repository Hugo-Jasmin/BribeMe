import { getCampaign } from "@/lib/repositories";
import { errorJson, json } from "@/lib/http";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const campaign = getCampaign(id);
    if (!campaign) return json({ error: "Campaign not found" }, { status: 404 });
    return json({ campaign });
  } catch (error) {
    return errorJson(error);
  }
}
