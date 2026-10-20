import { useState } from "react";
import { LandPlotIcon, MapPinIcon, RouteIcon, PlusIcon } from "lucide-react";
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
import { DrawFieldButton } from "./DrawFieldButton";
import { DrawLocationButton } from "./DrawLocationButton";

export function MapCreateDialog({
  onCreateRoute,
}: {
  onCreateRoute: () => void;
}) {
  const [open, setOpen] = useState(false);

  function run(action: () => void) {
    setOpen(false);
    action();
  }

  // Keep drawing and save dialogs mounted when the creation dialog closes.
  return (
    <DrawFieldButton>
      {(drawField, drawingField) => (
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
                      drawingField || drawingLocation
                        ? "hidden"
                        : "size-11 shadow-card"
                    }
                    disabled={drawingField || drawingLocation}
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
                  <DialogActionButton onClick={() => run(onCreateRoute)}>
                    <RouteIcon /> Route zeichnen
                  </DialogActionButton>
                  <DialogActionButton onClick={() => run(drawField)}>
                    <LandPlotIcon /> Feld zeichnen
                  </DialogActionButton>
                  <DialogActionButton onClick={() => run(drawLocation)}>
                    <MapPinIcon /> Standort auf der Karte setzen
                  </DialogActionButton>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </DrawLocationButton>
      )}
    </DrawFieldButton>
  );
}
