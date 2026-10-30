import type { LatLngLiteral } from "leaflet";
import { EllipsisIcon, Loader2Icon, NavigationIcon } from "lucide-react";
import { useMap } from "react-leaflet";
import { Button } from "@/components/ui/button";
import { DialogActionButton } from "@/components/ui/dialog-action-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCompass } from "@/features/map/useCompass";
import { useFollowPosition } from "@/features/map/useFollowPosition";
import { CompassButton } from "./CompassButton";
import { ScreenWakeLockButton } from "./ScreenWakeLockButton";
import { useScreenWakeLock } from "@/features/map/useScreenWakeLock";
import { LocateButton } from "./LocateButton";

interface Props {
  position: LatLngLiteral | null;
  locationFailed: boolean;
  editing?: boolean;
  onPosition: (position: LatLngLiteral) => void;
  onError: () => void;
  onRequest: () => void;
}

export function MapNavigationControls({
  position,
  locationFailed,
  editing = false,
  onPosition,
  onError,
  onRequest,
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
    <Dialog>
      <DialogTrigger
        render={
          <Button
            variant={enabled && !compass.paused ? "default" : "outline"}
            size="icon"
            className="shadow-card"
            aria-label="Navigation und Kartenoptionen öffnen"
            title="Navigation und Kartenoptionen"
          />
        }
      >
        <EllipsisIcon />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Navigation und Karte</DialogTitle>
          <DialogDescription>
            Steuere die Navigation, die Kartenausrichtung und dein Display.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <DialogActionButton
            variant={enabled && !compass.paused ? "default" : "outline"}
            aria-label={label}
            title={label}
            aria-pressed={enabled}
            disabled={compass.paused}
            onClick={() => void toggleNavigation()}
          >
            {enabled && waiting && !compass.paused ? (
              <Loader2Icon data-icon="inline-start" className="animate-spin" />
            ) : (
              <NavigationIcon data-icon="inline-start" />
            )}
            {label}
          </DialogActionButton>
          <CompassButton {...compass} />
          <LocateButton
            position={position}
            failed={locationFailed}
            onPosition={onPosition}
            onError={onError}
            onRequest={onRequest}
          />
          <ScreenWakeLockButton {...wakeLock} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
