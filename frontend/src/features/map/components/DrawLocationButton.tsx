import { useState } from "react";
import { useMap } from "react-leaflet";
import "@geoman-io/leaflet-geoman-free";
import type L from "leaflet";
import type { Point } from "geojson";
import { MapPinIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCreateLocationMutation } from "@/features/location/api.ts";

export function DrawLocationButton() {
  const map = useMap();
  const [drawing, setDrawing] = useState(false);
  const [pendingGeometry, setPendingGeometry] = useState<Point | null>(null);
  const result = useCreateLocationMutation();

  function startDraw() {
    map.pm.enableDraw("Marker", {
      snappable: false,
    });
    setDrawing(true);

    map.once("pm:create", ({ layer }: { layer: L.Layer }) => {
      map.pm.disableDraw();
      setDrawing(false);
      map.removeLayer(layer);
      const marker = (layer as L.Marker).toGeoJSON();
      setPendingGeometry(marker.geometry);
    });
  }

  function cancelDraw() {
    map.pm.disableDraw();
    setDrawing(false);
  }

  function cancelSave() {
    setPendingGeometry(null);
  }

  return (
    <>
      {!drawing && (
        <Button
          variant="secondary"
          onClick={startDraw}
          size="icon"
          className="shadow-card"
          aria-label="Standort setzen"
        >
          <MapPinIcon className="size-4" />
        </Button>
      )}

      {drawing && (
        <div className="fixed bottom-6 left-1/2 z-1000 flex -translate-x-1/2 flex-col items-center gap-3">
          <span className="rounded-full bg-card px-4 py-1.5 text-label-md shadow-card">
            Tippe auf die Karte, um einen Standort zu setzen
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={cancelDraw}
            className="gap-2 shadow-card"
          >
            <XIcon className="size-4" />
            Abbrechen
          </Button>
        </div>
      )}

      <Dialog
        open={!!pendingGeometry}
        onOpenChange={(open) => !open && cancelSave()}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Standort benennen</DialogTitle>
          </DialogHeader>
          {/* TODO: form fields */}
          <DialogFooter>
            <Button variant="outline" onClick={cancelSave}>
              Abbrechen
            </Button>
            <Button disabled={result.isPending}>
              {result.isPending ? "Speichern …" : "Speichern"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
