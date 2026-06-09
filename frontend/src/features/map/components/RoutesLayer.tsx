import { Fragment } from "react";
import { Pane, Polyline } from "react-leaflet";
import { useRoutes } from "@/features/routes/api";
import {
  SelectionKind,
  useSelection,
} from "@/features/map/selection/selection";
import { ROUTES_PANE, Z_INDEX_ROUTES_PANE } from "@/shared/z-index.layers.ts";

export function RoutesLayer() {
  const { data } = useRoutes();
  const { isSelected, toggle } = useSelection();
  const routes = data ?? [];

  return (
    <Pane name={ROUTES_PANE} style={{ zIndex: Z_INDEX_ROUTES_PANE }}>
      {routes.map((route) => {
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
                color: selected ? "#c2410c" : "#e8590c",
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
