import { Megaphone } from "lucide-react";
import { AppCard, PageShell } from "@/components/bribeme/ui";
import { CampaignForm } from "@/components/bribeme/forms";
import { ensureDemoData } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

export default function NewCampaignPage() {
  const { venue } = ensureDemoData();

  return (
    <PageShell
      role="owner"
      title="Create campaign"
      description="Set the challenge, reward, budget, and redemption rules."
    >
      <AppCard icon={<Megaphone />} title="Campaign builder">
        <CampaignForm venueName={venue.name} />
      </AppCard>
    </PageShell>
  );
}
