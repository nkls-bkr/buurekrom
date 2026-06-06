import { useEffect, useState } from "react";
import {
  CheckIcon,
  CopyIcon,
  LandPlotIcon,
  MapPinIcon,
  RouteIcon,
  Share2Icon,
  XIcon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useFields } from "@/features/fields/api";
import { useLocations } from "@/features/location/api";
import { useRoutes, useShareRouteMutation } from "@/features/routes/api";
import {
  SelectionKind,
  useSelection,
} from "@/features/map/selection/selection";

const ICONS: Record<SelectionKind, LucideIcon> = {
  [SelectionKind.Field]: LandPlotIcon,
  [SelectionKind.Location]: MapPinIcon,
  [SelectionKind.Route]: RouteIcon,
};

const FALLBACK_NAMES: Record<SelectionKind, string> = {
  [SelectionKind.Field]: "Feld",
  [SelectionKind.Location]: "Standort",
  [SelectionKind.Route]: "Route",
};

export function SelectionToolbar() {
  const { selection, clear } = useSelection();
  const { data: fields } = useFields();
  const { data: locations } = useLocations();
  const { data: routes } = useRoutes();

  if (!selection) return null;

  const name = resolveName(selection, fields, locations, routes);
  if (name === undefined) return null;

  const Icon = ICONS[selection.kind];
  const label = name ?? FALLBACK_NAMES[selection.kind];

  return (
    <div className="absolute top-4 left-1/2 z-1000 flex -translate-x-1/2 items-center gap-2 rounded-full bg-card px-3 py-1.5 shadow-card">
      <Icon className="size-4 text-muted-foreground" />
      <span className="text-label-md">{label}</span>
      {selection.kind === SelectionKind.Route && (
        <>
          <ShareRouteButton routeId={selection.id} />
          <Separator orientation="vertical" className="my-1" />
        </>
      )}
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={clear}
        aria-label="Auswahl aufheben"
      >
        <XIcon className="size-4" />
      </Button>
    </div>
  );
}

function ShareRouteButton({ routeId }: { routeId: number }) {
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

function resolveName(
  selection: NonNullable<ReturnType<typeof useSelection>["selection"]>,
  fields: ReturnType<typeof useFields>["data"],
  locations: ReturnType<typeof useLocations>["data"],
  routes: ReturnType<typeof useRoutes>["data"],
): string | null | undefined {
  switch (selection.kind) {
    case SelectionKind.Field:
      return fields?.find((f) => f.id === selection.id)?.name;
    case SelectionKind.Location:
      return locations?.find((l) => l.id === selection.id)?.name;
    case SelectionKind.Route:
      return routes?.find((r) => r.id === selection.id)?.name;
  }
}
