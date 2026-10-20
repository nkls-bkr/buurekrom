import { useEffect, useMemo } from "react";
import { Marker, Pane } from "react-leaflet";
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
    if (!navigator.geolocation) {
      toast.error(
        "Standortzugriff ist nicht verfügbar. Öffne die App über HTTPS.",
      );
      onError?.();
      return;
    }
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        onPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (error) => {
        toast.error(describeGeolocationError(error));
        onError?.();
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
    );
    return () => navigator.geolocation.clearWatch(id);
  }, [onPosition, onError]);

  const locationIcon = useMemo(
    () =>
      L.divIcon({
        className: "user-location-marker",
        html: '<span class="user-location-pulse animate-position-pulse"></span><span class="user-location-dot"></span>',
        iconSize: [18, 18],
        iconAnchor: [9, 9],
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
        icon={locationIcon}
        interactive={false}
        keyboard={false}
      />
    </Pane>
  );
}
