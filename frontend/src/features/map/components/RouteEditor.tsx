import { useEffect, useRef, useState } from "react";
import { Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useUpdateRouteMutation,
  type RouteResponse,
} from "@/features/routes/api";

type Point = [number, number];

function handleIcon(selected: boolean, midpoint = false) {
  return L.divIcon({
    className: "route-edit-handle",
    html: `<span style="display:grid;place-items:center;width:28px;height:28px;margin:8px;border:3px solid white;border-radius:50%;background:${selected ? "#772d0c" : midpoint ? "#4d6450" : "#17341d"};color:white;box-shadow:0 1px 5px #0005;font:20px sans-serif">${midpoint ? "+" : ""}</span>`,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });
}

const pointIcon = handleIcon(false);
const selectedIcon = handleIcon(true);
const midpointIcon = handleIcon(false, true);

export function RouteEditor({
  route,
  onClose,
}: {
  route: RouteResponse;
  onClose: () => void;
}) {
  const map = useMap();
  const panel = useRef<HTMLDivElement>(null);
  const [name, setName] = useState(route.name ?? "");
  const [history, setHistory] = useState<Point[][]>(() => [
    route.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
  ]);
  const [preview, setPreview] = useState<Point[] | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const update = useUpdateRouteMutation();
  const points = history[history.length - 1];
  const initialPoints = useRef(points);
  const displayed = preview ?? points;
  const valid =
    points.length >= 2 &&
    points.some(([lat, lng]) => lat !== points[0][0] || lng !== points[0][1]);
  const dirty = name.trim() !== (route.name ?? "") || history.length > 1;

  useEffect(() => {
    if (panel.current) {
      L.DomEvent.disableClickPropagation(panel.current);
      L.DomEvent.disableScrollPropagation(panel.current);
    }
    map.fitBounds(L.latLngBounds(initialPoints.current), {
      paddingTopLeft: [50, Math.min(240, map.getSize().y / 2)],
      paddingBottomRight: [50, 60],
      maxZoom: 18,
    });
  }, [map]);

  useEffect(() => {
    if (!dirty) return;
    const beforeUnload = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [dirty]);

  function commit(next: Point[]) {
    setHistory((previous) => [...previous, next]);
    setPreview(null);
  }

  function move(index: number, marker: L.Marker): Point[] {
    const { lat, lng } = marker.getLatLng().wrap();
    return points.map((point, i) => (i === index ? [lat, lng] : point));
  }

  function save() {
    if (!valid || update.isPending) return;
    update.mutate(
      {
        id: route.id,
        name: name.trim() || null,
        geometry: {
          type: "LineString",
          coordinates: points.map(([lat, lng]) => [lng, lat]),
        },
      },
      {
        onSuccess: () => {
          toast.success("Route gespeichert.");
          onClose();
        },
        onError: () =>
          toast.error(
            "Route konnte nicht gespeichert werden. Deine Änderungen bleiben erhalten.",
          ),
      },
    );
  }

  return (
    <>
      <Polyline
        positions={displayed}
        pathOptions={{ color: "#772d0c", weight: 7 }}
        interactive={false}
      />
      {points.map((point, index) => (
        <Marker
          key={`point-${index}`}
          position={point}
          icon={selected === index ? selectedIcon : pointIcon}
          draggable={!update.isPending}
          title={`Punkt ${index + 1} auswählen oder verschieben`}
          zIndexOffset={1000}
          eventHandlers={{
            click: () => {
              if (!update.isPending) setSelected(index);
            },
            drag: (event) => setPreview(move(index, event.target as L.Marker)),
            dragend: (event) => {
              commit(move(index, event.target as L.Marker));
              setSelected(index);
            },
          }}
        />
      ))}
      {!preview &&
        !update.isPending &&
        points.slice(1).map((point, index) => {
          const previous = points[index];
          const midpoint: Point = [
            (previous[0] + point[0]) / 2,
            (previous[1] + point[1]) / 2,
          ];
          return (
            <Marker
              key={`midpoint-${index}`}
              position={midpoint}
              icon={midpointIcon}
              title="Punkt einfügen"
              eventHandlers={{
                click: () => {
                  commit([
                    ...points.slice(0, index + 1),
                    midpoint,
                    ...points.slice(index + 1),
                  ]);
                  setSelected(index + 1);
                },
              }}
            />
          );
        })}
      <div
        ref={panel}
        className="absolute top-3 left-1/2 z-1000 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-xl bg-card p-3 shadow-card"
      >
        <label htmlFor="edit-route-name" className="text-label-md">
          Route bearbeiten · Name
        </label>
        <Input
          id="edit-route-name"
          value={name}
          maxLength={255}
          disabled={update.isPending}
          onChange={(event) => setName(event.target.value)}
          placeholder="Name (optional)"
        />
        <p className="my-2 text-xs text-muted-foreground">
          Punkte verschieben, mit + einfügen oder zum Entfernen antippen.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={history.length < 2 || update.isPending}
            onClick={() => {
              setHistory((previous) => previous.slice(0, -1));
              setSelected(null);
              setPreview(null);
            }}
          >
            Rückgängig
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={
              selected === null || points.length <= 2 || update.isPending
            }
            onClick={() => {
              commit(points.filter((_, index) => index !== selected));
              setSelected(null);
            }}
          >
            Punkt entfernen
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={update.isPending}
            onClick={onClose}
          >
            Abbrechen
          </Button>
          <Button
            size="sm"
            disabled={!valid || update.isPending || preview !== null}
            onClick={save}
          >
            {update.isPending ? "Speichern …" : "Speichern"}
          </Button>
        </div>
        {!valid && (
          <p role="alert" className="mt-2 text-sm text-destructive">
            Die Route braucht mindestens zwei unterschiedliche Punkte.
          </p>
        )}
      </div>
    </>
  );
}
