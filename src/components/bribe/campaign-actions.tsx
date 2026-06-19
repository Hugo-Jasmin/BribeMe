"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function DeleteCampaignButton({
  campaignId,
  redirectTo,
  title,
}: {
  campaignId: string;
  redirectTo?: string;
  title: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function deleteCampaign() {
    setPending(true);
    setError(null);

    const response = await fetch(`/api/campaigns/${campaignId}`, {
      method: "DELETE",
    });
    const payload = await response.json();

    if (!response.ok) {
      setPending(false);
      setError(payload.error ?? "Delete failed");
      return;
    }

    setOpen(false);
    setPending(false);

    if (redirectTo) {
      router.replace(redirectTo);
      return;
    }

    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !pending && setOpen(nextOpen)}>
      <DialogTrigger asChild>
        <Button aria-label={`Delete ${title}`} size="icon-sm" title={`Delete ${title}`} variant="outline">
          <Trash2 />
          <span className="sr-only">Delete</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete this campaign?</DialogTitle>
          <DialogDescription>
            This removes {title}, its customer submissions, rewards, and draft posts.
          </DialogDescription>
        </DialogHeader>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <DialogFooter>
          <Button disabled={pending} onClick={() => setOpen(false)} variant="outline">
            Cancel
          </Button>
          <Button disabled={pending} onClick={deleteCampaign} variant="destructive">
            {pending ? <Loader2 className="animate-spin" /> : <Trash2 />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
