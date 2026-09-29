import { useState } from "react";
import { CheckIcon, CopyIcon, Share2Icon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useShareRouteMutation } from "@/features/routes/api";

export function ShareRouteButton({ routeId }: { routeId: number }) {
  const shareMutation = useShareRouteMutation();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const url = shareMutation.data
    ? `${window.location.origin}/share/${shareMutation.data.shareToken}`
    : null;

  function openDialog() {
    setCopied(false);
    shareMutation.reset();
    setOpen(true);
    shareMutation.mutate(routeId);
  }

  async function handleCopy() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      toast.error(
        "Kopieren nicht möglich. Halte den Link gedrückt, um ihn zu kopieren.",
      );
    }
  }

  async function handleShare() {
    if (!url) return;
    try {
      await navigator.share({ title: "Buurekrom – geteilte Route", url });
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) {
        toast.error(
          "Teilen nicht möglich. Du kannst stattdessen den Link kopieren.",
        );
      }
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={openDialog}
        aria-label="Route teilen"
      >
        <Share2Icon className="size-4" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Route teilen</DialogTitle>
            <DialogDescription>
              Wer diesen Link hat, kann die Route ansehen.
            </DialogDescription>
          </DialogHeader>
          {shareMutation.isError ? (
            <div role="alert" className="space-y-3">
              <p>Der Link konnte nicht erstellt werden.</p>
              <Button
                variant="outline"
                onClick={() => shareMutation.mutate(routeId)}
              >
                Erneut versuchen
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Input
                readOnly
                aria-label="Freigabelink"
                value={url ?? ""}
                placeholder={
                  shareMutation.isPending ? "Link wird erstellt …" : ""
                }
                onFocus={(event) => event.currentTarget.select()}
              />
              <Button
                variant="secondary"
                size="icon"
                onClick={handleCopy}
                disabled={!url}
                aria-label="Link kopieren"
              >
                {copied ? (
                  <CheckIcon className="size-4" />
                ) : (
                  <CopyIcon className="size-4" />
                )}
              </Button>
            </div>
          )}
          {typeof navigator.share === "function" && (
            <Button
              onClick={handleShare}
              disabled={!url || shareMutation.isPending}
            >
              <Share2Icon className="size-4" /> Link teilen
            </Button>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
