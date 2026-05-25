import { Fragment } from "react";
import { Pane, Polyline } from "react-leaflet";
import { useRoutes, type RouteResponse } from "@/features/routes/api";
import { ROUTES_PANE, Z_INDEX_ROUTES_PANE } from "@/shared/z-index.layers.ts";

interface RoutesLayerProps {
  selectedRouteId: number | null;
  onRouteClick: (route: RouteResponse) => void;
}

export function RoutesLayer({
  selectedRouteId,
  onRouteClick,
}: RoutesLayerProps) {
  const { data } = useRoutes();
  const routes = data ?? [];

  return (
    <Pane name={ROUTES_PANE} style={{ zIndex: Z_INDEX_ROUTES_PANE }}>
      {routes.map((route) => {
        const positions = route.geometry.coordinates.map<[number, number]>(
          ([lng, lat]) => [lat, lng],
        );
        const selected = route.id === selectedRouteId;
        const dimmed = selectedRouteId !== null && !selected;
        const handlers = { click: () => onRouteClick(route) };
        return (
          <Fragment key={route.id}>
            <Polyline
              pane={ROUTES_PANE}
              positions={positions}
              pathOptions={{
                color: selected ? "#c2410c" : "#e8590c",
                weight: selected ? 7 : 5,
                opacity: dimmed ? 0.2 : 1,
                lineCap: "round",
                lineJoin: "round",
              }}
              eventHandlers={handlers}
            />
          </Fragment>
        );
      })}
    </Pane>
  );
}
