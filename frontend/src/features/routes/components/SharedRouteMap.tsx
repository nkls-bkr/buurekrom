import { MapContainer, TileLayer } from "react-leaflet";
import { CENTER_OF_GERMANY } from "@/constants.ts";
import { FitToRoute } from "@/features/routes/components/FitToRoute";
import { SharedRouteLayer } from "@/features/routes/components/SharedRouteLayer";
import { LocateButton } from "@/features/map/components/LocateButton";
import { LocationMarker } from "@/features/map/components/LocationMarker";
import { useOwnPosition } from "@/features/map/useOwnPosition";
import type { PublicRouteResponse } from "@/features/routes/api";

export function SharedRouteMap({ route }: { route: PublicRouteResponse }) {
  const {
    position,
    locationFailed,
    handlePosition,
    handleLocationError,
    handleLocationRequest,
  } = useOwnPosition();

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
      <SharedRouteLayer route={route} />
      <FitToRoute route={route} />
      <LocationMarker
        position={position}
        onPosition={handlePosition}
        onError={handleLocationError}
      />
      <div className="absolute bottom-6 left-4 z-1000 flex flex-col-reverse gap-6">
        <LocateButton
          position={position}
          failed={locationFailed}
          onPosition={handlePosition}
          onError={handleLocationError}
          onRequest={handleLocationRequest}
        />
      </div>
    </MapContainer>
  );
}
