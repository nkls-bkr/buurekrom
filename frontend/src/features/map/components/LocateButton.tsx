import { Loader2Icon, LocateIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LatLngLiteral } from "leaflet";
import { useLocate } from "@/features/map/useLocate";

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
  const { requesting, locate } = useLocate({
    position,
    onPosition,
    onError,
    onRequest,
  });
  const loading = (!position && !failed) || requesting;

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={locate}
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
