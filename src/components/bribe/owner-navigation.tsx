"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ComponentType, type ReactNode } from "react";
import {
  BarChart3,
  ChevronDown,
  ClipboardCheck,
  Gift,
  HelpCircle,
  ImageIcon,
  Menu,
  MoreHorizontal,
  Plus,
  QrCode,
  ScanLine,
  Search,
  Settings2,
  Store,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatStatus } from "@/lib/format";

type NavIcon = ComponentType<{ className?: string }>;

export type OwnerNavigationData = {
  venueName: string;
  counts: {
    activeCampaigns: number;
    pendingPosts: number;
    approvedMedia: number;
    issuedRewards: number;
  };
  campaigns: Array<{
    id: string;
    title: string;
    status: string;
    rewardLabel: string;
    issuedRewards: number;
  }>;
};

const primaryLinks = [
  {
    href: "/owner",
    label: "Dashboard",
    segment: null,
    icon: BarChart3,
  },
  {
    href: "/owner/table-code",
    label: "Table code",
    segment: "table-code",
    icon: QrCode,
  },
] as const;

const workLinks = [
  {
    href: "/owner/approvals",
    label: "Post queue",
    segment: "approvals",
    icon: ClipboardCheck,
    countKey: "pendingPosts",
  },
  {
    href: "/owner/content",
    label: "Content library",
    segment: "content",
    icon: ImageIcon,
    countKey: "approvedMedia",
  },
  {
    href: "/owner/rewards",
    label: "Reward ledger",
    segment: "rewards",
    icon: Gift,
    countKey: "issuedRewards",
  },
] as const;

const adminLinks = [
  {
    href: "/owner/settings",
    label: "Settings",
    segment: "settings",
    icon: Settings2,
  },
] as const;

const staffLinks = [
  {
    href: "/staff/redeem",
    label: "Redeem code",
    icon: ScanLine,
  },
  {
    href: "/staff/campaigns",
    label: "Active campaigns",
    icon: Users,
  },
] as const;

const campaignsOpenStorageKey = "bribe-owner-campaigns-open";

export function OwnerSidebar({ data }: { data: OwnerNavigationData }) {
  return (
    <aside className="hidden min-h-screen border-r bg-muted/35 lg:block">
      <div className="sticky top-0 flex h-screen flex-col">
        <OwnerSidebarContent data={data} />
      </div>
    </aside>
  );
}

export function OwnerMobileNavigation({ data }: { data: OwnerNavigationData }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className="lg:hidden" size="icon" variant="outline">
          <Menu />
          <span className="sr-only">Open owner menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[320px] p-0" side="left">
        <SheetHeader className="border-b p-5 text-left">
          <SheetTitle>Bribe</SheetTitle>
          <SheetDescription>{data.venueName} owner view</SheetDescription>
        </SheetHeader>
        <OwnerSidebarContent closeOnNavigate data={data} />
      </SheetContent>
    </Sheet>
  );
}

