import { LandPlotIcon, MapPinIcon, RouteIcon, XIcon } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFields } from "@/features/fields/api";
import { useLocations } from "@/features/location/api";
import { useRoutes, type RouteResponse } from "@/features/routes/api";
import { RouteActionsDialog } from "@/features/routes/components/RouteActionsDialog";
import { PlaceActionsDialog } from "@/features/map/components/PlaceActionsDialog";
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

export function SelectionToolbar({
  onEditRoute,
}: {
  onEditRoute: (route: RouteResponse) => void;
}) {
  const { selection, clear } = useSelection();
  const { data: fields } = useFields();
  const { data: locations } = useLocations();
  const { data: routes } = useRoutes();

  if (!selection) return null;

  const name = resolveName(selection, fields, locations, routes);
  if (name === undefined) return null;

  const Icon = ICONS[selection.kind];
  const label = name ?? FALLBACK_NAMES[selection.kind];
  const selectedRoute =
    selection.kind === SelectionKind.Route
      ? routes?.find((route) => route.id === selection.id)
      : undefined;

  return (
    <div className="absolute top-4 left-1/2 z-1000 flex max-w-[calc(100%-2rem)] -translate-x-1/2 items-center gap-2 rounded-md bg-card px-3 py-1.5 shadow-card">
      <Icon className="size-4 text-muted-foreground/60" />
      <span className="min-w-0 truncate text-label-md">{label}</span>
      {selectedRoute && (
        <RouteActionsDialog
          key={selectedRoute.id}
          route={selectedRoute}
          onEdit={() => onEditRoute(selectedRoute)}
        />
      )}
      {selection.kind !== SelectionKind.Route && (
        <PlaceActionsDialog
          key={`${selection.kind}-${selection.id}`}
          kind={selection.kind}
          id={selection.id}
          name={name}
        />
      )}
      <Button
        variant="ghost"
        size="icon"
        onClick={clear}
        aria-label="Auswahl aufheben"
      >
        <XIcon />
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
