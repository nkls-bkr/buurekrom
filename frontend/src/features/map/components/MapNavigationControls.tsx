import type { LatLngLiteral } from "leaflet";
import { Loader2Icon, NavigationIcon } from "lucide-react";
import { useMap } from "react-leaflet";
import { Button } from "@/components/ui/button";
import { useCompass } from "@/features/map/useCompass";
import { useFollowPosition } from "@/features/map/useFollowPosition";
import { CompassButton } from "./CompassButton";
import { ScreenWakeLockButton } from "./ScreenWakeLockButton";
import { useScreenWakeLock } from "@/features/map/useScreenWakeLock";

interface Props {
  position: LatLngLiteral | null;
  locationFailed: boolean;
  editing?: boolean;
}

export function MapNavigationControls({
  position,
  locationFailed,
  editing = false,
}: Props) {
  const map = useMap();
  const compass = useCompass(map, editing);
  const wakeLock = useScreenWakeLock();
  const enabled = compass.mode === "navigation" && compass.status !== "off";
  const waitingForPosition = !position || locationFailed;
  const waiting = compass.status !== "active" || waitingForPosition;
  async function toggleNavigation() {
    const started = await compass.toggle("navigation");
    if (started) wakeLock.enable();
  }
  useFollowPosition(
    map,
    enabled &&
      compass.status === "active" &&
      !compass.paused &&
      !waitingForPosition,
    position,
  );
  const label = compass.paused
    ? "Navigationsmodus beim Zeichnen pausiert"
    : !enabled
      ? "Navigationsmodus einschalten"
      : waitingForPosition
        ? "Navigationsmodus wartet auf Standort – ausschalten"
        : waiting
          ? "Navigationsmodus wartet auf Kompass – ausschalten"
          : "Navigationsmodus ausschalten";

  return (
    <>
      <ScreenWakeLockButton {...wakeLock} />
      <CompassButton {...compass} />
      <Button
        variant={enabled && !compass.paused ? "default" : "outline"}
        size="icon"
        className="shadow-card"
        aria-label={label}
        title={label}
        aria-pressed={enabled}
        disabled={compass.paused}
        onClick={() => void toggleNavigation()}
      >
        {enabled && waiting && !compass.paused ? (
          <Loader2Icon className="animate-spin" />
        ) : (
          <NavigationIcon />
        )}
      </Button>
    </>
  );
}
