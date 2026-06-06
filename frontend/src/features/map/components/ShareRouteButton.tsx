import { useEffect, useState } from "react";
import { CheckIcon, CopyIcon, Share2Icon } from "lucide-react";
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
  const [url, setUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    setUrl(null);
    setCopied(false);
    shareMutation.mutate(routeId, {
      onSuccess: ({ shareToken }) => {
        setUrl(`${window.location.origin}/share/${shareToken}`);
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, routeId]);

  async function handleCopy() {
    if (!url) return;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => setOpen(true)}
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
          <div className="flex items-center gap-2">
            <Input
              readOnly
              value={url ?? ""}
              placeholder={
                shareMutation.isPending ? "Link wird erstellt …" : ""
              }
              onFocus={(e) => e.currentTarget.select()}
            />
            <Button
              variant="secondary"
              size="icon"
              onClick={handleCopy}
              disabled={!url}
              aria-label="Link in Zwischenablage kopieren"
            >
              {copied ? (
                <CheckIcon className="size-4" />
              ) : (
                <CopyIcon className="size-4" />
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}