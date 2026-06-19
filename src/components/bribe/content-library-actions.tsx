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

export function DeleteContentButton({
  submissionId,
  label,
}: {
  submissionId: string;
  label: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function deleteContent() {
    setPending(true);
    setError(null);

    const response = await fetch(`/api/submissions/${submissionId}`, {
      method: "DELETE",
    });
    const payload = await response.json();

    if (!response.ok) {
      setPending(false);
      setError(payload.error ?? "Delete failed");
      return;
    }

    setPending(false);
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon-sm" variant="outline">
          <Trash2 />
          <span className="sr-only">Delete</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete this image?</DialogTitle>
          <DialogDescription>
            This removes {label} from the content library, rewards, draft posts, and stored media.
          </DialogDescription>
        </DialogHeader>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <DialogFooter>
          <Button disabled={pending} onClick={() => setOpen(false)} variant="outline">
            Cancel
          </Button>
          <Button disabled={pending} onClick={deleteContent} variant="destructive">
            {pending ? <Loader2 className="animate-spin" /> : <Trash2 />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
