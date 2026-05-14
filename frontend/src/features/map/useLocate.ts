import { useCallback, useState } from "react";
import { useMap } from "react-leaflet";
import { toast } from "sonner";
import type { LatLngLiteral } from "leaflet";
import { describeGeolocationError } from "@/features/map/geolocation";

interface Options {
  position: LatLngLiteral | null;
  onPosition?: (pos: LatLngLiteral) => void;
  onError?: () => void;
  onRequest?: () => void;
}

export function useLocate({
  position,
  onPosition,
  onError,
  onRequest,
}: Options) {
  const map = useMap();
  const [requesting, setRequesting] = useState(false);

  const locate = useCallback(() => {
    if (position) {
      map.flyTo(position, 16, { animate: false });
      map.once("moveend", () => map.setZoom(16));
      return;
    }
    onRequest?.();
    setRequesting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setRequesting(false);
        onPosition?.({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (error) => {
        setRequesting(false);
        toast.error(describeGeolocationError(error));
        onError?.();
      },
      { enableHighAccuracy: true },
    );
  }, [map, position, onPosition, onError, onRequest]);

  return { requesting, locate };
}
