import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { MapContainer, Pane, Polyline, TileLayer, useMap } from "react-leaflet";
import { latLngBounds } from "leaflet";
import { useSharedRoute, type PublicRouteResponse } from "@/features/routes/api";
import { CENTER_OF_GERMANY } from "@/constants.ts";
import { ROUTES_PANE, Z_INDEX_ROUTES_PANE } from "@/shared/z-index.layers.ts";

export function SharedRoutePage() {
  const { token } = useParams<{ token: string }>();
  const { data: route, isLoading, isError } = useSharedRoute(token ?? "");

  return (
    <div className="relative h-screen w-screen">
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
        {route && (
          <>
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
          </>
        )}
      </MapContainer>
      {isLoading && <Banner>Lade Route …</Banner>}
      {isError && (
        <Banner>Diese Route existiert nicht oder wurde nicht geteilt.</Banner>
      )}
      {route?.name && <Banner>{route.name}</Banner>}
    </div>
  );
}

function FitToRoute({ route }: { route: PublicRouteResponse }) {
  const map = useMap();
  useEffect(() => {
    const coords = route.geometry.coordinates;
    if (coords.length === 0) return;
    const bounds = latLngBounds(coords.map(([lng, lat]) => [lat, lng]));
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 17 });
  }, [map, route]);
  return null;
}

function Banner({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute top-4 left-1/2 z-[1000] -translate-x-1/2 rounded-full bg-card px-4 py-1.5 text-label-md shadow-card">
      {children}
    </div>
  );
}
