import { CompassIcon, Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    <Button
      variant={enabled && !paused ? "default" : "outline"}
      size="icon"
      className="shadow-card"
      aria-label={label}
      title={label}
      aria-pressed={enabled}
      disabled={paused}
      onClick={() => void toggle()}
    >
      {waiting && !paused ? (
        <Loader2Icon className="animate-spin" />
      ) : (
        <CompassIcon />
      )}
    </Button>
  );
}
