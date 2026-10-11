import { type ReactNode, useEffect, useState } from "react";
import { useMap } from "react-leaflet";
import "@geoman-io/leaflet-geoman-free";
import L from "leaflet";

type PmCreateHandler = (event: { layer: L.Layer }) => void;
import { XIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCreateRouteMutation } from "@/features/routes/api";

export function DrawRouteButton({
  children,
}: {
  children: (start: () => void, drawing: boolean) => ReactNode;
}) {
  const map = useMap();
  const [isOpen, setOpen] = useState(false);
  const [drawing, setDrawing] = useState(false);
  const [pendingLayer, setPendingLayer] = useState<L.Layer | null>(null);
  const [name, setName] = useState("");
  const createRoute = useCreateRouteMutation();

  function startDraw() {
    map.pm.enableDraw("Line", {
      snappable: false,
      finishOn: "dblclick",
      allowSelfIntersection: true,
      tooltips: false,
    });
    setDrawing(true);
  }

  useEffect(() => {
    if (!drawing) return;

    const handler: PmCreateHandler = ({ layer }) => {
      map.pm.disableDraw();
      setDrawing(false);
      setPendingLayer(layer);
      map.removeLayer(layer);
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
    setPendingLayer(null);
    setName("");
    setOpen(false);
  }

  function handleSave() {
    if (!pendingLayer) return;

    const geojson = (pendingLayer as L.Polyline).toGeoJSON();
    const geometry = geojson.geometry as {
      type: "LineString";
      coordinates: number[][];
    };
    const trimmedName = name.trim();

    createRoute.mutate(
      { name: trimmedName ? trimmedName : null, geometry },
      {
        onSuccess: () => {
          toast.success(
            trimmedName
              ? `Route „${trimmedName}" gespeichert.`
              : "Route gespeichert.",
          );
          setPendingLayer(null);
          setName("");
        },
        onError: () => {
          toast.error("Route konnte nicht gespeichert werden.");
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
            Zum Abschließen den letzten Punkt erneut antippen.
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
          <DialogHeader>
            <DialogTitle>Route benennen</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor="route-name">Name (optional)</Label>
            <Input
              id="route-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              placeholder="z. B. Zufahrt Nord"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={cancelSave}>
              Abbrechen
            </Button>
            <Button onClick={handleSave} disabled={createRoute.isPending}>
              {createRoute.isPending ? "Speichern …" : "Speichern"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
