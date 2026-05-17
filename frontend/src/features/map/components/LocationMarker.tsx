import { useEffect, useMemo } from "react";
import { CircleMarker, Marker, Pane } from "react-leaflet";
import L, { type LatLngLiteral } from "leaflet";
import { toast } from "sonner";
import { describeGeolocationError } from "@/features/map/geolocation";
import {
  USER_LOCATION_PANE,
  Z_INDEX_USER_LOCATION_PANE,
} from "@/shared/z-index.layers.ts";

interface Props {
  position: LatLngLiteral | null;
  onPosition: (pos: LatLngLiteral) => void;
  onError?: () => void;
}

export function LocationMarker({ position, onPosition, onError }: Props) {
  useEffect(() => {
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        onPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (error) => {
        toast.error(describeGeolocationError(error));
        onError?.();
      },
      { enableHighAccuracy: true },
    );
    return () => navigator.geolocation.clearWatch(id);
  }, [onPosition, onError]);

  const pulseIcon = useMemo(
    () =>
      L.divIcon({
        className: "pointer-events-none",
        html: '<span class="block size-10 -mt-5 -ml-5 rounded-full bg-[#4285F4] animate-position-pulse will-change-transform"></span>',
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      }),
    [],
  );

  if (!position) return null;

  return (
    <Pane
      name={USER_LOCATION_PANE}
      style={{ zIndex: Z_INDEX_USER_LOCATION_PANE }}
    >
      <Marker
        position={position}
        pane={USER_LOCATION_PANE}
        icon={pulseIcon}
        interactive={false}
      />
      <CircleMarker
        center={position}
        radius={9}
        pane={USER_LOCATION_PANE}
        pathOptions={{
          color: "#ffffff",
          fillColor: "#ffffff",
          fillOpacity: 1,
          weight: 3,
        }}
        interactive={false}
      />
      <CircleMarker
        center={position}
        radius={6}
        pane={USER_LOCATION_PANE}
        pathOptions={{
          color: "#4285F4",
          fillColor: "#4285F4",
          fillOpacity: 1,
          weight: 0,
        }}
        interactive={false}
      />
    </Pane>
  );
}
