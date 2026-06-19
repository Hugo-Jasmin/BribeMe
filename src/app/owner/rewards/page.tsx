import { Gift, ScanLine } from "lucide-react";
import { AppCard, formatStatus, LinkButton, Metric, PageShell, Status } from "@/components/bribe/ui";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ensureDemoData } from "@/lib/demo-data";
import { listRewards } from "@/lib/repositories";

export const dynamic = "force-dynamic";

export default async function RewardLedgerPage() {
  const { venue } = await ensureDemoData();
  const rewards = await listRewards({ venueId: venue.id });
  const issued = rewards.filter((reward) => reward.status === "issued").length;
  const redeemed = rewards.filter((reward) => reward.status === "redeemed").length;
  const expired = rewards.filter((reward) => reward.status === "expired").length;

  return (
    <PageShell
      role="owner"
      title="Reward ledger"
      description="Issued, redeemed, expired, and voided codes for operations and budget control."
      actions={
        <LinkButton href="/staff/redeem" variant="default">
          <ScanLine /> Redeem a code
        </LinkButton>
      }
    >
      <div className="grid gap-5">
        <div className="grid gap-3 md:grid-cols-4">
          <Metric label="Issued" value={String(issued)} />
          <Metric label="Redeemed" value={String(redeemed)} />
          <Metric label="Expired" value={String(expired)} />
          <Metric label="Total" value={String(rewards.length)} />
        </div>
        <AppCard description="Staff redemption updates this ledger." icon={<Gift />} title="Reward codes">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reward</TableHead>
                <TableHead className="text-right">Expires</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rewards.map((reward) => (
                <TableRow key={reward.id}>
                  <TableCell className="font-mono">{reward.code}</TableCell>
                  <TableCell>
                    <Status tone={reward.status === "redeemed" ? "good" : "neutral"}>
                      {formatStatus(reward.status)}
                    </Status>
                  </TableCell>
                  <TableCell>{reward.label}</TableCell>
                  <TableCell className="text-right">
                    {reward.expiresAt ? formatDate(reward.expiresAt) : "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </AppCard>
      </div>
    </PageShell>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}
