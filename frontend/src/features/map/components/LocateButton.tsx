import { useState } from "react";
import { useMap } from "react-leaflet";
import { Loader2Icon, LocateIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { LatLngLiteral } from "leaflet";
import { describeGeolocationError } from "@/features/map/geolocation";

interface Props {
  position: LatLngLiteral | null;
  failed?: boolean;
  onPosition?: (pos: LatLngLiteral) => void;
  onError?: () => void;
  onRequest?: () => void;
}

export function LocateButton({
  position,
  failed = false,
  onPosition,
  onError,
  onRequest,
}: Props) {
  const map = useMap();
  const [requesting, setRequesting] = useState(false);
  const loading = (!position && !failed) || requesting;

  function handleLocate() {
    if (position) {
      map.flyTo(position, 16, { animate: false });
      map.once("moveend", () => {
        map.setZoom(16);
      });
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
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleLocate}
      disabled={loading}
      className="shadow-card"
      aria-label={
        loading
          ? "Standort wird ermittelt …"
          : "Zum aktuellen Standort springen"
      }
    >
      {loading ? (
        <Loader2Icon className="size-4 animate-spin" />
      ) : (
        <LocateIcon className="size-4" />
      )}
    </Button>
  );
}
