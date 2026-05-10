import { ScanLine, TicketCheck } from "lucide-react";
import { AppCard, LinkButton, PageShell } from "@/components/bribeme/ui";
import { LuminousRewardCard } from "@/components/bribeme/luminous-reward";
import { ensureDemoData } from "@/lib/demo-data";
import { getRewardByCode } from "@/lib/repositories";

export const dynamic = "force-dynamic";

export default async function PatronRewardPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;
  const { venue } = ensureDemoData();
  const reward = code ? getRewardByCode(code) : null;

  return (
    <PageShell
      role="patron"
      title="Your reward is ready"
      description="Show this code to staff at the counter."
      actions={
        reward ? (
          <LinkButton href={`/staff/redeem?code=${reward.code}`} variant="default">
            <ScanLine /> Open staff redemption
          </LinkButton>
        ) : null
      }
    >
      <AppCard icon={<TicketCheck />} title="Reward coupon">
        <LuminousRewardCard
          code={reward?.code}
          expiresAt={reward?.expiresAt}
          label={reward?.label}
          status={reward?.status}
          venueName={venue.name}
        />
      </AppCard>
    </PageShell>
  );
}
