import { type ReactNode, useEffect, useState } from "react";
import { useMap } from "react-leaflet";
import "@geoman-io/leaflet-geoman-free";
import type L from "leaflet";
import type { Point } from "geojson";

type PmCreateHandler = (event: { layer: L.Layer }) => void;
import { XIcon } from "lucide-react";
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

export function DrawLocationButton({
  children,
}: {
  children: (start: () => void, drawing: boolean) => ReactNode;
}) {
  const map = useMap();
  const [isOpen, setOpen] = useState(false);
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
  }

  useEffect(() => {
    if (!drawing) return;

    const handler: PmCreateHandler = ({ layer }) => {
      map.pm.disableDraw();
      setDrawing(false);
      map.removeLayer(layer);
      const marker = (layer as L.Marker).toGeoJSON();
      setPendingGeometry(marker.geometry);
      setOpen(true);
    };
    map.once("pm:create", handler);
    return () => {
      map.off("pm:create", handler);
      map.pm.disableDraw();
    };
  }, [drawing, map]);

  function cancelDraw() {
    map.pm.disableDraw();
    setDrawing(false);
    setOpen(false);
  }

  function cancelSave() {
    setPendingGeometry(null);
    setName("");
    setOpen(false);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!pendingGeometry || !name.trim()) return;
    result.mutate(
      { name: name.trim(), geometry: pendingGeometry },
      {
        onSuccess: () => {
          setPendingGeometry(null);
          setName("");
        },
      },
    );
    setOpen(false);
  }

  return (
    <>
      {children(startDraw, drawing)}

      {drawing && (
        <div className="drawing-actions fixed z-1000 flex flex-col items-center gap-2">
          <span className="rounded-xl bg-card px-3 py-2 text-center text-label-md shadow-card">
            Tippe auf die Karte, um den Standort zu setzen.
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

      <Dialog open={isOpen} onOpenChange={(open) => !open && cancelSave()}>
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
