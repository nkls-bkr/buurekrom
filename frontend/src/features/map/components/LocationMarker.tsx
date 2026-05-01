import { useEffect } from "react";
import { CircleMarker } from "react-leaflet";
import type { LatLngLiteral } from "leaflet";
import { toast } from "sonner";
import { describeGeolocationError } from "@/features/map/geolocation";

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

  if (!position) return null;

  return (
    <>
      <CircleMarker
        center={position}
        radius={9}
        pathOptions={{
          color: "#ffffff",
          fillColor: "#ffffff",
          fillOpacity: 1,
          weight: 3,
        }}
      />
      <CircleMarker
        center={position}
        radius={6}
        pathOptions={{
          color: "#4285F4",
          fillColor: "#4285F4",
          fillOpacity: 1,
          weight: 0,
        }}
      />
    </>
  );
}
