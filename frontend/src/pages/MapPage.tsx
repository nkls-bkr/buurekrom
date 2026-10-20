import { MapViewport } from "@/features/map/components/MapViewport";
import { FocusRoute } from "@/features/map/components/FocusRoute";
import { MapControls } from "@/features/map/components/MapControls";
import { AttributionControl, MapContainer, TileLayer } from "react-leaflet";
import { MapCreateDialog } from "@/features/map/components/MapCreateDialog";
import { LocateButton } from "@/features/map/components/LocateButton";
import { FieldsLayer } from "@/features/map/components/FieldsLayer";
import { LocationMarker } from "@/features/map/components/LocationMarker";
import { RoutesLayer } from "@/features/map/components/RoutesLayer";
import { SelectionToolbar } from "@/features/map/components/SelectionToolbar";
import { CENTER_OF_GERMANY } from "@/constants.ts";
import { LocationsLayer } from "@/features/map/components/LocationsLayer.tsx";
import { useOwnPosition } from "@/features/map/useOwnPosition";
import { useState } from "react";
import { useRoutes, type RouteResponse } from "@/features/routes/api";
import { useSearchParams } from "react-router-dom";
import { RouteEditor } from "@/features/map/components/RouteEditor";

export function MapPage() {
  const [editingDraft, setEditingRoute] = useState<RouteResponse | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: routes } = useRoutes();
  const editingRoute =
    editingDraft ??
    (searchParams.get("edit") === "1"
      ? (routes?.find(
          (route) => route.id === Number(searchParams.get("route")),
        ) ?? null)
      : null);
  function closeEditor() {
    setEditingRoute(null);
    if (searchParams.has("edit")) {
      setSearchParams(
        (previous) => {
          const next = new URLSearchParams(previous);
          next.delete("edit");
          return next;
        },
        { replace: true },
      );
    }
  }
  const {
    position,
    locationFailed,
    handlePosition,
    handleLocationError,
    handleLocationRequest,
  } = useOwnPosition();

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={CENTER_OF_GERMANY}
        zoom={6}
        maxZoom={28}
        zoomControl={false}
        attributionControl={false}
        style={{ height: "100%", width: "100%" }}
      >
        <MapViewport />
        <FocusRoute />
        <AttributionControl prefix={false} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={28}
          maxNativeZoom={19}
        />
        {!editingRoute && (
          <>
            <FieldsLayer />
            <LocationsLayer />
            <RoutesLayer />
          </>
        )}
        {editingRoute && (
          <RouteEditor
            key={editingRoute.id}
            route={editingRoute}
            onClose={closeEditor}
          />
        )}
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
          {!editingRoute && (
            <div className="map-tools flex flex-col-reverse gap-2">
              <MapCreateDialog />
            </div>
          )}
        </MapControls>
      </MapContainer>
      {!editingRoute && <SelectionToolbar onEditRoute={setEditingRoute} />}
    </div>
  );
}
