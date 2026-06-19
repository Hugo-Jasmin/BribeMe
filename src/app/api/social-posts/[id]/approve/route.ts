import { errorJson, json } from "@/lib/http";
import { ApproveSocialPostSchema } from "@/lib/schemas";
import { approveSocialPost, markSocialPostPosted } from "@/lib/repositories";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = request.headers.get("content-length") === "0" ? {} : await request.json();
    const input = ApproveSocialPostSchema.parse(body);

    const approved = await approveSocialPost(id);
    if (!approved) return json({ error: "Social post not found" }, { status: 404 });

    const socialPost = input.markPosted ? await markSocialPostPosted(id) : approved;
    return json({ socialPost });
  } catch (error) {
    return errorJson(error);
  }
}
