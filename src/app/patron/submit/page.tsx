import { Camera } from "lucide-react";
import { AppCard, PageShell } from "@/components/bribe/ui";
import { PatronSubmissionForm } from "@/components/bribe/forms";
import { orderPatronCampaigns } from "@/lib/campaign-ordering";
import { ensureDemoData } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

export default async function PatronSubmitPage({
  searchParams,
}: {
  searchParams: Promise<{ campaignId?: string }>;
}) {
  const { campaignId } = await searchParams;
  const { campaigns } = await ensureDemoData();
  const activeCampaigns = orderPatronCampaigns(
    campaigns.filter((campaign) => campaign.status === "active"),
  );

  return (
    <PageShell
      role="patron"
      title="Upload your photo"
      description="Confirm the task, upload your image, and wait while the backend checks it."
    >
      <AppCard icon={<Camera />} title="Submission details">
        <div className="grid gap-5">
          <PatronSubmissionForm
            campaigns={activeCampaigns}
            selectedCampaignId={campaignId}
          />
        </div>
      </AppCard>
    </PageShell>
  );
}
