import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import {
  AlertCircle,
  BarChart3,
  Camera,
  Check,
  ChevronDown,
  ClipboardCheck,
  Clock3,
  Coffee,
  Download,
  Edit3,
  Eye,
  Filter,
  Gift,
  ImageUp,
  Library,
  Megaphone,
  MoreHorizontal,
  QrCode,
  RefreshCw,
  ScanLine,
  Send,
  Settings2,
  ShieldCheck,
  Sparkles,
  TicketCheck,
  Upload,
  X,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LuminousRewardCard } from "@/components/bribeme/luminous-reward";

const serviceCounterTheme = {
  "--background": "oklch(0.985 0 0)",
  "--foreground": "oklch(0.16 0 0)",
  "--card": "oklch(1 0 0)",
  "--card-foreground": "oklch(0.16 0 0)",
  "--primary": "oklch(0.24 0 0)",
  "--primary-foreground": "oklch(0.99 0 0)",
  "--secondary": "oklch(0.94 0 0)",
  "--secondary-foreground": "oklch(0.18 0 0)",
  "--muted": "oklch(0.94 0 0)",
  "--muted-foreground": "oklch(0.48 0 0)",
  "--accent": "oklch(0.93 0.03 85)",
  "--accent-foreground": "oklch(0.22 0 0)",
  "--border": "oklch(0.88 0 0)",
  "--input": "oklch(0.88 0 0)",
  "--ring": "oklch(0.55 0 0)",
  "--radius": "0.5rem",
} satisfies ThemeStyle;

type ThemeStyle = CSSProperties & Record<`--${string}`, string>;

const rewardRows = [
  ["BRIBE-K69CY5GQ", "Issued", "Free croissant", "May 14"],
  ["BRIBE-F3P8V2JM", "Redeemed", "Next round", "May 7"],
  ["BRIBE-7MQL2Z9A", "Expired", "10% off", "May 3"],
];

