import { errorJson, json } from "@/lib/http";
import { listSocialPosts } from "@/lib/repositories";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    return json({
      socialPosts: await listSocialPosts({
        venueId: url.searchParams.get("venueId") ?? undefined,
        campaignId: url.searchParams.get("campaignId") ?? undefined,
      }),
    });
  } catch (error) {
    return errorJson(error);
  }
}
