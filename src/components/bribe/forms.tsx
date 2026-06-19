"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Camera, Check, Loader2, RefreshCw, Send, Upload } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatStatus } from "@/lib/format";
import type { Campaign, Reward, SocialPost } from "@/lib/types";

type ApiState = {
  pending: boolean;
  error: string | null;
  message: string | null;
};

const initialState: ApiState = { pending: false, error: null, message: null };

export function PatronSubmissionForm({
  campaigns,
  selectedCampaignId,
}: {
  campaigns: Campaign[];
  selectedCampaignId?: string;
}) {
  const router = useRouter();
  const [state, setState] = useState(initialState);
  const selectedExists = campaigns.some((item) => item.id === selectedCampaignId);
  const [campaignId, setCampaignId] = useState(selectedExists ? selectedCampaignId ?? "" : "");
  const [hasConsent, setHasConsent] = useState(false);
  const campaign = campaigns.find((item) => item.id === campaignId);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ pending: true, error: null, message: "Uploading and checking the image..." });

    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/submissions", {
      method: "POST",
      body: form,
    });
    const payload = await response.json();

    if (!response.ok) {
      setState({
        pending: false,
        error: payload.error ?? "Submission failed",
        message: null,
      });
      return;
    }

    const submissionId = payload.submission?.id;
    if (payload.reward?.code) {
      router.push(`/patron/reward?code=${encodeURIComponent(payload.reward.code)}`);
      return;
    }

    router.push(`/patron/try-again?submissionId=${encodeURIComponent(submissionId)}`);
  }

  return (
    <form className="grid content-start gap-4" onSubmit={onSubmit}>
      <input name="campaignId" type="hidden" value={campaignId} />
      <div className="space-y-2">
        <Label htmlFor="campaign">Task</Label>
        <select
          className="h-9 w-full rounded-lg border bg-background px-2.5 text-sm"
          id="campaign"
          onChange={(event) => setCampaignId(event.target.value)}
          required
          value={campaignId}
        >
          <option disabled value="">
            Choose a task
          </option>
          {campaigns.map((item) => (
            <option key={item.id} value={item.id}>
              {item.title} - {item.rewardLabel}
            </option>
          ))}
        </select>
        {campaign ? (
          <div className="rounded-lg border bg-muted/30 p-3">
            <p className="text-xs font-medium text-muted-foreground">Photo task</p>
            <p className="mt-1 text-sm leading-5">{campaign.challengePrompt}</p>
            <p className="mt-3 text-xs font-medium text-muted-foreground">Reward</p>
            <p className="mt-1 text-sm font-medium">{campaign.rewardLabel}</p>
          </div>
        ) : campaigns.length ? (
          <p className="text-sm leading-5 text-muted-foreground">
            Choose one of today&apos;s tasks before uploading.
          </p>
        ) : (
          <p className="text-sm leading-5 text-muted-foreground">
            There are no active tasks to submit right now.
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="patronName">First name</Label>
        <Input id="patronName" name="patronName" placeholder="Maya" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="media">Photo or video</Label>
        <Input accept="image/png,image/jpeg,image/webp,video/mp4,video/webm" id="media" name="media" required type="file" />
      </div>
      <label className="flex items-start gap-2 rounded-lg border p-3 text-sm leading-5">
        <input
          checked={hasConsent}
          className="mt-1"
          onChange={(event) => setHasConsent(event.target.checked)}
          required
          type="checkbox"
        />
        I give the venue permission to use this photo in social posts, ads, and other marketing.
      </label>
      {state.error ? (
        <Alert variant="destructive">
          <AlertTitle>Submission failed</AlertTitle>
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}
      {state.message ? (
        <Alert>
          <Loader2 className="size-4 animate-spin" />
          <AlertTitle>Checking now</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}
      <Button disabled={state.pending || !campaignId || !hasConsent} type="submit">
        {state.pending ? <Loader2 className="animate-spin" /> : <Upload />}
        Submit photo
      </Button>
    </form>
  );
}

export function CampaignForm({ venueName }: { venueName: string }) {
  const router = useRouter();
  const [state, setState] = useState(initialState);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ pending: true, error: null, message: null });
    const form = new FormData(event.currentTarget);
    const budget = parseDollarAmount(String(form.get("budget") ?? ""));

    const response = await fetch("/api/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        venueName,
        venueSlug: "demo-cafe",
        title: String(form.get("title") ?? ""),
        challengePrompt: String(form.get("challengePrompt") ?? ""),
        rewardLabel: String(form.get("rewardLabel") ?? ""),
        budgetCents: budget,
        maxRedemptions: Number(form.get("maxRedemptions") ?? 0) || null,
        status: "active",
      }),
    });
    const payload = await response.json();

    if (!response.ok) {
      setState({ pending: false, error: payload.error ?? "Campaign creation failed", message: null });
      return;
    }

    router.push(`/owner/campaigns/${payload.campaign.id}`);
    router.refresh();
  }

  return (
    <form className="grid gap-5 xl:grid-cols-[1fr_320px]" onSubmit={onSubmit}>
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Campaign name</Label>
          <Input id="title" name="title" required defaultValue="Coffee and croissant" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="challengePrompt">Challenge</Label>
          <Textarea
            id="challengePrompt"
            name="challengePrompt"
            required
            defaultValue="Take a clear photo with your coffee visible at the table."
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="rewardLabel">Reward</Label>
            <Input id="rewardLabel" name="rewardLabel" required defaultValue="Free croissant" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxRedemptions">Reward limit</Label>
            <Input id="maxRedemptions" name="maxRedemptions" inputMode="numeric" defaultValue="20" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="budget">Budget</Label>
          <Input id="budget" name="budget" defaultValue="$100" />
        </div>
      </div>
      <div className="grid content-start gap-3">
        {state.error ? (
          <Alert variant="destructive">
            <AlertTitle>Could not save</AlertTitle>
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        ) : null}
        <Button disabled={state.pending} type="submit">
          {state.pending ? <Loader2 className="animate-spin" /> : <Check />}
          Save campaign
        </Button>
      </div>
    </form>
  );
}

