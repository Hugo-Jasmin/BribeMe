import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Check, Clock3 } from "lucide-react";
import {
  OwnerMobileNavigation,
  OwnerSidebar,
  type OwnerNavigationData,
} from "@/components/bribeme/owner-navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ensureDemoData } from "@/lib/demo-data";
import { formatStatus } from "@/lib/format";
import { countIssuedRewards, listRewards, listSocialPosts } from "@/lib/repositories";

export { formatStatus };

export const staffLinks = [
  ["/staff/redeem", "Redeem code"],
  ["/staff/campaigns", "Active campaigns"],
] as const;

export function PageShell({
  title,
  description,
  children,
  actions,
  role = "owner",
}: {
  title: string;
  description: string;
  children: ReactNode;
  actions?: ReactNode;
  role?: "home" | "patron" | "owner" | "staff";
}) {
  if (role === "patron") {
    return (
      <main className="min-h-screen bg-muted/40 text-foreground">
        <div className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col border-x bg-background shadow-sm">
          <header className="border-b bg-card px-4 py-5">
            <Link className="text-sm text-muted-foreground hover:text-foreground" href="/">
              BribeMe
            </Link>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">{title}</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
            {actions ? <div className="mt-4 grid gap-2">{actions}</div> : null}
          </header>
          <div className="min-w-0 flex-1 px-4 py-4">{children}</div>
        </div>
      </main>
    );
  }

  if (role === "home") {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <div className="mx-auto grid w-full max-w-4xl gap-6 px-6 py-8">
          <header className="space-y-3">
            <Link className="text-sm text-muted-foreground hover:text-foreground" href="/">
              BribeMe
            </Link>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight">{title}</h1>
            <p className="max-w-2xl text-muted-foreground">{description}</p>
            {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
          </header>
          {children}
        </div>
      </main>
    );
  }

  const maxWidth = role === "staff" ? "max-w-5xl" : "max-w-7xl";

  if (role === "owner") {
    const ownerNavigationData = getOwnerNavigationData();

    return (
      <main className="min-h-screen bg-background text-foreground lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
        <OwnerSidebar data={ownerNavigationData} />
        <div className="min-w-0">
          <header className="sticky top-0 z-30 min-h-16 border-b bg-background/95 backdrop-blur lg:h-16">
            <div className="flex min-h-16 flex-wrap items-center gap-3 px-4 py-3 sm:px-6 lg:h-full lg:flex-nowrap lg:px-8 lg:py-0">
              <OwnerMobileNavigation data={ownerNavigationData} />
              <div className="min-w-0 flex-1">
                <h1 className="truncate text-xl font-semibold">{title}</h1>
                <p className="sr-only">{description}</p>
              </div>
              {actions ? <div className="flex flex-wrap justify-end gap-2">{actions}</div> : null}
            </div>
          </header>
          <div className="px-4 py-5 sm:px-6 lg:px-8">
            <div className="mx-auto grid w-full max-w-[1280px] gap-6">
              <div className="min-w-0">{children}</div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b bg-muted/40">
        <div className={`mx-auto grid w-full ${maxWidth} gap-5 px-6 py-6 lg:grid-cols-[1fr_auto] lg:items-end`}>
          <div className="space-y-2">
            <Link className="text-sm text-muted-foreground hover:text-foreground" href="/">
              BribeMe
            </Link>
            <h1 className="max-w-4xl text-3xl font-semibold tracking-tight md:text-4xl">
              {title}
            </h1>
            <p className="max-w-3xl text-muted-foreground">{description}</p>
          </div>
          {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
        </div>
      </header>
      <div className={`mx-auto grid w-full ${maxWidth} gap-6 px-6 py-6`}>
        {role === "staff" ? <StaffNav /> : null}
        <div className="min-w-0">{children}</div>
      </div>
    </main>
  );
}

function getOwnerNavigationData(): OwnerNavigationData {
  const { venue, campaigns, submissions } = ensureDemoData();
  const socialPosts = listSocialPosts({ venueId: venue.id });
  const rewards = listRewards({ venueId: venue.id });

  return {
    venueName: venue.name,
    counts: {
      activeCampaigns: campaigns.filter((campaign) => campaign.status === "active").length,
      pendingPosts: socialPosts.filter((post) => post.status === "draft").length,
      approvedMedia: submissions.filter((submission) => submission.status === "approved").length,
      issuedRewards: rewards.filter((reward) => reward.status !== "void").length,
    },
    campaigns: campaigns.map((campaign) => ({
      id: campaign.id,
      title: campaign.title,
      status: campaign.status,
      rewardLabel: campaign.rewardLabel,
      issuedRewards: countIssuedRewards(campaign.id),
    })),
  };
}

function StaffNav() {
  return (
    <nav className="flex flex-wrap gap-2 text-sm">
      {staffLinks.map(([href, label]) => (
        <Link
          className="rounded-md border bg-card px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground"
          href={href}
          key={href}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}

export function AppCard({
  icon,
  title,
  description,
  children,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <Card className={`rounded-lg ${className ?? ""}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon ? <span className="[&_svg]:size-4">{icon}</span> : null}
          {title}
        </CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
        {action ? <CardAction>{action}</CardAction> : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export function Status({
  children,
  tone,
  icon,
}: {
  children: ReactNode;
  tone: "good" | "neutral" | "bad" | "muted";
  icon?: ReactNode;
}) {
  const tones = {
    good: "border-foreground/15 bg-foreground text-background",
    neutral: "border-border bg-secondary text-secondary-foreground",
    bad: "border-destructive/25 bg-destructive/10 text-destructive",
    muted: "border-border bg-background text-muted-foreground",
  };

  return (
    <span
      className={`inline-flex h-7 items-center gap-1.5 rounded-sm border px-2 text-xs font-medium ${tones[tone]} [&_svg]:size-3.5`}
    >
      {icon}
      {children}
    </span>
  );
}

export function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-card p-3">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}

export function Score({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border p-3">
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-sm font-medium">{label}</p>
        <span className="font-mono text-sm">{value}</span>
      </div>
      <Progress value={value} />
    </div>
  );
}

export function PhotoPreview({
  compact = false,
  src = "/demo/friend-group-drinks-realistic.png",
  alt = "Cafe customer submission",
  href,
  linkLabel,
}: {
  compact?: boolean;
  src?: string;
  alt?: string;
  href?: string;
  linkLabel?: string;
}) {
  const preview = (
    <div
      className={`relative overflow-hidden rounded-lg border ${
        compact ? "aspect-[4/3]" : "aspect-[4/5]"
      }`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes={compact ? "220px" : "(max-width: 768px) 100vw, 280px"}
      />
    </div>
  );

  if (!href) return preview;

  return (
    <Link
      aria-label={linkLabel ?? alt}
      className="block transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      href={href}
      prefetch={href.startsWith("/api/") ? false : undefined}
    >
      {preview}
    </Link>
  );
}

export function CheckLine({
  checked,
  children,
}: {
  checked?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="grid size-5 place-items-center rounded-md border bg-background">
        {checked ? <Check className="size-3" /> : <Clock3 className="size-3" />}
      </span>
      <span className={checked ? "" : "text-muted-foreground"}>{children}</span>
    </div>
  );
}

export function PageGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-5">{children}</div>;
}

export function LinkButton({
  href,
  children,
  variant = "outline",
}: {
  href: string;
  children: ReactNode;
  variant?: "default" | "outline" | "secondary";
}) {
  return (
    <Button asChild variant={variant}>
      <Link href={href}>{children}</Link>
    </Button>
  );
}
