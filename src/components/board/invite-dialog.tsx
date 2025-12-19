"use client";

import { useMemo, useState } from "react";
import { Copy } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface InviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roomId: string;
}

export function InviteDialog({
  open,
  onOpenChange,
  roomId,
}: InviteDialogProps) {
  const [copied, setCopied] = useState<"edit" | "readonly" | null>(null);

  const links = useMemo(() => {
    if (typeof window === "undefined") {
      return { editUrl: "", readOnlyUrl: "" };
    }
    const hash = window.location.hash || "";
    const baseUrl = new URL(`/board/${roomId}`, window.location.origin);
    const readOnlyUrl = new URL(baseUrl.toString());
    readOnlyUrl.searchParams.set("readonly", "1");
    return {
      editUrl: `${baseUrl.toString()}${hash}`,
      readOnlyUrl: `${readOnlyUrl.toString()}${hash}`,
    };
  }, [roomId, open]);

  const handleCopy = async (value: string, type: "edit" | "readonly") => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(type);
      window.setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error("Failed to copy invite link:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Invite</DialogTitle>
          <DialogDescription>
            Share an edit link or a read-only link.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="invite-edit-link">Edit link</Label>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Input
                id="invite-edit-link"
                value={links.editUrl}
                readOnly
                className="font-mono text-xs"
                data-dialog-initial-focus
              />
              <Button
                type="button"
                variant="secondary"
                onClick={() => handleCopy(links.editUrl, "edit")}
                className="sm:w-36"
              >
                <Copy className="h-4 w-4" />
                {copied === "edit" ? "Copied" : "Copy"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Anyone with this link can edit and see cursors.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="invite-readonly-link">Read-only link</Label>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Input
                id="invite-readonly-link"
                value={links.readOnlyUrl}
                readOnly
                className="font-mono text-xs"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={() => handleCopy(links.readOnlyUrl, "readonly")}
                className="sm:w-36"
              >
                <Copy className="h-4 w-4" />
                {copied === "readonly" ? "Copied" : "Copy"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Read-only hides cursors and editing tools.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
