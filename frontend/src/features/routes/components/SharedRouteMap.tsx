import { useEffect } from "react";
import { MapContainer, Pane, Polyline, TileLayer, useMap } from "react-leaflet";
import { CENTER_OF_GERMANY } from "@/constants.ts";
import { ROUTES_PANE, Z_INDEX_ROUTES_PANE } from "@/shared/z-index.layers.ts";
import { fitToCoordinates } from "@/features/map/mapNavigation";
import type { PublicRouteResponse } from "@/features/routes/api";

export function SharedRouteMap({ route }: { route: PublicRouteResponse }) {
  return (
    <MapContainer
      center={CENTER_OF_GERMANY}
      zoom={6}
      maxZoom={28}
      zoomControl={false}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={28}
        maxNativeZoom={19}
      />
      <Pane name={ROUTES_PANE} style={{ zIndex: Z_INDEX_ROUTES_PANE }}>
        <Polyline
          pane={ROUTES_PANE}
          positions={route.geometry.coordinates.map<[number, number]>(
            ([lng, lat]) => [lat, lng],
          )}
          pathOptions={{
            color: "#e8590c",
            weight: 5,
            opacity: 1,
            lineCap: "round",
            lineJoin: "round",
          }}
        />
      </Pane>
      <FitToRoute route={route} />
    </MapContainer>
  );
}

function FitToRoute({ route }: { route: PublicRouteResponse }) {
  const map = useMap();
  useEffect(() => {
    fitToCoordinates(map, route.geometry.coordinates);
  }, [map, route]);
  return null;
}
