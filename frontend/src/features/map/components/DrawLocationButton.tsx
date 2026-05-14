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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateLocationMutation } from "@/features/location/api.ts";
import { LOCATION_ICON } from "@/features/map/components/locationIcon";

export function DrawLocationButton() {
  const map = useMap();
  const [drawing, setDrawing] = useState(false);
  const [pendingGeometry, setPendingGeometry] = useState<Point | null>(null);
  const [name, setName] = useState("");
  const result = useCreateLocationMutation();

  function startDraw() {
    map.pm.enableDraw("Marker", {
      snappable: false,
      markerStyle: { icon: LOCATION_ICON },
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
    setName("");
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!pendingGeometry || !name.trim()) return;
    result.mutate(
      { name: name.trim(), geometry: pendingGeometry },
      { onSuccess: cancelSave },
    );
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
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle>Standort benennen</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-2">
              <Label htmlFor="location-name">Name</Label>
              <Input
                id="location-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="z. B. Hofstelle"
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={cancelSave}>
                Abbrechen
              </Button>
              <Button type="submit" disabled={!name.trim() || result.isPending}>
                {result.isPending ? "Speichern …" : "Speichern"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
