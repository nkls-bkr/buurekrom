import { useCallback, useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import type { LatLngLiteral } from "leaflet";
import { DeleteSelectionButton } from "@/features/map/components/DeleteSelectionButton";
import { DrawFieldButton } from "@/features/map/components/DrawFieldButton";
import { DrawRouteButton } from "@/features/map/components/DrawRouteButton";
import { FieldsLayer } from "@/features/map/components/FieldsLayer";
import { LocateButton } from "@/features/map/components/LocateButton";
import { LocationMarker } from "@/features/map/components/LocationMarker";
import { RoutesLayer } from "@/features/map/components/RoutesLayer";
import { RouteToolbar } from "@/features/map/components/RouteToolbar";
import type { RouteResponse } from "@/features/routes/api";
import { CENTER_OF_GERMANY } from "@/constants.ts";
import { LocationsLayer } from "@/features/map/components/LocationsLayer.tsx";
import { DrawLocationButton } from "@/features/map/components/DrawLocationButton.tsx";
import {
  SelectionKind,
  useSelection,
} from "@/features/map/selection/selection";

export function MapPage() {
  const { selection } = useSelection();
  const [position, setPosition] = useState<LatLngLiteral | null>(null);
  const [locationFailed, setLocationFailed] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<RouteResponse | null>(
    null,
  );

  const handlePosition = useCallback((pos: LatLngLiteral) => {
    setPosition(pos);
    setLocationFailed(false);
  }, []);

  const handleLocationError = useCallback(() => setLocationFailed(true), []);

  const handleLocationRequest = useCallback(() => setLocationFailed(false), []);

  //TODO route selection refactor with selectioncontext
  const handleRouteClick = useCallback((route: RouteResponse) => {
    setSelectedRoute((prev) => (prev?.id === route.id ? null : route));
  }, []);

  const clearRouteSelection = useCallback(() => setSelectedRoute(null), []);

  const selectedFieldId =
    selection?.kind === SelectionKind.Field ? selection.id : null;

  const activeRoute =
    selectedRoute && selectedRoute.fieldId === selectedFieldId
      ? selectedRoute
      : null;

  const selectedFieldIds = selectedFieldId !== null ? [selectedFieldId] : [];

  return (
    <div className="relative h-full w-full">
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
        <FieldsLayer />
        <LocationsLayer></LocationsLayer>
        <RoutesLayer
          fieldIds={selectedFieldIds}
          selectedRouteId={activeRoute?.id ?? null}
          onRouteClick={handleRouteClick}
        />
        <LocationMarker
          position={position}
          onPosition={handlePosition}
          onError={handleLocationError}
        />
        <div className="absolute bottom-6 left-4 z-1000 flex flex-col-reverse gap-2">
          <LocateButton
            position={position}
            failed={locationFailed}
            onPosition={handlePosition}
            onError={handleLocationError}
            onRequest={handleLocationRequest}
          />
          <DeleteSelectionButton />
          <DrawFieldButton />
          <DrawRouteButton />
          <DrawLocationButton />
        </div>
      </MapContainer>
      <RouteToolbar route={activeRoute} onClose={clearRouteSelection} />
    </div>
  );
}
