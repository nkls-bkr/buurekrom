import { useRef, useState } from "react";
import { useMap } from "react-leaflet";
import "@geoman-io/leaflet-geoman-free";
import L from "leaflet";

type PmCreateHandler = (event: { layer: L.Layer }) => void;
import { RouteIcon, XIcon } from "lucide-react";
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

export function DrawRouteButton() {
  const map = useMap();
  const [isOpen, setOpen] = useState(false);
  const [drawing, setDrawing] = useState(false);
  const [pendingLayer, setPendingLayer] = useState<L.Layer | null>(null);
  const [name, setName] = useState("");
  const createHandlerRef = useRef<PmCreateHandler | null>(null);
  const createRoute = useCreateRouteMutation();

  function startDraw() {
    map.pm.enableDraw("Line", {
      snappable: false,
      finishOn: "dblclick",
      allowSelfIntersection: true,
      tooltips: false,
    });
    setDrawing(true);

    const handler: PmCreateHandler = ({ layer }) => {
      createHandlerRef.current = null;
      map.pm.disableDraw();
      setDrawing(false);
      setPendingLayer(layer);
      map.removeLayer(layer);
      setOpen(true);
    };
    createHandlerRef.current = handler;
    map.once("pm:create", handler);
  }

  function cancelDraw() {
    if (createHandlerRef.current) {
      map.off("pm:create", createHandlerRef.current);
      createHandlerRef.current = null;
    }
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
      {!drawing && (
        <Button
          onClick={startDraw}
          variant="secondary"
          size="icon"
          className="shadow-card"
          aria-label="Route zeichnen"
        >
          <RouteIcon className="size-4" />
        </Button>
      )}

      {drawing && (
        <div className="fixed bottom-6 left-1/2 z-1000 flex -translate-x-1/2 flex-col items-center gap-3">
          <span className="rounded-full bg-card px-4 py-1.5 text-label-md shadow-card">
            Letzen Punkt erneut anklicken, um das Erstellen der Route zu beenden
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
