import { Pane, Polyline } from "react-leaflet";
import { ROUTES_PANE, Z_INDEX_ROUTES_PANE } from "@/shared/z-index.layers.ts";
import type { PublicRouteResponse } from "@/features/routes/api";

export function SharedRouteLayer({ route }: { route: PublicRouteResponse }) {
  return (
    <Pane name={ROUTES_PANE} style={{ zIndex: Z_INDEX_ROUTES_PANE }}>
      <Polyline
        pane={ROUTES_PANE}
        positions={route.geometry.coordinates.map<[number, number]>(
          ([lng, lat]) => [lat, lng],
        )}
        pathOptions={{
          color: "#772d0c",
          weight: 5,
          opacity: 1,
          lineCap: "round",
          lineJoin: "round",
        }}
      />
    </Pane>
  );
}