export function StaffRedeemForm({ initialCode }: { initialCode?: string }) {
  const [code, setCode] = useState(initialCode ?? "");
  const [reward, setReward] = useState<Reward | null>(null);
  const [state, setState] = useState(initialState);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  async function checkReward(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ pending: true, error: null, message: null });
    const response = await fetch(`/api/rewards/${encodeURIComponent(code.trim())}`);
    const payload = await response.json();

    if (!response.ok) {
      setReward(null);
      setState({ pending: false, error: payload.error ?? "Reward not found", message: null });
      return;
    }

    setReward(payload.reward);
    setState({ pending: false, error: null, message: "Reward loaded" });
  }

  async function redeem() {
    setState({ pending: true, error: null, message: null });
    const response = await fetch(`/api/rewards/${encodeURIComponent(code.trim())}/redeem`, {
      method: "POST",
    });
    const payload = await response.json();

    if (!response.ok) {
      setState({ pending: false, error: payload.error ?? "Redeem failed", message: null });
      return;
    }

    setReward(payload.reward);
    setState({ pending: false, error: null, message: "Reward marked redeemed" });
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
      <form className="space-y-4 rounded-lg border bg-card p-5" onSubmit={checkReward}>
        <div className="space-y-2">
          <Label htmlFor="reward-code">Reward code</Label>
          <Input
            className="font-mono"
            id="reward-code"
            onChange={(event) => setCode(event.target.value)}
            placeholder="bribe-abcdefgh"
            value={code}
          />
        </div>
        <input
          accept="image/*"
          capture="environment"
          className="sr-only"
          ref={cameraInputRef}
          tabIndex={-1}
          type="file"
        />
        <Button
          className="w-full"
          onClick={() => cameraInputRef.current?.click()}
          type="button"
          variant="outline"
        >
          <Camera /> Open camera
        </Button>
        <Button className="w-full" disabled={state.pending || !code.trim()} type="submit">
          {state.pending ? <Loader2 className="animate-spin" /> : <Send />}
          Check code
        </Button>
        {reward ? (
          <Button className="w-full" disabled={state.pending || reward.status !== "issued"} onClick={redeem} type="button">
            <Check /> Mark redeemed
          </Button>
        ) : null}
        {state.error ? (
          <Alert variant="destructive">
            <AlertTitle>Code problem</AlertTitle>
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        ) : null}
        {state.message ? (
          <Alert>
            <AlertTitle>{state.message}</AlertTitle>
            <AlertDescription>{reward ? `${reward.label} is ${formatStatus(reward.status)}.` : "Ready."}</AlertDescription>
          </Alert>
        ) : null}
      </form>
      <div className="rounded-lg border bg-card p-5">
        <p className="text-sm text-muted-foreground">Reward</p>
        <p className="mt-1 text-2xl font-semibold">{reward?.label ?? "Check a code"}</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <Detail label="Code" value={reward?.code ?? "-"} mono />
          <Detail label="State" value={reward ? formatStatus(reward.status) : "-"} />
          <Detail label="Expires" value={reward?.expiresAt ? formatDate(reward.expiresAt) : "-"} />
        </div>
      </div>
    </div>
  );
}

export function SocialApprovalButton({ post }: { post: SocialPost }) {
  const router = useRouter();
  const [state, setState] = useState(initialState);

  async function regenerateCaption() {
    setState({ pending: true, error: null, message: null });
    const response = await fetch(`/api/social-posts/${post.id}/caption`, {
      method: "POST",
    });
    const payload = await response.json();
    if (!response.ok) {
      setState({
        pending: false,
        error: payload.error ?? "Caption regeneration failed",
        message: null,
      });
      return;
    }
    setState({ pending: false, error: null, message: "Post copy regenerated" });
    router.refresh();
  }

  async function approve() {
    setState({ pending: true, error: null, message: null });
    const response = await fetch(`/api/social-posts/${post.id}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markPosted: true }),
    });
    const payload = await response.json();
    if (!response.ok) {
      setState({ pending: false, error: payload.error ?? "Approval failed", message: null });
      return;
    }
    setState({ pending: false, error: null, message: "Approved and marked posted" });
    router.refresh();
  }

  return (
    <div className="grid gap-2">
      <div className="grid min-w-0 grid-cols-[repeat(auto-fit,minmax(min(100%,13rem),1fr))] gap-2">
        <Button
          className="w-full min-w-0"
          disabled={state.pending || post.status !== "draft"}
          onClick={regenerateCaption}
          variant="outline"
        >
          {state.pending ? <Loader2 className="animate-spin" /> : <RefreshCw />}
          Regenerate copy
        </Button>
        <Button
          className="w-full min-w-0"
          disabled={state.pending || post.status !== "draft"}
          onClick={approve}
        >
          {state.pending ? <Loader2 className="animate-spin" /> : <Send />}
          Approve post
        </Button>
      </div>
      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state.message ? <p className="text-sm text-muted-foreground">{state.message}</p> : null}
    </div>
  );
}

function Detail({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={`mt-1 font-medium capitalize ${mono ? "font-mono normal-case" : ""}`}>{value}</p>
    </div>
  );
}

function parseDollarAmount(value: string) {
  const dollars = Number(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(dollars) && dollars > 0 ? Math.round(dollars * 100) : null;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}