function OwnerSidebarContent({
  closeOnNavigate = false,
  data,
}: {
  closeOnNavigate?: boolean;
  data: OwnerNavigationData;
}) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [campaignsOpen, setCampaignsOpen] = useState(() => {
    if (typeof window === "undefined") return true;
    return window.localStorage.getItem(campaignsOpenStorageKey) !== "false";
  });
  const pathname = usePathname();
  const [activeSegment, activeDetail] = getOwnerPathSegments(pathname);
  const campaignsVisible = campaignsOpen || activeSegment === "campaigns";

  function setPersistentCampaignsOpen(open: boolean) {
    setCampaignsOpen(open);
    window.localStorage.setItem(campaignsOpenStorageKey, String(open));
  }

  return (
    <TooltipProvider>
      <div className="flex min-h-0 flex-1 flex-col">
        <OwnerWorkspaceHeader data={data} />
        <div className="grid gap-2 border-b p-3">
          <Button
            className="h-9 justify-start gap-2 rounded-md border-l-2 border-transparent bg-transparent px-2.5 text-muted-foreground shadow-none hover:border-border hover:bg-background hover:text-foreground"
            onClick={() => setSearchOpen(true)}
            variant="ghost"
          >
            <Search />
            <span className="min-w-0 flex-1 text-left">Search workspace</span>
          </Button>
        </div>
        <ScrollArea className="min-h-0 flex-1">
          <nav className="space-y-6 p-3">
            <NavSection title="Overview">
              {primaryLinks.map((link) => (
                <NavLink
                  active={link.segment === activeSegment}
                  closeOnNavigate={closeOnNavigate}
                  href={link.href}
                  icon={link.icon}
                  key={link.href}
                  label={link.label}
                />
              ))}
            </NavSection>
            <NavSection title="Work">
              <CampaignNavGroup
                activeDetail={activeDetail}
                activeSegment={activeSegment}
                campaignsOpen={campaignsVisible}
                closeOnNavigate={closeOnNavigate}
                data={data}
                onCampaignsOpenChange={setPersistentCampaignsOpen}
              />
              {workLinks.map((link) => (
                <NavLink
                  active={link.segment === activeSegment}
                  closeOnNavigate={closeOnNavigate}
                  count={data.counts[link.countKey]}
                  href={link.href}
                  icon={link.icon}
                  key={link.href}
                  label={link.label}
                />
              ))}
            </NavSection>
            <NavSection title="Staff">
              {staffLinks.map((link) => (
                <NavLink
                  closeOnNavigate={closeOnNavigate}
                  href={link.href}
                  icon={link.icon}
                  key={link.href}
                  label={link.label}
                />
              ))}
            </NavSection>
            <NavSection title="Admin">
              {adminLinks.map((link) => (
                <NavLink
                  active={link.segment === activeSegment}
                  closeOnNavigate={closeOnNavigate}
                  href={link.href}
                  icon={link.icon}
                  key={link.href}
                  label={link.label}
                />
              ))}
            </NavSection>
          </nav>
        </ScrollArea>
        <div className="border-t p-3">
          <NavLink
            closeOnNavigate={closeOnNavigate}
            href="/owner/settings"
            icon={HelpCircle}
            label="Help and settings"
          />
        </div>
        <OwnerCommandSearch data={data} onOpenChange={setSearchOpen} open={searchOpen} />
      </div>
    </TooltipProvider>
  );
}

function getOwnerPathSegments(pathname: string | null) {
  const normalizedPathname = pathname && pathname !== "/" ? pathname.replace(/\/+$/, "") : pathname;
  const segments = normalizedPathname?.split("/").filter(Boolean) ?? [];

  if (segments[0] !== "owner") {
    return [null, null] as const;
  }

  return [segments[1] ?? null, segments[2] ?? null] as const;
}

