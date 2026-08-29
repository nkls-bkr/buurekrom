import { Fragment } from "react";
import { Pane, Polyline } from "react-leaflet";
import { useRoutes } from "@/features/routes/api";
import {
  SelectionKind,
  useSelection,
} from "@/features/map/selection/selection";
import { ROUTES_PANE, Z_INDEX_ROUTES_PANE } from "@/shared/z-index.layers.ts";
import { useRouteVisibility } from "@/features/map/visibility/visibility";

export function RoutesLayer() {
  const { data } = useRoutes();
  const { isSelected, toggle } = useSelection();
  const { isVisible } = useRouteVisibility();
  const routes = data ?? [];

  const visibleRoutes = routes.filter((route) => isVisible(route.id));

  return (
    <Pane name={ROUTES_PANE} style={{ zIndex: Z_INDEX_ROUTES_PANE }}>
      {visibleRoutes.map((route) => {
        const positions = route.geometry.coordinates.map<[number, number]>(
          ([lng, lat]) => [lat, lng],
        );
        const selected = isSelected(SelectionKind.Route, route.id);
        return (
          <Fragment key={route.id}>
            <Polyline
              pane={ROUTES_PANE}
              positions={positions}
              pathOptions={{
                color: selected ? "#772d0c" : "#4d6450",
                weight: selected ? 7 : 5,
                lineCap: "round",
                lineJoin: "round",
              }}
              eventHandlers={{
                click: () => toggle(SelectionKind.Route, route.id),
              }}
            />
          </Fragment>
        );
      })}
    </Pane>
  );
}
