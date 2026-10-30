import { Loader2Icon, LocateIcon } from "lucide-react";
import { DialogActionButton } from "@/components/ui/dialog-action-button";
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
    <DialogActionButton
      variant="outline"
      onClick={locate}
      disabled={loading}
      aria-label={
        loading
          ? "Standort wird ermittelt …"
          : "Zum aktuellen Standort springen"
      }
    >
      {loading ? (
        <Loader2Icon data-icon="inline-start" className="animate-spin" />
      ) : (
        <LocateIcon data-icon="inline-start" />
      )}
      {loading
        ? "Standort wird ermittelt …"
        : "Zum aktuellen Standort springen"}
    </DialogActionButton>
  );
}