export default function StyleboardPage() {
  return (
    <main
      className="min-h-screen bg-background text-foreground"
      style={serviceCounterTheme as CSSProperties}
    >
      <section className="border-b bg-muted/40">
        <div className="mx-auto grid w-full max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-4xl space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="size-4" />
              BribeMe styleboard
            </div>
            <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">
              Product views using the Service Counter direction
            </h1>
            <p className="text-base text-muted-foreground md:text-lg">
              This page maps the product into concrete screens: patron QR flow,
              owner campaign tools, staff redemption, and internal tuning views.
              The interface is intentionally neutral, rectangular, and operational.
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <Button>
              <QrCode /> QR flow
            </Button>
            <Button variant="outline">
              <ClipboardCheck /> Owner queue
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 py-8">
        <Tabs defaultValue="patron" className="gap-6">
          <TabsList className="w-full flex-wrap justify-start sm:w-fit">
            <TabsTrigger value="patron">Patron views</TabsTrigger>
            <TabsTrigger value="owner">Owner views</TabsTrigger>
            <TabsTrigger value="staff">Staff views</TabsTrigger>
            <TabsTrigger value="theme">Theme</TabsTrigger>
          </TabsList>

          <TabsContent value="patron" className="grid gap-5 lg:grid-cols-2">
            <ViewCard
              icon={<QrCode />}
              title="Restaurant QR landing"
              description="The restaurant QR code opens here. The page lists active rewards and can capture optional contact details."
            >
              <div className="grid gap-4 md:grid-cols-[180px_1fr]">
                <div className="grid aspect-square place-items-center rounded-lg border bg-muted">
                  <QrCode className="size-24" />
                </div>
                <div className="space-y-4">
                  <Status tone="neutral" icon={<Gift />}>
                    Free croissant
                  </Status>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-semibold">
                      Take a photo with your coffee
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Upload a clear photo from your table. If it matches the
                      challenge, your reward unlocks instantly.
                    </p>
                  </div>
                  <Button className="w-full md:w-auto">
                    <Camera /> Start submission
                  </Button>
                </div>
              </div>
            </ViewCard>

            <ViewCard
              icon={<ImageUp />}
              title="Submission upload"
              description="Camera capture, preview, and usage rights. This is the highest-friction patron step."
            >
              <div className="grid gap-4 md:grid-cols-[220px_1fr]">
                <PhotoPreview />
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">First name</Label>
                    <Input id="name" defaultValue="Maya" />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="styleboard-email">Email for future rewards</Label>
                      <Input id="styleboard-email" placeholder="Optional" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="styleboard-phone">Phone for future rewards</Label>
                      <Input id="styleboard-phone" placeholder="Optional" />
                    </div>
                  </div>
                  <div className="flex items-start gap-2 rounded-lg border p-3">
                    <Checkbox id="rights" defaultChecked />
                    <Label htmlFor="rights" className="text-sm leading-5">
                      I give the venue permission to use this photo in social
                      posts and marketing.
                    </Label>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Button>
                      <Upload /> Submit
                    </Button>
                    <Button variant="outline">
                      <X /> Retake
                    </Button>
                  </div>
                </div>
              </div>
            </ViewCard>

            <ViewCard
              icon={<Clock3 />}
              title="Validation waiting"
              description="A short hold state while the backend stores the upload and asks the model to judge it."
            >
              <div className="grid gap-4 md:grid-cols-[160px_1fr]">
                <Skeleton className="aspect-square rounded-lg" />
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold">
                      Checking your submission
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      We are checking that the photo is clear and matches the
                      challenge.
                    </p>
                  </div>
                  <Progress value={68} />
                  <div className="grid gap-2 text-sm">
                    <CheckLine checked>Upload saved</CheckLine>
                    <CheckLine checked>Image quality checked</CheckLine>
                    <CheckLine>Reward decision</CheckLine>
                  </div>
                </div>
              </div>
            </ViewCard>

            <ViewCard
              icon={<TicketCheck />}
              title="Reward success"
              description="The coupon screen staff can verify at the counter without needing any explanation."
            >
              <div className="mx-auto max-w-md">
                <LuminousRewardCard />
              </div>
            </ViewCard>

            <ViewCard
              icon={<AlertCircle />}
              title="Try again"
              description="A rejected submission should be direct without feeling punitive."
            >
              <Alert variant="destructive">
                <AlertCircle className="size-4" />
                <AlertTitle>We could not verify this photo</AlertTitle>
                <AlertDescription>
                  The drinks were not clear enough in the image. Take another
                  photo with the table and drinks visible.
                </AlertDescription>
              </Alert>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <Button>
                  <Camera /> Try again
                </Button>
                <Button variant="outline">Back to challenge</Button>
              </div>
            </ViewCard>
          </TabsContent>

          <TabsContent value="owner" className="grid gap-5">
            <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
              <ViewCard
                icon={<BarChart3 />}
                title="Owner dashboard"
                description="The first owner view: campaign health, pending approvals, issued rewards, and budget usage."
              >
                <div className="grid gap-3 md:grid-cols-4">
                  <Metric label="Active campaigns" value="3" />
                  <Metric label="Pending posts" value="12" />
                  <Metric label="Rewards issued" value="47" />
                  <Metric label="Budget used" value="$238" />
                </div>
                <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_260px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Campaign</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Rewards</TableHead>
                        <TableHead className="text-right">Approval</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>Photo with coffee</TableCell>
                        <TableCell>
                          <Status tone="good">Active</Status>
                        </TableCell>
                        <TableCell>18 / 20</TableCell>
                        <TableCell className="text-right">9 pending</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Friends with drinks</TableCell>
                        <TableCell>
                          <Status tone="good">Active</Status>
                        </TableCell>
                        <TableCell>7 / 10</TableCell>
                        <TableCell className="text-right">3 pending</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                  <div className="rounded-lg border p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-sm font-medium">Monthly budget</p>
                      <p className="font-mono text-sm">$238 / $500</p>
                    </div>
                    <Progress value={48} />
                    <p className="mt-3 text-sm text-muted-foreground">
                      Rewards are tracking below the weekly cap.
                    </p>
                  </div>
                </div>
              </ViewCard>

              <ViewCard
                icon={<Megaphone />}
                title="Campaign builder"
                description="The setup form for challenge, reward, budget, and expiry."
              >
                <div className="grid gap-3">
                  <div className="space-y-2">
                    <Label>Challenge</Label>
                    <Input defaultValue="Take a photo with your coffee" />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Reward</Label>
                      <Input defaultValue="Free croissant" />
                    </div>
                    <div className="space-y-2">
                      <Label>Reward limit</Label>
                      <Input defaultValue="20" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <Label htmlFor="captions">Generate captions</Label>
                    <Switch id="captions" defaultChecked />
                  </div>
                </div>
                <CardFooter className="-mx-4 -mb-4 mt-4 gap-2">
                  <Button>
                    <Check /> Create campaign
                  </Button>
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline">
                        <QrCode /> Preview restaurant QR
                      </Button>
                    </SheetTrigger>
                    <SheetContent>
                      <SheetHeader>
                        <SheetTitle>Restaurant QR preview</SheetTitle>
                        <SheetDescription>
                          The QR code can go on table tents, receipts, and
                          counter signage. It routes to active rewards rather
                          than one specific campaign.
                        </SheetDescription>
                      </SheetHeader>
                      <div className="grid gap-4 px-4">
                        <div className="grid aspect-square place-items-center rounded-lg border bg-muted">
                          <QrCode className="size-28" />
                        </div>
                        <div className="rounded-lg border p-3">
                          <p className="text-sm font-medium">
                            Take a photo with your coffee
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Reward: Free croissant
                          </p>
                        </div>
                      </div>
                      <SheetFooter>
                        <Button>
                          <Download /> Download
                        </Button>
                      </SheetFooter>
                    </SheetContent>
                  </Sheet>
                </CardFooter>
              </ViewCard>
            </div>

            <div className="grid gap-5 xl:grid-cols-2">
              <ViewCard
                icon={<QrCode />}
                title="Campaign detail"
                description="A single campaign control room with QR, live stats, and recent submissions."
              >
                <div className="grid gap-4 md:grid-cols-[180px_1fr]">
                  <div className="grid aspect-square place-items-center rounded-lg border bg-muted">
                    <QrCode className="size-24" />
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-semibold">
                        Photo with your coffee
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Free croissant for verified coffee photos.
                      </p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <Metric label="Scans" value="138" />
                      <Metric label="Uploads" value="52" />
                      <Metric label="Approved" value="41" />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button>
                        <Download /> Download restaurant QR
                      </Button>
                      <Button variant="outline">
                        <Settings2 /> Edit rules
                      </Button>
                    </div>
                  </div>
                </div>
              </ViewCard>

              <ViewCard
                icon={<Eye />}
                title="Submission review"
                description="Override the model decision and inspect why a reward was issued or rejected."
              >
                <div className="grid gap-4 md:grid-cols-[180px_1fr]">
                  <PhotoPreview />
                  <div className="space-y-4">
                    <div className="grid gap-2 sm:grid-cols-3">
                      <Score label="Quality" value={92} />
                      <Score label="Task match" value={100} />
                      <Score label="Safety" value={95} />
                    </div>
                    <Alert>
                      <ShieldCheck className="size-4" />
                      <AlertTitle>Model decision: approved</AlertTitle>
                      <AlertDescription>
                        The image is clear, contains a group at the table, and
                        visible drinks satisfy the campaign prompt.
                      </AlertDescription>
                    </Alert>
                    <div className="flex flex-wrap gap-2">
                      <Button>
                        <Check /> Keep approved
                      </Button>
                      <Button variant="destructive">
                        <X /> Override reject
                      </Button>
                    </div>
                  </div>
                </div>
              </ViewCard>

              <ViewCard
                icon={<ClipboardCheck />}
                title="Post queue"
                description="The owner can approve, edit, reject, or mark a generated post as posted in the local demo."
              >
                <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
                  <PhotoPreview />
                  <div className="space-y-4">
                    <Textarea
                      className="min-h-28"
                      defaultValue={
                        "Good vibes and even better company at BribeMe Demo Cafe. Cheers to the moments that matter.\n\n#BribeMeDemoCafe #CafeVibes #FriendshipGoals"
                      }
                    />
                    <div className="grid gap-2 sm:grid-cols-4">
                      <Status tone="neutral">Instagram</Status>
                      <Status tone="neutral">TikTok</Status>
                      <Status tone="neutral">Facebook</Status>
                      <Status tone="neutral">Google</Status>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button>
                            <Send /> Approve post
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Approve this post?</DialogTitle>
                            <DialogDescription>
                              In this local demo, approval changes the local
                              social post state only.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button variant="outline">Keep draft</Button>
                            <Button>Approve</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Button variant="outline">
                        <Edit3 /> Edit
                      </Button>
                      <Button variant="outline">
                        <RefreshCw /> Regenerate caption
                      </Button>
                    </div>
                  </div>
                </div>
              </ViewCard>

              <ViewCard
                icon={<Library />}
                title="Content library"
                description="Approved media archive for downloading, reusing captions, and tracking rights."
              >
                <div className="grid gap-3 sm:grid-cols-3">
                  {[1, 2, 3].map((item) => (
                    <div className="space-y-2" key={item}>
                      <PhotoPreview compact />
                      <div className="flex items-center justify-between gap-2">
                        <Status tone="good" icon={<ShieldCheck />}>
                          Rights captured
                        </Status>
                        <Button variant="ghost" size="icon-sm">
                          <Download />
                          <span className="sr-only">Download</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ViewCard>

              <ViewCard
                icon={<TicketCheck />}
                title="Reward ledger"
                description="Issued, redeemed, expired, and voided codes for operations and budget control."
              >
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Reward</TableHead>
                      <TableHead className="text-right">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rewardRows.map(([code, status, reward, date]) => (
                      <TableRow key={code}>
                        <TableCell className="font-mono">{code}</TableCell>
                        <TableCell>
                          <Status
                            tone={
                              status === "Redeemed"
                                ? "good"
                                : status === "Expired"
                                  ? "muted"
                                  : "neutral"
                            }
                          >
                            {status}
                          </Status>
                        </TableCell>
                        <TableCell>{reward}</TableCell>
                        <TableCell className="text-right">{date}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ViewCard>

              <ViewCard
                icon={<Settings2 />}
                title="Venue settings"
                description="Tone, default hashtags, brand words, and baseline campaign defaults."
              >
                <div className="grid gap-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Venue name</Label>
                      <Input defaultValue="BribeMe Demo Cafe" />
                    </div>
                    <div className="space-y-2">
                      <Label>Default reward cap</Label>
                      <Input defaultValue="20" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Caption tone</Label>
                    <Select defaultValue="warm">
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="warm">Warm and casual</SelectItem>
                        <SelectItem value="clean">Clean and direct</SelectItem>
                        <SelectItem value="playful">Playful</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Textarea defaultValue="#BribeMeDemoCafe #CafeVibes #LocalCoffee" />
                </div>
              </ViewCard>
            </div>
          </TabsContent>

          <TabsContent value="staff" className="grid gap-5 lg:grid-cols-2">
            <ViewCard
              icon={<ScanLine />}
              title="Coupon redeem"
              description="A staff member enters the reward code and marks it redeemed."
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Reward code</Label>
                  <Input className="font-mono" defaultValue="BRIBE-K69CY5GQ" />
                </div>
                <Alert>
                  <TicketCheck className="size-4" />
                  <AlertTitle>Valid reward</AlertTitle>
                  <AlertDescription>
                    Free croissant with any coffee. The code expires in 7 days.
                  </AlertDescription>
                </Alert>
                <Button className="w-full">
                  <Check /> Mark redeemed
                </Button>
              </div>
            </ViewCard>

            <ViewCard
              icon={<Coffee />}
              title="Active campaigns for staff"
              description="Simple shift view: what customers can claim and how many rewards are left."
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Reward</TableHead>
                    <TableHead>Used</TableHead>
                    <TableHead className="text-right">State</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Photo with coffee</TableCell>
                    <TableCell>Free croissant</TableCell>
                    <TableCell>8 / 20</TableCell>
                    <TableCell className="text-right">
                      <Status tone="good">Active</Status>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Friends with drinks</TableCell>
                    <TableCell>Next round</TableCell>
                    <TableCell>3 / 10</TableCell>
                    <TableCell className="text-right">
                      <Status tone="good">Active</Status>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </ViewCard>
          </TabsContent>

          <TabsContent value="theme" className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
            <ViewCard
              icon={<Settings2 />}
              title="Service Counter theme"
              description="This is the keeper: neutral surfaces, black primary actions, thin borders, compact controls, and a restrained warm accent."
            >
              <div className="grid grid-cols-5 gap-2">
                {["primary", "secondary", "accent", "muted", "border"].map(
                  (token) => (
                    <div key={token} className="space-y-1">
                      <div
                        className="h-12 rounded-md border"
                        style={{ background: `var(--${token})` }}
                      />
                      <p className="truncate font-mono text-[10px] text-muted-foreground">
                        {token}
                      </p>
                    </div>
                  ),
                )}
              </div>
              <div className="mt-4 rounded-lg border bg-card p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">Coffee photo campaign</p>
                    <p className="text-xs text-muted-foreground">
                      8 rewards issued
                    </p>
                  </div>
                  <Status tone="good">Active</Status>
                </div>
                <Progress value={62} />
              </div>
            </ViewCard>

            <ViewCard
              icon={<Library />}
              title="Component language"
              description="The product should use compact cards, tables, side sheets, dialogs, rectangular status labels, and icon-led buttons."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-3 rounded-lg border p-4">
                  <p className="font-medium">Buttons</p>
                  <div className="flex flex-wrap gap-2">
                    <Button>
                      <Send /> Approve
                    </Button>
                    <Button variant="outline">
                      <Filter /> Filter
                    </Button>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button size="icon" variant="outline">
                          <ChevronDown />
                          <span className="sr-only">More</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>More actions</TooltipContent>
                    </Tooltip>
                  </div>
                </div>
                <div className="space-y-3 rounded-lg border p-4">
                  <p className="font-medium">Statuses</p>
                  <div className="flex flex-wrap gap-2">
                    <Status tone="good">Approved</Status>
                    <Status tone="neutral">Pending</Status>
                    <Status tone="bad">Rejected</Status>
                    <Status tone="muted">Draft</Status>
                  </div>
                </div>
              </div>
            </ViewCard>
          </TabsContent>
        </Tabs>
      </section>
    </main>
  );
}

function ViewCard({
  icon,
  title,
  description,
  children,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="[&_svg]:size-4">{icon}</span>
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
        <CardAction>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm">
                <MoreHorizontal />
                <span className="sr-only">More actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>View options</DropdownMenuLabel>
              <DropdownMenuItem>
                <Eye /> Preview
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit3 /> Edit copy
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Download /> Export notes
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardAction>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function Status({
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
      className={`inline-flex h-7 items-center gap-1.5 rounded-md border px-2 text-xs font-medium ${tones[tone]} [&_svg]:size-3.5`}
    >
      {icon}
      {children}
    </span>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-card p-3">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function Score({ label, value }: { label: string; value: number }) {
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

function CheckLine({
  checked,
  children,
}: {
  checked?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="grid size-5 place-items-center rounded-md border bg-background">
        {checked ? <Check className="size-3" /> : <Clock3 className="size-3" />}
      </span>
      <span className={checked ? "" : "text-muted-foreground"}>{children}</span>
    </div>
  );
}

function PhotoPreview({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`relative overflow-hidden rounded-lg border ${
        compact ? "aspect-[4/3]" : "aspect-[4/5]"
      }`}
    >
      <Image
        src="/demo/friend-group-drinks-realistic.png"
        alt="Generated cafe group fixture"
        fill
        className="object-cover"
        sizes={compact ? "220px" : "(max-width: 768px) 100vw, 260px"}
      />
    </div>
  );
}
