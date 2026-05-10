import { getRewardByCode } from "@/lib/repositories";
import { errorJson, json } from "@/lib/http";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await params;
    const reward = getRewardByCode(code);
    if (!reward) return json({ error: "Reward not found" }, { status: 404 });
    return json({ reward });
  } catch (error) {
    return errorJson(error);
  }
}
