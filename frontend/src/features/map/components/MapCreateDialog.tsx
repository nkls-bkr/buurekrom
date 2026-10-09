import { useState } from "react";
import { LandPlotIcon, MapPinIcon, RouteIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DrawFieldButton } from "./DrawFieldButton";
import { DrawRouteButton } from "./DrawRouteButton";
import { DrawLocationButton } from "./DrawLocationButton";

export function MapCreateDialog() {
  const [open, setOpen] = useState(false);

  function run(action: () => void) {
    setOpen(false);
    action();
  }

  // Keep drawing and save dialogs mounted when the creation dialog closes.
  return (
    <DrawFieldButton>
      {(drawField, drawingField) => (
        <DrawRouteButton>
          {(drawRoute, drawingRoute) => (
            <DrawLocationButton>
              {(drawLocation, drawingLocation) => (
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger
                    render={
                      <Button
                        variant="secondary"
                        size="icon"
                        aria-label="Neues Element erstellen"
                        className={
                          drawingField || drawingRoute || drawingLocation
                            ? "hidden"
                            : "size-11 shadow-card"
                        }
                        disabled={
                          drawingField || drawingRoute || drawingLocation
                        }
                      />
                    }
                  >
                    <PlusIcon className="size-5" />
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Neues Element erstellen</DialogTitle>
                      <DialogDescription>
                        Was möchtest du auf der Karte hinzufügen?
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        className="h-auto min-h-12 justify-start gap-3 whitespace-normal px-4 py-3 text-left"
                        onClick={() => run(drawRoute)}
                      >
                        <RouteIcon /> Route zeichnen
                      </Button>
                      <Button
                        variant="outline"
                        className="h-auto min-h-12 justify-start gap-3 whitespace-normal px-4 py-3 text-left"
                        onClick={() => run(drawField)}
                      >
                        <LandPlotIcon /> Feld zeichnen
                      </Button>
                      <Button
                        variant="outline"
                        className="h-auto min-h-12 justify-start gap-3 whitespace-normal px-4 py-3 text-left"
                        onClick={() => run(drawLocation)}
                      >
                        <MapPinIcon /> Standort auf der Karte setzen
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </DrawLocationButton>
          )}
        </DrawRouteButton>
      )}
    </DrawFieldButton>
  );
}
