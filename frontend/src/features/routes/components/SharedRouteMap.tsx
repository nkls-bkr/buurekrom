import { MapViewport } from "@/features/map/components/MapViewport";
import { MapControls } from "@/features/map/components/MapControls";
import { AttributionControl, MapContainer, TileLayer } from "react-leaflet";
import { CENTER_OF_GERMANY } from "@/constants.ts";
import { FitToRoute } from "@/features/routes/components/FitToRoute";
import { SharedRouteLayer } from "@/features/routes/components/SharedRouteLayer";
import { LocateButton } from "@/features/map/components/LocateButton";
import { LocationMarker } from "@/features/map/components/LocationMarker";
import { useOwnPosition } from "@/features/map/useOwnPosition";
import type { SharedRouteResponse } from "@/features/routes/api";

export function SharedRouteMap({ route }: { route: SharedRouteResponse }) {
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
      attributionControl={false}
      style={{ height: "100%", width: "100%" }}
    >
      <MapViewport />
      <AttributionControl prefix={false} />
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
      <MapControls>
        <LocateButton
          position={position}
          failed={locationFailed}
          onPosition={handlePosition}
          onError={handleLocationError}
          onRequest={handleLocationRequest}
        />
      </MapControls>
    </MapContainer>
  );
}
