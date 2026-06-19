import { getDemoPublicPathForStoredMedia } from "@/lib/demo-scenarios";
import { errorJson, json } from "@/lib/http";
import { deleteStoredMedia } from "@/lib/media";
import { deleteCampaign, getCampaign, listSubmissions } from "@/lib/repositories";
import { revalidatePath } from "next/cache";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const campaign = await getCampaign(id);
    if (!campaign) return json({ error: "Campaign not found" }, { status: 404 });
    return json({ campaign });
  } catch (error) {
    return errorJson(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const submissions = await listSubmissions({ campaignId: id });
    const campaign = await deleteCampaign(id);
    if (!campaign) return json({ error: "Campaign not found" }, { status: 404 });

    await Promise.all(
      submissions
        .filter((submission) => !getDemoPublicPathForStoredMedia(submission.mediaPath))
        .map((submission) => deleteStoredMedia(submission.mediaPath)),
    );

    revalidatePath("/owner");
    revalidatePath("/owner/campaigns");
    revalidatePath("/patron/qr");
    revalidatePath("/patron/submit");

    return json({ campaign });
  } catch (error) {
    return errorJson(error);
  }
}