function OwnerWorkspaceHeader({ data }: { data: OwnerNavigationData }) {
  return (
    <div className="flex h-16 items-center border-b px-3">
      <div className="flex items-center gap-2">
        <Link className="grid size-8 place-items-center rounded-md text-foreground hover:bg-background" href="/">
          <Store className="size-4" />
          <span className="sr-only">Bribe home</span>
        </Link>
        <div className="min-w-0 flex-1">
          <Link className="block truncate text-sm font-semibold hover:text-muted-foreground" href="/">
            Bribe
          </Link>
          <p className="truncate text-xs text-muted-foreground">{data.venueName} owner view</p>
        </div>
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button size="icon-sm" variant="ghost">
                  <MoreHorizontal />
                  <span className="sr-only">Venue menu</span>
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent side="right">Venue menu</TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>{data.venueName}</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href="/owner/settings">Open settings</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/staff/redeem">Open staff view</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/">Back to home</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

function NavSection({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section>
      <p className="mb-2 px-2 text-xs font-medium text-muted-foreground">{title}</p>
      <div className="grid gap-1">{children}</div>
    </section>
  );
}

function CampaignNavGroup({
  activeDetail,
  activeSegment,
  campaignsOpen,
  closeOnNavigate,
  data,
  onCampaignsOpenChange,
}: {
  activeDetail: string | null;
  activeSegment: string | null;
  campaignsOpen: boolean;
  closeOnNavigate: boolean;
  data: OwnerNavigationData;
  onCampaignsOpenChange: (open: boolean) => void;
}) {
  const isActive = activeSegment === "campaigns";

  return (
    <Collapsible
      className="group/campaigns"
      onOpenChange={onCampaignsOpenChange}
      open={campaignsOpen}
    >
      <div
        className={`group flex h-9 items-center rounded-md border-l-2 text-sm transition-colors ${
          isActive
            ? "border-foreground bg-background text-foreground shadow-sm"
            : "border-transparent text-muted-foreground hover:border-border hover:bg-background hover:text-foreground"
        }`}
      >
        <CollapsibleTrigger className="flex min-w-0 flex-1 items-center gap-2 px-2.5 text-left [&_svg]:size-4">
          <ChevronDown className="transition-transform group-data-[state=closed]/campaigns:-rotate-90" />
          <span className="truncate">Campaigns</span>
          <span className="ml-auto text-xs text-muted-foreground">
            {data.counts.activeCampaigns} active
          </span>
        </CollapsibleTrigger>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              className="mr-1 grid size-7 place-items-center rounded-md text-muted-foreground opacity-70 hover:bg-muted hover:text-foreground group-hover:opacity-100"
              href="/owner/campaigns/new"
            >
              <Plus className="size-3.5" />
              <span className="sr-only">New campaign</span>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">New campaign</TooltipContent>
        </Tooltip>
      </div>
      <CollapsibleContent>
        <div className="mt-1 grid gap-1 pl-5">
          <NavLink
            active={activeSegment === "campaigns" && activeDetail == null}
            closeOnNavigate={closeOnNavigate}
            href="/owner/campaigns"
            label="All campaigns"
          />
          {data.campaigns.slice(0, 5).map((campaign) => (
            <NavLink
              active={activeSegment === "campaigns" && activeDetail === campaign.id}
              closeOnNavigate={closeOnNavigate}
              href={`/owner/campaigns/${campaign.id}`}
              key={campaign.id}
              label={campaign.title}
              subLabel={`${formatStatus(campaign.status)} · ${campaign.issuedRewards} rewards`}
            />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function NavLink({
  active = false,
  closeOnNavigate,
  count,
  href,
  icon: Icon,
  label,
  subLabel,
  variant = "default",
}: {
  active?: boolean;
  closeOnNavigate: boolean;
  count?: number;
  href: string;
  icon?: NavIcon;
  label: string;
  subLabel?: string;
  variant?: "default" | "action";
}) {
  const className = `group flex min-h-9 items-center gap-2 rounded-md border-l-2 px-2.5 text-sm transition-colors [&_svg]:size-4 ${
    variant === "action"
      ? "border-transparent text-foreground hover:border-border hover:bg-background"
      : active
        ? "border-foreground bg-background text-foreground shadow-sm"
        : "border-transparent text-muted-foreground hover:border-border hover:bg-background hover:text-foreground"
  }`;

  const content = (
    <Link className={className} href={href}>
      {Icon ? <Icon className="shrink-0" /> : <span className="ml-1 size-1.5 shrink-0 rounded-sm bg-current" />}
      <span className="min-w-0 flex-1">
        <span className="block truncate">{label}</span>
        {subLabel ? <span className="block truncate text-xs opacity-70">{subLabel}</span> : null}
      </span>
      <CountBox count={count} />
    </Link>
  );

  if (!closeOnNavigate) return content;

  return <SheetClose asChild>{content}</SheetClose>;
}

function CountBox({ count }: { count?: number }) {
  if (!count) return null;

  return (
    <span className="ml-auto min-w-5 text-right font-mono text-xs text-muted-foreground">
      {count}
    </span>
  );
}

function OwnerCommandSearch({
  data,
  onOpenChange,
  open,
}: {
  data: OwnerNavigationData;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}) {
  const router = useRouter();

  function goTo(path: string) {
    onOpenChange(false);
    router.push(path);
  }

  return (
    <CommandDialog
      description="Search owner pages and campaigns."
      onOpenChange={onOpenChange}
      open={open}
      title="Find a page"
    >
      <Command>
        <CommandInput placeholder="Search pages and campaigns" />
        <CommandList>
          <CommandEmpty>No matching page found.</CommandEmpty>
          <CommandGroup heading="Pages">
            <CommandItem onSelect={() => goTo("/owner")}>
              <BarChart3 />
              Dashboard
            </CommandItem>
            <CommandItem onSelect={() => goTo("/owner/table-code")}>
              <QrCode />
              Table code
            </CommandItem>
            <CommandItem onSelect={() => goTo("/owner/approvals")}>
              <ClipboardCheck />
              Post queue
            </CommandItem>
            <CommandItem onSelect={() => goTo("/owner/content")}>
              <ImageIcon />
              Content library
            </CommandItem>
            <CommandItem onSelect={() => goTo("/owner/rewards")}>
              <Gift />
              Reward ledger
            </CommandItem>
            <CommandItem onSelect={() => goTo("/owner/settings")}>
              <Settings2 />
              Settings
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Campaigns">
            <CommandItem onSelect={() => goTo("/owner/campaigns")}>
              <BarChart3 />
              All campaigns
            </CommandItem>
            <CommandItem onSelect={() => goTo("/owner/campaigns/new")}>
              <Plus />
              New campaign
            </CommandItem>
            {data.campaigns.map((campaign) => (
              <CommandItem
                key={campaign.id}
                onSelect={() => goTo(`/owner/campaigns/${campaign.id}`)}
              >
                <span className="size-2 rounded-sm bg-current opacity-50" />
                {campaign.title}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
