import { ArrowRight, Camera, ListChecks } from "lucide-react";
import { AppCard, LinkButton, PageShell } from "@/components/bribeme/ui";
import { orderPatronCampaigns } from "@/lib/campaign-ordering";
import { ensureDemoData } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

export default function PatronQrPage() {
  const { campaigns } = ensureDemoData();
  const activeCampaigns = orderPatronCampaigns(
    campaigns.filter((campaign) => campaign.status === "active"),
  );

  return (
    <PageShell
      role="patron"
      title="Choose a task"
      description="Pick the photo task you want to complete, then upload your submission for the matching reward."
    >
      <div className="grid gap-4">
        <AppCard icon={<ListChecks />} title="Tasks available now">
          {activeCampaigns.length ? (
            <div className="grid gap-3">
              {activeCampaigns.map((campaign, index) => (
                <article className="rounded-lg border bg-card" key={campaign.id}>
                  <div className="p-3">
                    <div className="min-w-0 space-y-2">
                      <div>
                        <p className="text-xs font-medium uppercase text-muted-foreground">
                          Task {index + 1}
                        </p>
                        <h2 className="mt-1 text-lg font-semibold leading-6">
                          {campaign.title}
                        </h2>
                      </div>
                      <p className="text-sm leading-5 text-muted-foreground">
                        {campaign.challengePrompt}
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-3 border-t bg-muted/30 p-3">
                    <div>
                      <p className="text-xs font-medium uppercase text-muted-foreground">
                        Reward
                      </p>
                      <p className="mt-1 font-medium">{campaign.rewardLabel}</p>
                    </div>
                    <LinkButton href={`/patron/submit?campaignId=${campaign.id}`} variant="default">
                      <Camera /> Choose task <ArrowRight />
                    </LinkButton>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border p-4 text-sm text-muted-foreground">
              New tasks will appear here when the owner creates them.
            </div>
          )}
        </AppCard>

      </div>
    </PageShell>
  );
}
