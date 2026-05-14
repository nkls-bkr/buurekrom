import { useState, useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import "@geoman-io/leaflet-geoman-free";
import type L from "leaflet";
import { PenLineIcon, XIcon } from "lucide-react";
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
import { useCreateFieldMutation } from "@/features/fields/api";

export function DrawFieldButton() {
  const map = useMap();
  const [drawing, setDrawing] = useState(false);
  const [pendingLayer, setPendingLayer] = useState<L.Layer | null>(null);
  const [name, setName] = useState("");
  const createField = useCreateFieldMutation();
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    map.pm.setLang("de");
  }, [map]);

  function startDraw() {
    map.pm.enableDraw("Polygon", {
      snappable: false,
      allowSelfIntersection: false,
      finishOn: "dblclick",
    });
    setDrawing(true);

    map.once("pm:create", ({ layer }: { layer: L.Layer }) => {
      map.pm.disableDraw();
      setDrawing(false);
      setPendingLayer(layer);
      map.removeLayer(layer);
    });
  }

  function cancelDraw() {
    map.pm.disableDraw();
    setDrawing(false);
  }

  function cancelSave() {
    setPendingLayer(null);
    setName("");
  }

  function handleSave() {
    if (!pendingLayer || !name.trim()) return;

    const geojson = (pendingLayer as L.Polygon).toGeoJSON();
    const geometry = geojson.geometry as {
      type: "Polygon";
      coordinates: number[][][];
    };

    createField.mutate(
      { name: name.trim(), geometry },
      {
        onSuccess: () => {
          toast.success(`Feld „${name.trim()}" gespeichert.`);
          setPendingLayer(null);
          setName("");
        },
        onError: () => {
          toast.error("Feld konnte nicht gespeichert werden.");
        },
      },
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
          aria-label="Feld zeichnen"
        >
          <PenLineIcon className="size-4" />
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
        open={!!pendingLayer}
        onOpenChange={(open) => !open && cancelSave()}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Feld benennen</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor="field-name">Name</Label>
            <Input
              id="field-name"
              ref={nameInputRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              placeholder="z. B. Nordfeld"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={cancelSave}>
              Abbrechen
            </Button>
            <Button
              onClick={handleSave}
              disabled={!name.trim() || createField.isPending}
            >
              {createField.isPending ? "Speichern …" : "Speichern"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
