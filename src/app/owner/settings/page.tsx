import { Save, Settings2 } from "lucide-react";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { AppCard, PageShell } from "@/components/bribe/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ensureDemoData } from "@/lib/demo-data";
import { updateVenue } from "@/lib/repositories";
import { UpdateVenueSchema } from "@/lib/schemas";

export const dynamic = "force-dynamic";

const settingsFormId = "venue-settings-form";

async function saveVenueSettings(formData: FormData) {
  "use server";

  const venueId = String(formData.get("venueId") ?? "");
  const input = UpdateVenueSchema.parse({
    name: formData.get("name"),
  });

  await updateVenue(venueId, input);
  revalidatePath("/owner");
  revalidatePath("/owner/settings");
  redirect("/owner/settings?saved=1");
}

export default async function VenueSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const { venue } = await ensureDemoData();

  return (
    <PageShell
      role="owner"
      title="Venue settings"
      description="Brand defaults, caption tone, hashtags, and baseline campaign rules."
      actions={
        <Button form={settingsFormId} type="submit">
          <Save /> Save settings
        </Button>
      }
    >
      {saved ? (
        <div className="mb-5 rounded-lg border bg-muted/30 px-4 py-3 text-sm">
          Settings saved.
        </div>
      ) : null}
      <form action={saveVenueSettings} className="grid gap-5 xl:grid-cols-2" id={settingsFormId}>
        <input name="venueId" type="hidden" value={venue.id} />
        <AppCard
          description="Basic venue identity shown across owner and guest flows."
          icon={<Settings2 />}
          title="Venue profile"
        >
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Venue name</Label>
              <Input defaultValue={venue.name} id="name" name="name" required />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label htmlFor="approval">Require owner approval</Label>
              <Switch id="approval" defaultChecked />
            </div>
          </div>
        </AppCard>
        <AppCard
          description="Defaults used when captions are drafted for approved content."
          title="Caption defaults"
        >
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label>Caption tone</Label>
              <Select defaultValue="warm">
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="warm">Warm and casual</SelectItem>
                  <SelectItem value="direct">Clean and direct</SelectItem>
                  <SelectItem value="playful">Playful</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Default hashtags</Label>
              <Textarea defaultValue="#BribeDemoCafe #CafeVibes #LocalCoffee" />
            </div>
          </div>
        </AppCard>
        <AppCard
          description="Defaults used when a new reward campaign is created."
          title="Campaign defaults"
        >
          <div className="grid gap-3">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label htmlFor="suggest">Suggest new campaigns</Label>
              <Switch id="suggest" defaultChecked />
            </div>
            <div className="space-y-2">
              <Label>Words to avoid</Label>
              <Textarea defaultValue="cheap, viral, influencer" />
            </div>
          </div>
        </AppCard>
      </form>
    </PageShell>
  );
}
