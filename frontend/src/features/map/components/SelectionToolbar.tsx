import { LandPlotIcon, MapPinIcon, RouteIcon, XIcon } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFields } from "@/features/fields/api";
import { useLocations } from "@/features/location/api";
import { useRoutes } from "@/features/routes/api";
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
    <div className="absolute top-4 left-1/2 z-[1000] flex -translate-x-1/2 items-center gap-2 rounded-full bg-card px-3 py-1.5 shadow-card">
      <Icon className="size-4 text-muted-foreground" />
      <span className="text-label-md">{label}</span>
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
