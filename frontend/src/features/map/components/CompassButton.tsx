import { CompassIcon, Loader2Icon } from "lucide-react";
import { DialogActionButton } from "@/components/ui/dialog-action-button";
import type { useCompass } from "@/features/map/useCompass";

export function CompassButton({
  status,
  paused,
  toggle,
}: Pick<ReturnType<typeof useCompass>, "status" | "paused" | "toggle">) {
  const enabled = status !== "off";
  const waiting = status === "requesting" || status === "waiting";
  const label = paused
    ? "Kompass beim Zeichnen pausiert"
    : waiting
      ? "Kompass wird ermittelt – abbrechen"
      : enabled
        ? "Kompass ausschalten und Karte nach Norden ausrichten"
        : "Karte nach Kompass ausrichten";

  return (
    <DialogActionButton
      variant={enabled && !paused ? "default" : "outline"}
      aria-label={label}
      title={label}
      aria-pressed={enabled}
      disabled={paused}
      onClick={() => void toggle()}
    >
      {waiting && !paused ? (
        <Loader2Icon data-icon="inline-start" className="animate-spin" />
      ) : (
        <CompassIcon data-icon="inline-start" />
      )}
      {label}
    </DialogActionButton>
  );
}
