import { useCallback, useMemo, useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import type { LatLngLiteral } from "leaflet";
import { DeleteFieldsButton } from "@/features/map/components/DeleteFieldsButton";
import { DrawFieldButton } from "@/features/map/components/DrawFieldButton";
import { DrawRouteButton } from "@/features/map/components/DrawRouteButton";
import { FieldsLayer } from "@/features/map/components/FieldsLayer";
import { LocateButton } from "@/features/map/components/LocateButton";
import { LocationMarker } from "@/features/map/components/LocationMarker";
import { RoutesLayer } from "@/features/map/components/RoutesLayer";
import { RouteToolbar } from "@/features/map/components/RouteToolbar";
import type { RouteResponse } from "@/features/routes/api";

export function MapPage() {
  const [position, setPosition] = useState<LatLngLiteral | null>(null);
  const [locationFailed, setLocationFailed] = useState(false);
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<number>>(
    () => new Set(),
  );
  const [selectedRoute, setSelectedRoute] = useState<RouteResponse | null>(
    null,
  );

  const handlePosition = useCallback((pos: LatLngLiteral) => {
    setPosition(pos);
    setLocationFailed(false);
  }, []);

  const handleLocationError = useCallback(() => setLocationFailed(true), []);

  const handleLocationRequest = useCallback(
    () => setLocationFailed(false),
    [],
  );

  const toggleSelect = useCallback((id: number) => {
    setSelectedIds((prev) => {
      if (prev.has(id)) {
        setSelectedRoute((route) => (route?.fieldId === id ? null : route));
        return new Set();
      }
      setSelectedRoute((route) => (route?.fieldId === id ? route : null));
      return new Set([id]);
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
    setSelectedRoute(null);
  }, []);

  const handleRouteClick = useCallback((route: RouteResponse) => {
    setSelectedRoute((prev) => (prev?.id === route.id ? null : route));
  }, []);

  const clearRouteSelection = useCallback(() => setSelectedRoute(null), []);

  const selectedIdList = useMemo(() => [...selectedIds], [selectedIds]);
  const singleSelectedFieldId =
    selectedIdList.length === 1 ? selectedIdList[0] : null;

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={[51.08, 10.42]}
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
        <FieldsLayer selectedIds={selectedIds} onToggleSelect={toggleSelect} />
        <RoutesLayer
          fieldIds={selectedIdList}
          selectedRouteId={selectedRoute?.id ?? null}
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
          <DeleteFieldsButton
            selectedIds={selectedIds}
            onCleared={clearSelection}
          />
          <DrawFieldButton />
          <DrawRouteButton fieldId={singleSelectedFieldId} />
        </div>
      </MapContainer>
      <RouteToolbar route={selectedRoute} onClose={clearRouteSelection} />
    </div>
  );
}
